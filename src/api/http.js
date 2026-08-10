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

import axios from 'axios';
import { ENV_CONFIG } from '@config/env';
import i18n from '@locales/index';
import {
    MAX_RETRY,
    getRetryDelay,
    shouldRetryRequest,
} from './httpPolicy';

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

/** Token / 会话存储 key */
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

/** 刷新 Token 的接口路径（相对 baseURL） */
const REFRESH_URL = '/auth/refresh';

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

// ─────────────────────────────────────────────
// 2. Token 工具
// ─────────────────────────────────────────────

export const tokenStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { token } }));
    },
    removeToken: () => localStorage.removeItem(TOKEN_KEY),

    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
    removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

    /** 清除全部登录态（token + 本地用户信息），与未登录一致 */
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    },
};

/**
 * 将会话降为真正未登录：清本地凭证、通知 UI。
 * 用于 access/refresh 失效等「登录已过期」场景，不用于登录接口账号密码错误。
 * 过期提示始终弹出（与请求的 _silent 无关）：静默只抑制该请求自身的业务错误 toast。
 */
function forceLoggedOut() {
    tokenStorage.clear();
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'session_expired' } }));
    showToast('warning', i18n.t('auth.sessionExpired', '登录已过期，请重新登录'));
}

// ─────────────────────────────────────────────
// 3. 错误码映射
// ─────────────────────────────────────────────

/** HTTP 状态码 → i18n key */
const HTTP_ERROR_KEYS = {
    400: 'http.errors.badRequest',
    401: 'http.errors.unauthorized',
    403: 'http.errors.forbidden',
    404: 'http.errors.notFound',
    405: 'http.errors.methodNotAllowed',
    408: 'http.errors.requestTimeout',
    409: 'http.errors.conflict',
    422: 'http.errors.unprocessable',
    429: 'http.errors.tooManyRequests',
    500: 'http.errors.internalError',
    502: 'http.errors.badGateway',
    503: 'http.errors.serviceUnavailable',
    504: 'http.errors.gatewayTimeout',
};

/** 业务错误码 → i18n key */
const BIZ_ERROR_KEYS = {
    1001: 'http.errors.invalidCredentials',
    1002: 'http.errors.accountDisabled',
    1003: 'http.errors.codeExpired',
    4001: 'http.errors.dataNotFound',
    4003: 'http.errors.noPermission',
    5000: 'http.errors.serverBusy',
};

/** 获取 HTTP 错误提示（运行时解析翻译） */
const getHttpErrorMessage = (status) => {
    const key = HTTP_ERROR_KEYS[status];
    return key ? i18n.t(key) : '';
};

/** 获取业务错误提示（运行时解析翻译） */
const getBizErrorMessage = (code, fallback) => {
    const key = BIZ_ERROR_KEYS[code];
    return key ? i18n.t(key) : (fallback || i18n.t('http.errors.bizDefault'));
};

/** 从 Blob 错误响应（下载等二进制场景）中解析服务端 message */
async function extractBlobErrorMessage(data) {
    if (!data || typeof data.text !== 'function') return '';
    try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        return typeof parsed?.message === 'string' ? parsed.message : '';
    } catch {
        return '';
    }
}

// ─────────────────────────────────────────────
// 4. 自定义错误类
// ─────────────────────────────────────────────

export class HttpError extends Error {
    /**
     * @param {string} message - 错误信息
     * @param {number} [status] - HTTP 状态码
     * @param {number} [code] - 业务错误码
     * @param {any} [data] - 原始响应数据
     */
    constructor(message, status, code, data) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

// ─────────────────────────────────────────────
// 5. 请求防重复（幂等锁）
// ─────────────────────────────────────────────

/** 正在进行中的请求 Map：key → AbortController */
const pendingRequests = new Map();

/**
 * 生成请求唯一 key
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @returns {string}
 */
export function buildRequestKey(config) {
    let { method = '', url = '', params, data } = config;
    // 转换 data 为对象以保持 key 的一致性
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { /* Preserve non-JSON request bodies. */ }
    }
    return [
        method.toLowerCase(),
        url,
        JSON.stringify(params || {}),
        JSON.stringify(data || {}),
    ].join('|');
}

/**
 * 将请求加入幂等锁（若已存在则取消旧请求）
 * @param {import('axios').InternalAxiosRequestConfig} config
 */
function addPendingRequest(config) {
    const key = buildRequestKey(config);
    if (pendingRequests.has(key)) {
        const controller = pendingRequests.get(key);
        controller.abort('Dedupe: 相同的请求已存在，取消前一个');
        if (IS_DEV) console.debug(`%c[HTTP] ⚡ 重复请求已合并: ${config.url}`, 'color: #fb923c');
    }
    const controller = new AbortController();

    // If the caller provided a signal (e.g. component-level AbortController),
    // link it so that caller-initiated abort also aborts the dedup controller.
    if (config.signal) {
        const callerSignal = config.signal;
        if (callerSignal.aborted) {
            controller.abort(callerSignal.reason);
        } else {
            callerSignal.addEventListener(
                'abort',
                () => controller.abort(callerSignal.reason),
                { once: true }
            );
        }
    }

    config.signal = controller.signal;
    config._pendingRequestKey = key;
    config._pendingController = controller;
    pendingRequests.set(key, controller);
}

/**
 * 从幂等锁中移除请求
 * @param {import('axios').InternalAxiosRequestConfig} config
 */
function removePendingRequest(config) {
    const key = config?._pendingRequestKey ?? buildRequestKey(config);
    if (pendingRequests.get(key) === config?._pendingController) {
        pendingRequests.delete(key);
    }
}

// ─────────────────────────────────────────────
// 6. Token 无感刷新
// ─────────────────────────────────────────────

/** 是否正在刷新 Token */
let isRefreshing = false;

/** 等待 Token 刷新的请求队列 */
let refreshSubscribers = [];

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
 * 执行 Token 刷新
 * @returns {Promise<string>} 新的 access token
 */
async function refreshAccessToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
        throw new HttpError(i18n.t('http.errors.noRefreshToken'), 401, null, null);
    }
    // 使用原始 axios 避免循环拦截；显式超时，避免刷新挂起时拖垮排队请求
    const response = await axios.post(`${BASE_URL}${REFRESH_URL}`, {
        refreshToken,
    }, {
        timeout: DEFAULT_TIMEOUT,
    });
    const body = response.data;
    const tokenData = body?.data;
    if ((body?.code !== 200 && body?.code !== 0) || !tokenData?.accessToken) {
        throw new HttpError(
            body?.message || i18n.t('auth.sessionExpired'),
            401,
            body?.code,
            body
        );
    }
    const { accessToken, refreshToken: newRefreshToken } = tokenData;
    tokenStorage.setToken(accessToken);
    if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);
    return accessToken;
}

// ─────────────────────────────────────────────
// 7. 创建 Axios 实例
// ─────────────────────────────────────────────

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 8.3 开发环境请求日志
        if (IS_DEV) {
            console.groupCollapsed(
                `%c[HTTP] ➤ ${config.method?.toUpperCase()} ${config.url}`,
                'color: #4ade80; font-weight: bold'
            );
            console.log('Headers:', config.headers);
            if (config.params) console.log('Params:', config.params);
            if (config.data) console.log('Body:', config.data);
            console.groupEnd();
        }

        return config;
    },
    (error) => Promise.reject(error)
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
                'color: #60a5fa; font-weight: bold'
            );
            console.log('Response:', body);
            console.groupEnd();
        }

        // 若后端返回 { code, data, message } 结构，统一解包
        if (body && typeof body === 'object' && 'code' in body) {
            if (body.code === 200 || body.code === 0) {
                // 若调用方设置 rawResponse: true，返回完整 body
                return config.rawResponse ? body : body.data;
            }
            // 业务错误
            const bizMsg =
                getBizErrorMessage(body.code, body.message);
            if (!config._silent) {
                showToast('error', bizMsg);
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
            const cancelError = new Error('Request cancelled');
            cancelError.name = 'CanceledError';
            cancelError.code = 'ERR_CANCELED';
            cancelError.isCancelled = true;
            return Promise.reject(cancelError);
        }

        // ── 9.2.1 Token 过期，无感刷新 / 强制未登录 ──
        const requestUrl = config?.url || '';
        const isLoginEndpoint = requestUrl.endsWith('/auth/login');
        const isRefreshEndpoint = requestUrl.endsWith('/auth/refresh');
        const skipAuthRecovery = Boolean(config?._skipAuthRecovery);
        const sessionExpiredError = () =>
            new HttpError(i18n.t('auth.sessionExpired', '登录已过期，请重新登录'), 401, null, null);

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

            if (isRefreshing) {
                // 排队等待刷新完成
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(
                        (newToken) => {
                            config.headers['Authorization'] = `Bearer ${newToken}`;
                            config._retryRefresh = true;
                            resolve(instance(config));
                        },
                        (refreshError) => {
                            // 刷新已在主请求里 forceLoggedOut，排队请求只跟着重置
                            reject(refreshError instanceof HttpError
                                ? refreshError
                                : sessionExpiredError());
                        }
                    );
                });
            }

            config._retryRefresh = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                isRefreshing = false;
                notifyRefreshSubscribers(newToken);
                config.headers['Authorization'] = `Bearer ${newToken}`;
                return instance(config);
            } catch {
                isRefreshing = false;
                forceLoggedOut();
                const expired = sessionExpiredError();
                rejectRefreshSubscribers(expired);
                return Promise.reject(expired);
            }
        }

        // ── 9.2.2 自动重试（网络错误 / 5xx） ──
        const shouldRetry =
            shouldRetryRequest(config, response);

        if (shouldRetry) {
            config._retryCount = (config._retryCount ?? 0) + 1;
            const delay = getRetryDelay(config._retryCount);

            if (IS_DEV) {
                console.warn(
                    `[HTTP] Retry ${config._retryCount}/${MAX_RETRY}, delay ${delay}ms`,
                    config.url
                );
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
            return instance(config);
        }

        // ── 9.2.3 统一错误处理 ──
        const status = response?.status;
        const serverMsg = response?.data?.message;
        // 二进制错误响应（如 blob 下载失败）没有 message 字段，异步解析兜底
        const blobMsg = serverMsg ? '' : await extractBlobErrorMessage(response?.data);
        const message =
            serverMsg ||
            blobMsg ||
            getHttpErrorMessage(status) ||
            error.message ||
            i18n.t('http.errors.networkError');

        if (IS_DEV) {
            console.groupCollapsed(
                `%c[HTTP] ✗ ${config?.method?.toUpperCase()} ${config?.url} [${status ?? 'Network Error'}]`,
                'color: #f87171; font-weight: bold'
            );
            console.error('Error:', error);
            console.groupEnd();
        }

        // 全局 Toast 提示（config._silent 可静默）
        // _skipAuthRecovery 的 401 由调用方接管提示，这里不再重复弹窗
        if (!config?._silent && !(status === 401 && config?._skipAuthRecovery)) {
            if (status === 401) {
                showToast('warning', message);
            } else if (status >= 500 || !status) {
                showToast('error', message);
            } else if (status >= 400) {
                showToast('error', message);
            }
        }

        return Promise.reject(
            new HttpError(message, status, response?.data?.code, response?.data)
        );
    }
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
 * Creates an incremental SSE parser for Axios XHR download progress events.
 */
function createSseReader(onEvent) {
    let offset = 0;
    let buffer = '';

    const dispatch = (rawEvent) => {
        const lines = rawEvent.split(/\r?\n/);
        const id = lines.find((line) => line.startsWith('id:'))?.slice(3).trim();
        const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() || 'message';
        const dataLine = lines
            .filter((line) => line.startsWith('data:'))
            // SSE removes at most one optional space after the colon. Do not
            // trim the payload: a streamed token may itself be a space/newline.
            .map((line) => line.slice(5).replace(/^ /, ''))
            .join('\n');
        if (!dataLine || !onEvent) return;
        if (event === 'delta' || event === 'stage' || event === 'error') {
            onEvent({ id, event, data: dataLine });
            return;
        }
        try {
            onEvent({ id, event, data: JSON.parse(dataLine) });
        } catch {
            onEvent({ id, event, data: dataLine });
        }
    };

    return {
        onDownloadProgress: (progressEvent) => {
            const responseText = progressEvent.event?.target?.responseText;
            if (typeof responseText !== 'string') return;
            buffer += responseText.slice(offset);
            offset = responseText.length;
            const chunks = buffer.split(/\r?\n\r?\n/);
            buffer = chunks.pop() || '';
            chunks.forEach(dispatch);
        },
        flush: () => {
            if (buffer) dispatch(buffer);
            buffer = '';
        },
    };
}

/**
 * Send a POST request whose response is Server-Sent Events, while preserving
 * the shared axios instance's auth and error handling behaviour.
 */
export function postStream(url, data, { onEvent, ...config } = {}) {
    const reader = createSseReader(onEvent);
    return instance.post(url, data, {
        ...config,
        dedupe: false,
        _skipRetry: true,
        timeout: 0,
        responseType: 'text',
        // Spring uses the Accept header to select a handler. Declare SSE
        // explicitly instead of inheriting the default application/json.
        headers: {
            ...config.headers,
            Accept: 'text/event-stream',
        },
        onDownloadProgress: reader.onDownloadProgress,
    }).then((response) => {
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
    return instance.get(url, {
        ...config,
        dedupe: false,
        _skipRetry: true,
        timeout: 0,
        responseType: 'text',
        headers: {
            ...config.headers,
            Accept: 'text/event-stream',
        },
        onDownloadProgress: wrappedProgress,
    }).then((response) => {
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
    const { fieldName = 'file', extraData = {}, onProgress, config = {} } = options;

    let formData;
    if (fileOrFormData instanceof FormData) {
        formData = fileOrFormData;
    } else {
        formData = new FormData();
        const files = Array.isArray(fileOrFormData) ? fileOrFormData : [fileOrFormData];
        files.forEach((file) => formData.append(fieldName, file));
        Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
    }

    const { headers = {}, ...restConfig } = config;

    return instance.post(url, formData, {
        ...restConfig,
        // 合并而非覆盖：调用方传的 headers 不会破坏 multipart 的 Content-Type
        headers: { 'Content-Type': 'multipart/form-data', ...headers },
        onUploadProgress: onProgress
            ? (progressEvent) => {
                const percent = progressEvent.total
                    ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
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
        method = 'get',
        data,
        onProgress,
        config = {},
    } = options;

    const response = await instance.request({
        url,
        method,
        params,
        data,
        responseType: 'blob',
        timeout: DEFAULT_DOWNLOAD_TIMEOUT,
        dedupe: false,
        onDownloadProgress: onProgress
            ? (progressEvent) => {
                const percent = progressEvent.total
                    ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
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
                response?.headers?.['content-disposition'] ?? '';
            const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
            return match ? decodeURIComponent(match[1]) : 'download';
        })();

    // 触发浏览器下载
    const blob =
        response instanceof Blob ? response : new Blob([response]);
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
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
        cancel: (reason = i18n.t('http.errors.cancelled')) => controller.abort(reason),
    };
}

/**
 * 取消所有正在进行的请求（页面切换时调用）
 */
export function cancelAllRequests() {
    pendingRequests.forEach((controller) => controller.abort('页面切换，取消所有请求'));
    pendingRequests.clear();
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
