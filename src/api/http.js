/**
 *  Axios HTTP 封装
 * Enterprise-grade Axios HTTP Client
 *
 * 功能特性 / Features:
 *  - 统一请求/响应拦截器
 *  - 自动携带 Token（Bearer）
 *  - Token 无感刷新（401 自动重试）
 *  - 请求取消（AbortController / CancelToken）
 *  - 请求防重复（幂等锁）
 *  - 自动重试（网络错误 / 5xx）
 *  - 文件上传（带进度回调）
 *  - 文件下载（Blob / 流）
 *  - 统一错误处理 & 错误码映射
 *  - 环境变量驱动的 baseURL / timeout
 *  - 请求日志（开发环境）
 *
 * @module api/http
 */

import axios from "axios";
import { ENV_CONFIG } from "@config/env";
import i18n from "@locales/index";
import { MAX_RETRY, getRetryDelay, shouldRetryRequest } from "./httpPolicy";
import { AUTH_EVENTS, authChannel, refreshMutex } from "./authChannel";
import {
    getRefreshRetryDelay,
    isUnrecoverableRefreshFailure,
    shouldRetryRefresh,
} from "./refreshFailurePolicy";
import { tokenStorage } from "./auth/tokenStorage";
import {
    extractBlobErrorMessage,
    getBizErrorMessage,
    getHttpErrorMessage,
    HttpError,
} from "./errors/normalizeHttpError";
import {
    addPendingRequest,
    buildRequestKey,
    cancelAllPendingRequests,
    removePendingRequest,
} from "./requestDedupe";
import { createSseReader } from "./sseReader";

export { buildRequestKey };
export { HttpError };
export { tokenStorage };

// ─────────────────────────────────────────────
// 1. 常量 & 配置
// ─────────────────────────────────────────────

/** 默认超时（毫秒） */
const DEFAULT_TIMEOUT = ENV_CONFIG.TIMEOUT;

/** Large file transfers must still terminate when the peer stalls. */
const DEFAULT_DOWNLOAD_TIMEOUT = 10 * 60 * 1000;

/** Methods that can be retried and deduplicated without replaying mutations. */

/** API 基础路径 */
const BASE_URL = ENV_CONFIG.BASE_URL;

/** 是否开发环境 */
const IS_DEV = ENV_CONFIG.IS_DEV;

/** 刷新 Token 的接口路径（相对 baseURL） */
const REFRESH_URL = "/api/auth/refresh";

/**
 * Refresh 专用超时（毫秒）。
 *
 * ⚠️ 必须与 `DEFAULT_TIMEOUT` 解耦，不能跟着 `VITE_REQUEST_TIMEOUT` 走。
 *
 * 原因：`DEFAULT_TIMEOUT` 开发环境是 15000、**生产环境是 30000**
 * （`.env.production` 把 `VITE_REQUEST_TIMEOUT` 调高了，因为普通接口里有慢请求）。
 * 而服务端的幂等 grace 只有 25s，它是按 refresh timeout = 15s 推导出来的
 * （V9 §35 / §36，登记在 `docs/contract-changes.yaml` 的
 * `refresh-grace-window.frontend_refresh_timeout_ms`）。
 *
 * 若这里直接用 `DEFAULT_TIMEOUT`，生产环境就会变成
 * `grace(25s) < refresh timeout(30s)`：第一次请求服务端已经轮换、但响应丢失时，
 * 客户端要等到 30s 才超时重试，而重试落在 grace 之外 → 服务端按
 * §39 分支 3「真正的 Reuse」处理 → **撤销整个会话族，用户被强制登出**。
 * 这正是 grace 存在的意义所要防住的场景，所以这个值属于 Contract。
 */
const REFRESH_TIMEOUT = 15000;

/** 最大自动重试次数（网络错误 / 5xx） */

/** 重试间隔基数（ms），指数退避：delay = BASE_RETRY_DELAY * 2^attempt */

/**
 * 全局 Toast 提示（由 App.jsx 的 ToastBridge 注册 window.__toast）
 * 在 axios 拦截器中直接调用，实现请求级别的错误/警告提示
 * @param {'success'|'error'|'warning'|'info'} type - toast 类型
 * @param {string} message - 提示消息
 */
function showToast(type, message) {
    window.__toast?.(type, message);
}

/**
 * 将会话降为真正未登录：清本地凭证、通知 UI。
 * 用于 access/refresh 失效等「登录已过期」场景，不用于登录接口账号密码错误。
 * 过期提示始终弹出（与请求的 _silent 无关）：静默只抑制该请求自身的业务错误 toast。
 */
function forceLoggedOut() {
    tokenStorage.clear();
    window.dispatchEvent(
        new CustomEvent("auth:logout", {
            detail: { reason: "session_expired" },
        }),
    );
    showToast(
        "warning",
        i18n.t("auth.sessionExpired", "登录已过期，请重新登录"),
    );
}

// ─────────────────────────────────────────────
// 6. Token 无感刷新（跨 Tab 协调见 V9 §44，失败分类见 §45，重试见 §46）
// ─────────────────────────────────────────────

/**
 * 本 Tab 是否正在刷新 Token。
 *
 * 只作为 **Tab 内锁**：它无法阻止另一个 Tab 同时刷新（§44）。
 * 跨 Tab 的互斥由 `refreshMutex` + 广播通道负责。
 */
let isRefreshing = false;

/** 本 Tab 发起的刷新结束后需要唤醒的挂起请求 */
let refreshSubscribers = [];

/** 由广播得知「别的 Tab 正在刷新」：本 Tab 不再自己发起 */
let remoteRefreshInFlight = false;

/** 等待别的 Tab 刷新结果的安全兜底定时器（防止对方崩溃导致永久挂起） */
let remoteRefreshTimer = null;

/**
 * 正在因为「收到别的 Tab 的登出」而做本地清理。
 *
 * 本地清理会派发 `auth:logout`，而本模块又把 `auth:logout` 转发到跨 Tab
 * 通道；如果不加这个开关，两个 Tab 会互相把登出事件弹回去，形成死循环。
 */
let suppressLogoutBroadcast = false;

/**
 * 等待别的 Tab 刷新结果的上限。
 * 超过这个时间还没收到结果，就当作暂时性失败放行，绝不无限等待。
 */
const REMOTE_REFRESH_TIMEOUT_MS = 15_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 「登录已过期」错误：只在会话**确实**不可恢复时使用。
 * @returns {HttpError}
 */
function sessionExpiredError() {
    return new HttpError(
        i18n.t("auth.sessionExpired", "登录已过期，请重新登录"),
        401,
        null,
        null,
    );
}

/**
 * 「暂时无法刷新会话」错误。
 *
 * §45 明确要求：后端暂时不可用时**不得**把它伪装成「登录过期」。
 * 所以这里用一个独立文案 + 非 401 状态，让调用方和用户都能区分
 * 「你的凭据还有效，只是服务端暂时不可用」与「你真的需要重新登录」。
 *
 * @param {any} [cause] 原始失败原因，便于排查
 * @returns {HttpError}
 */
function refreshUnavailableError(cause) {
    return new HttpError(
        i18n.t(
            "http.errors.refreshUnavailable",
            "暂时无法刷新会话，请稍后重试",
        ),
        503,
        null,
        cause ?? null,
    );
}

/**
 * 将失败请求加入刷新队列
 * @param {Function} callback - Token 刷新成功后的回调
 */
function subscribeTokenRefresh(onSuccess, onFailure) {
    refreshSubscribers.push({ onSuccess, onFailure });
}

/**
 * 通知所有等待刷新的请求
 * @param {string} newToken
 */
function notifyRefreshSubscribers(newToken) {
    refreshSubscribers.forEach(({ onSuccess }) => onSuccess(newToken));
    refreshSubscribers = [];
}

function rejectRefreshSubscribers(error) {
    refreshSubscribers.forEach(({ onFailure }) => onFailure(error));
    refreshSubscribers = [];
}

/**
 * 把一个 401 请求挂到刷新队列上，等拿到新 token 后重放。
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @returns {Promise<any>}
 */
function queueForRefresh(config) {
    return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
            (newToken) => {
                config.headers["Authorization"] = `Bearer ${newToken}`;
                config._retryRefresh = true;
                resolve(instance(config));
            },
            (refreshError) => {
                // 刷新发起方已经做过 forceLoggedOut，这里只跟着重置
                reject(
                    refreshError instanceof HttpError
                        ? refreshError
                        : sessionExpiredError(),
                );
            },
        );
    });
}

/** 开始等待别的 Tab 的刷新结果，并启动兜底定时器 */
function beginRemoteRefreshWait() {
    remoteRefreshInFlight = true;
    if (remoteRefreshTimer) clearTimeout(remoteRefreshTimer);
    remoteRefreshTimer = setTimeout(() => {
        remoteRefreshTimer = null;
        if (!remoteRefreshInFlight) return;
        // 对方一直没有回报：不能把用户永久挂在这里
        remoteRefreshInFlight = false;
        rejectRefreshSubscribers(refreshUnavailableError());
    }, REMOTE_REFRESH_TIMEOUT_MS);
}

/** 结束等待别的 Tab 的刷新结果 */
function endRemoteRefreshWait() {
    remoteRefreshInFlight = false;
    if (remoteRefreshTimer) {
        clearTimeout(remoteRefreshTimer);
        remoteRefreshTimer = null;
    }
}

/**
 * 响应来自其它 Tab 的会话事件（§44）。
 *
 * 注意：`BroadcastChannel` 与 `storage` 事件都不会回调到发布者自身，
 * 所以这里处理的一定是「别的 Tab」发生的事。
 */
authChannel.subscribe((event, payload) => {
    switch (event) {
        case AUTH_EVENTS.REFRESH_START:
            // 别的 Tab 已在刷新：本 Tab 不再发起，避免触发服务端的
            // Reuse 检测把整个会话族撤销
            if (!isRefreshing) beginRemoteRefreshWait();
            break;

        case AUTH_EVENTS.REFRESH_SUCCESS: {
            // 新 token 就写在共享的 localStorage 里，直接重读即可
            const token = tokenStorage.getToken();
            endRemoteRefreshWait();
            if (token) notifyRefreshSubscribers(token);
            break;
        }

        case AUTH_EVENTS.REFRESH_FAILED:
            endRemoteRefreshWait();
            if (payload?.unrecoverable) {
                forceLoggedOut();
                rejectRefreshSubscribers(sessionExpiredError());
            } else {
                // 暂时性失败：保留凭据，不跳登录页
                rejectRefreshSubscribers(refreshUnavailableError(payload?.cause));
            }
            break;

        case AUTH_EVENTS.LOGOUT:
            // 别的 Tab 登出 / 被强制登出：本 Tab 跟着降到未登录。
            // 期间屏蔽反向广播，否则两个 Tab 会把登出事件互相弹来弹去。
            endRemoteRefreshWait();
            suppressLogoutBroadcast = true;
            try {
                forceLoggedOut();
            } finally {
                suppressLogoutBroadcast = false;
            }
            rejectRefreshSubscribers(sessionExpiredError());
            break;

        default:
            break;
    }
});

/**
 * 本 Tab 的登出同样要通知其它 Tab。
 *
 * 之所以在这里监听 `auth:logout`（而不是去改 `authService.logout`）：
 * 登出有多个入口（用户点登出、刷新失败被强制登出、其它模块清理会话），
 * 它们最终都会派发这个事件。挂在这一个点上，既能覆盖所有入口，
 * 也让「跨 Tab 广播」只有 http.js 一个所有者。
 */
if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("auth:logout", (event) => {
        if (suppressLogoutBroadcast) return;
        authChannel.publish(AUTH_EVENTS.LOGOUT, {
            reason: event?.detail?.reason ?? "logout",
        });
    });
}

/**
 * 单次刷新尝试：发请求并把新凭据落盘。
 *
 * @param {string} refreshToken 本次刷新使用的 refresh token
 * @returns {Promise<{accessToken: string, refreshToken?: string}>}
 */
async function attemptRefresh(refreshToken) {
    // 使用原始 axios 避免循环拦截；显式超时，避免刷新挂起时拖垮排队请求。
    // 用 REFRESH_TIMEOUT 而不是 DEFAULT_TIMEOUT：见该常量的注释。
    const response = await axios.post(
        `${BASE_URL}${REFRESH_URL}`,
        {
            refreshToken,
        },
        {
            timeout: REFRESH_TIMEOUT,
        },
    );
    const body = response.data;
    const tokenData = body?.data;
    if ((body?.code !== 200 && body?.code !== 0) || !tokenData?.accessToken) {
        // 服务端 envelope 里的 code 就是它声明的状态码。用它构造错误，
        // 让失败分类看到真实语义，而不是被硬编码的 401 带偏成
        // 「会话不可恢复」——那会在后端 503 时把用户误踢下线。
        const declared = typeof body?.code === "number" ? body.code : 401;
        throw new HttpError(
            body?.message || i18n.t("auth.sessionExpired"),
            declared,
            body?.code,
            body,
        );
    }
    return tokenData;
}

/**
 * 执行 Token 刷新。
 *
 * 采用 §46 的**方案 A**：在函数内部显式重试一次，而不是给 refresh 请求
 * 打上 `_retryIdempotent` 去复用通用 `httpPolicy`。原因是通用策略的
 * 重试条件（网络错误 / 5xx）与 §45 的失败分类并不等价，硬塞进去会让
 * 两套语义互相污染。
 *
 * 重试时**复用同一个 refresh token**：服务端提供幂等 grace（§45），
 * 第一次尝试若已成功但响应丢失，grace 窗口内重放会拿到同一个 successor，
 * 不会被判成 Reuse。这正是这次重试安全的前提。
 *
 * @returns {Promise<string>} 新的 access token
 * @throws {HttpError} 会话不可恢复，或重试后仍然失败
 */
async function refreshAccessToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
        // 本地连 refresh token 都没有：会话确实没了
        throw new HttpError(
            i18n.t("http.errors.noRefreshToken"),
            401,
            null,
            null,
        );
    }

    let retriesDone = 0;
    for (;;) {
        try {
            const tokenData = await attemptRefresh(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = tokenData;
            // Rotate both credentials before notifying session observers so a
            // queued /me validation never sees a half-updated token pair.
            tokenStorage.setToken(accessToken, { notify: false });
            if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);
            window.dispatchEvent(
                new CustomEvent("auth:token-refreshed", {
                    detail: { token: accessToken },
                }),
            );
            return accessToken;
        } catch (error) {
            if (!shouldRetryRefresh(error, retriesDone)) throw error;
            retriesDone += 1;
            await sleep(getRefreshRetryDelay(retriesDone));
        }
    }
}

// ─────────────────────────────────────────────
// 7. 创建 Axios 实例
// ─────────────────────────────────────────────

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false, // 跨域携带 Cookie 时改为 true
});

// ─────────────────────────────────────────────
// 8. 请求拦截器
// ─────────────────────────────────────────────

instance.interceptors.request.use(
    (config) => {
        // 8.1 防重复请求（幂等锁）
        // 默认对所有方法防重复（GET/POST/PUT/DELETE/PATCH），
        // 可用 config.dedupe: false 关闭（上传/下载/SSE 已默认关闭）
        const shouldDedupe = config.dedupe ?? true;

        if (shouldDedupe) {
            addPendingRequest(config);
        }

        // 8.2 自动携带 Token
        const token = tokenStorage.getToken();
        if (token && config.withToken !== false) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        // 8.3 开发环境请求日志
        if (IS_DEV) {
            console.groupCollapsed(
                `%c[HTTP] ➤ ${config.method?.toUpperCase()} ${config.url}`,
                "color: #4ade80; font-weight: bold",
            );
            console.log("Headers:", config.headers);
            if (config.params) console.log("Params:", config.params);
            if (config.data) console.log("Body:", config.data);
            console.groupEnd();
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────
// 9. 响应拦截器
// ─────────────────────────────────────────────

instance.interceptors.response.use(
    // ── 9.1 成功响应 ──
    (response) => {
        removePendingRequest(response.config);

        const { data: body, config } = response;

        // 开发环境响应日志
        if (IS_DEV) {
            console.groupCollapsed(
                `%c[HTTP] ✓ ${config.method?.toUpperCase()} ${config.url}`,
                "color: #60a5fa; font-weight: bold",
            );
            console.log("Response:", body);
            console.groupEnd();
        }

        // 若后端返回 { code, data, message } 结构，统一解包
        if (body && typeof body === "object" && "code" in body) {
            if (body.code === 200 || body.code === 0) {
                // 若调用方设置 rawResponse: true，返回完整 body
                return config.rawResponse ? body : body.data;
            }
            // 业务错误
            const bizMsg = getBizErrorMessage(body.code, body.message);
            if (!config._silent) {
                showToast("error", bizMsg);
            }
            throw new HttpError(bizMsg, response.status, body.code, body);
        }

        // 非标准结构直接返回
        return body;
    },

    // ── 9.2 错误响应 ──
    async (error) => {
        const { config, response } = error;

        // 先清理幂等锁，再判断取消：被取消的请求同样要释放条目，避免 map 泄漏
        if (config) {
            removePendingRequest(config);
        }

        if (axios.isCancel(error)) {
            // 返回带标准标识的 rejection，让组件 catch 能识别并静默跳过
            const cancelError = new Error("Request cancelled");
            cancelError.name = "CanceledError";
            cancelError.code = "ERR_CANCELED";
            cancelError.isCancelled = true;
            return Promise.reject(cancelError);
        }

        // ── 9.2.1 Token 过期，无感刷新 / 强制未登录 ──
        const requestUrl = config?.url || "";
        const isLoginEndpoint = requestUrl.endsWith("/auth/login");
        const isRefreshEndpoint = requestUrl.endsWith("/auth/refresh");
        const skipAuthRecovery = Boolean(config?._skipAuthRecovery);
        // 主动登出等场景：跳过无感刷新与强制未登录提示，交给调用方清理
        if (response?.status === 401 && config && skipAuthRecovery) {
            // fall through to 9.2.3
        } else if (response?.status === 401 && config && isRefreshEndpoint) {
            // refresh 接口自身 401：refresh token 已失效 → 直接变为未登录
            forceLoggedOut();
            return Promise.reject(sessionExpiredError());
        } else if (response?.status === 401 && config && !isLoginEndpoint) {
            // 业务接口 401：先尝试无感刷新；已重试仍 401 或刷新失败 → 真正未登录
            // 登录接口 401 视为账号/验证码错误，不清理会话
            if (config._retryRefresh) {
                forceLoggedOut();
                return Promise.reject(sessionExpiredError());
            }

            // 本 Tab 正在刷新，或已从广播得知别的 Tab 在刷新 → 排队等结果
            if (isRefreshing || remoteRefreshInFlight) {
                return queueForRefresh(config);
            }

            // 先占本 Tab 的锁，再去做可能 await 的跨 Tab 互斥申请。
            // 顺序不能反：否则同一 tick 内的第二个 401 会在 await 期间
            // 看到 isRefreshing 仍为 false，于是两个请求都去刷新。
            isRefreshing = true;
            config._retryRefresh = true;

            let acquired = false;
            try {
                acquired = await refreshMutex.tryAcquire();
            } catch {
                // 互斥量本身出错不该阻断刷新，退回「自己刷新」
                acquired = false;
            }

            if (!acquired) {
                // 别的 Tab 正在刷新：本 Tab 不跟刷，否则会触发服务端
                // 的 Reuse 检测把整个会话族撤销（§44）
                isRefreshing = false;
                config._retryRefresh = false;
                beginRemoteRefreshWait();
                return queueForRefresh(config);
            }

            authChannel.publish(AUTH_EVENTS.REFRESH_START);

            let newToken = null;
            let refreshError = null;
            try {
                newToken = await refreshAccessToken();
            } catch (error) {
                refreshError = error;
            } finally {
                // 刷新已结束就立刻放开互斥，不要把它一直持有到
                // 重放的原请求返回为止，否则其它 Tab 会白等到超时
                isRefreshing = false;
                refreshMutex.release();
            }

            if (refreshError) {
                const unrecoverable =
                    isUnrecoverableRefreshFailure(refreshError);
                authChannel.publish(AUTH_EVENTS.REFRESH_FAILED, {
                    unrecoverable,
                });

                if (unrecoverable) {
                    forceLoggedOut();
                    const expired = sessionExpiredError();
                    rejectRefreshSubscribers(expired);
                    return Promise.reject(expired);
                }

                // §45 暂时性失败：保留本地凭据、不跳登录页，
                // 也**不**伪装成「登录过期」，而是给出独立文案
                const unavailable = refreshUnavailableError(refreshError);
                rejectRefreshSubscribers(unavailable);
                if (!config._silent) {
                    showToast("warning", unavailable.message);
                }
                return Promise.reject(unavailable);
            }

            authChannel.publish(AUTH_EVENTS.REFRESH_SUCCESS);
            notifyRefreshSubscribers(newToken);
            config.headers["Authorization"] = `Bearer ${newToken}`;
            return instance(config);
        }

        // ── 9.2.2 自动重试（网络错误 / 5xx） ──
        const shouldRetry = shouldRetryRequest(config, response);

        if (shouldRetry) {
            config._retryCount = (config._retryCount ?? 0) + 1;
            const delay = getRetryDelay(config._retryCount);

            if (IS_DEV) {
                console.warn(
                    `[HTTP] Retry ${config._retryCount}/${MAX_RETRY}, delay ${delay}ms`,
                    config.url,
                );
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
            return instance(config);
        }

        // ── 9.2.3 统一错误处理 ──
        const status = response?.status;
        const serverMsg = response?.data?.message;
        // 二进制错误响应（如 blob 下载失败）没有 message 字段，异步解析兜底
        const blobMsg = serverMsg
            ? ""
            : await extractBlobErrorMessage(response?.data);
        const message =
            serverMsg ||
            blobMsg ||
            getHttpErrorMessage(status) ||
            error.message ||
            i18n.t("http.errors.networkError");

        if (IS_DEV) {
            console.groupCollapsed(
                `%c[HTTP] ✗ ${config?.method?.toUpperCase()} ${config?.url} [${status ?? "Network Error"}]`,
                "color: #f87171; font-weight: bold",
            );
            console.error("Error:", error);
            console.groupEnd();
        }

        // 全局 Toast 提示（config._silent 可静默）
        // _skipAuthRecovery 的 401 由调用方接管提示，这里不再重复弹窗
        // 402 积分不足需要总是提示，让用户知道需要获取积分
        const shouldShowToast =
            !config?._silent ||
            status === 402 ||
            (status === 401 && !config?._skipAuthRecovery);
        if (shouldShowToast) {
            if (status === 401) {
                showToast("warning", message);
            } else if (status === 402) {
                showToast("warning", message);
            } else if (status >= 500 || !status) {
                showToast("error", message);
            } else if (status >= 400) {
                showToast("error", message);
            }
        }

        return Promise.reject(
            new HttpError(
                message,
                status,
                response?.data?.code,
                response?.data,
            ),
        );
    },
);

// ─────────────────────────────────────────────
// 10. 请求方法封装
// ─────────────────────────────────────────────

/**
 * GET 请求
 * @template T
 * @param {string} url
 * @param {Object} [params] - URL 查询参数
 * @param {import('axios').AxiosRequestConfig} [config] - 额外配置
 * @returns {Promise<T>}
 */
export function get(url, params, config) {
    return instance.get(url, { params, ...config });
}

/**
 * POST 请求
 * @template T
 * @param {string} url
 * @param {any} [data] - 请求体
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export function post(url, data, config) {
    return instance.post(url, data, config);
}

/**
 * Send a POST request whose response is Server-Sent Events, while preserving
 * the shared axios instance's auth and error handling behaviour.
 */
export function postStream(url, data, { onEvent, ...config } = {}) {
    const reader = createSseReader(onEvent);
    return instance
        .post(url, data, {
            ...config,
            dedupe: false,
            _skipRetry: true,
            timeout: 0,
            responseType: "text",
            // Spring uses the Accept header to select a handler. Declare SSE
            // explicitly instead of inheriting the default application/json.
            headers: {
                ...config.headers,
                Accept: "text/event-stream",
            },
            onDownloadProgress: reader.onDownloadProgress,
        })
        .then((response) => {
            reader.flush();
            return response;
        });
}

/** Subscribe to a resumable SSE endpoint with authorization headers. */
export function getStream(url, { onEvent, onProgress, ...config } = {}) {
    const reader = createSseReader(onEvent);
    const wrappedProgress = onProgress
        ? (progressEvent) => {
              onProgress(progressEvent);
              reader.onDownloadProgress(progressEvent);
          }
        : reader.onDownloadProgress;
    return instance
        .get(url, {
            ...config,
            dedupe: false,
            _skipRetry: true,
            timeout: 0,
            responseType: "text",
            headers: {
                ...config.headers,
                Accept: "text/event-stream",
            },
            onDownloadProgress: wrappedProgress,
        })
        .then((response) => {
            reader.flush();
            return response;
        });
}

/**
 * PUT 请求
 * @template T
 * @param {string} url
 * @param {any} [data]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export function put(url, data, config) {
    return instance.put(url, data, config);
}

/**
 * PATCH 请求（部分更新）
 * @template T
 * @param {string} url
 * @param {any} [data]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export function patch(url, data, config) {
    return instance.patch(url, data, config);
}

/**
 * DELETE 请求
 * @template T
 * @param {string} url
 * @param {Object} [params]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export function del(url, params, config) {
    return instance.delete(url, { params, ...config });
}

/**
 * HEAD 请求（获取响应头）
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function head(url, config) {
    return instance.head(url, { ...config, rawResponse: true });
}

/**
 * OPTIONS 请求（CORS 预检）
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export function options(url, config) {
    return instance.options(url, { ...config, rawResponse: true });
}

// ─────────────────────────────────────────────
// 11. 文件上传
// ─────────────────────────────────────────────

/**
 * 文件上传（multipart/form-data）
 * @param {string} url
 * @param {File | File[] | FormData} fileOrFormData - 文件或已构建的 FormData
 * @param {Object} [options]
 * @param {string} [options.fieldName='file'] - 文件字段名
 * @param {Record<string, any>} [options.extraData] - 附加表单字段
 * @param {Function} [options.onProgress] - 上传进度回调 (percent: number) => void
 * @param {import('axios').AxiosRequestConfig} [options.config] - 额外 axios 配置
 * @returns {Promise<any>}
 */
export function upload(url, fileOrFormData, options = {}) {
    const {
        fieldName = "file",
        extraData = {},
        onProgress,
        config = {},
    } = options;

    let formData;
    if (fileOrFormData instanceof FormData) {
        formData = fileOrFormData;
    } else {
        formData = new FormData();
        const files = Array.isArray(fileOrFormData)
            ? fileOrFormData
            : [fileOrFormData];
        files.forEach((file) => formData.append(fieldName, file));
        Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
    }

    const { headers = {}, ...restConfig } = config;

    return instance.post(url, formData, {
        ...restConfig,
        // 合并而非覆盖：调用方传的 headers 不会破坏 multipart 的 Content-Type
        headers: { "Content-Type": "multipart/form-data", ...headers },
        onUploadProgress: onProgress
            ? (progressEvent) => {
                  const percent = progressEvent.total
                      ? Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        )
                      : 0;
                  onProgress(percent, progressEvent);
              }
            : undefined,
        // 上传通常耗时较长，单独设置超时
        timeout: 0,
        // 上传请求不做防重复
        dedupe: false,
    });
}

// ─────────────────────────────────────────────
// 12. 文件下载
// ─────────────────────────────────────────────

/**
 * 文件下载（Blob 流）
 * @param {string} url
 * @param {Object} [options]
 * @param {string} [options.filename] - 保存的文件名（不传则从响应头解析）
 * @param {Object} [options.params] - URL 查询参数
 * @param {'get'|'post'} [options.method='get'] - 请求方法
 * @param {any} [options.data] - POST 请求体
 * @param {Function} [options.onProgress] - 下载进度回调 (percent: number) => void
 * @param {import('axios').AxiosRequestConfig} [options.config]
 * @returns {Promise<void>}
 */
export async function download(url, options = {}) {
    const {
        filename,
        params,
        method = "get",
        data,
        onProgress,
        config = {},
    } = options;

    const response = await instance.request({
        url,
        method,
        params,
        data,
        responseType: "blob",
        timeout: DEFAULT_DOWNLOAD_TIMEOUT,
        dedupe: false,
        onDownloadProgress: onProgress
            ? (progressEvent) => {
                  const percent = progressEvent.total
                      ? Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        )
                      : 0;
                  onProgress(percent, progressEvent);
              }
            : undefined,
        ...config,
    });

    // 从 Content-Disposition 解析文件名
    const resolvedFilename =
        filename ||
        (() => {
            const disposition =
                response?.headers?.["content-disposition"] ?? "";
            const match = disposition.match(
                /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i,
            );
            return match ? decodeURIComponent(match[1]) : "download";
        })();

    // 触发浏览器下载
    const blob = response instanceof Blob ? response : new Blob([response]);
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = resolvedFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
}

// ─────────────────────────────────────────────
// 13. 并发请求
// ─────────────────────────────────────────────

/**
 * 并发多个请求（等同 Promise.all，但语义更清晰）
 * @param {Promise[]} requests
 * @returns {Promise<any[]>}
 */
export function all(requests) {
    return Promise.all(requests);
}

/**
 * 并发多个请求，任意一个成功即返回
 * @param {Promise[]} requests
 * @returns {Promise<any>}
 */
export function race(requests) {
    return Promise.race(requests);
}

// ─────────────────────────────────────────────
// 14. 请求取消
// ─────────────────────────────────────────────

/**
 * 创建可取消的请求控制器
 * @returns {{ signal: AbortSignal, cancel: () => void }}
 *
 * @example
 * const { signal, cancel } = createCancelToken();
 * get('/api/data', {}, { signal });
 * // 取消请求
 * cancel();
 */
export function createCancelToken() {
    const controller = new AbortController();
    return {
        signal: controller.signal,
        cancel: (reason = i18n.t("http.errors.cancelled")) =>
            controller.abort(reason),
    };
}

/**
 * 取消所有正在进行的请求（页面切换时调用）
 */
export function cancelAllRequests() {
    cancelAllPendingRequests();
}

// ─────────────────────────────────────────────
// 15. 默认导出
// ─────────────────────────────────────────────

/** 原始 axios 实例（用于特殊场景） */
export { instance as axiosInstance };

/** 默认导出：常用方法集合 */
const http = {
    get,
    getStream,
    post,
    postStream,
    put,
    patch,
    delete: del,
    head,
    options,
    upload,
    download,
    all,
    race,
    createCancelToken,
    cancelAllRequests,
    instance: instance,
};

export default http;
