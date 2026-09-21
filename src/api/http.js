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
import { createHttpMethods } from "./httpMethods";
import {
    AUTH_RECOVERY_NOT_HANDLED,
    createAuthRecovery,
} from "./auth/refreshCoordinator";
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
import { createDownload } from "./transfer/download";
import { createUpload } from "./transfer/upload";

export { buildRequestKey };
export { HttpError };
export { tokenStorage };

// ─────────────────────────────────────────────
// 1. 常量 & 配置
// ─────────────────────────────────────────────

/** 默认超时（毫秒） */
const DEFAULT_TIMEOUT = ENV_CONFIG.TIMEOUT;

/** Methods that can be retried and deduplicated without replaying mutations. */

/** API 基础路径 */
const BASE_URL = ENV_CONFIG.BASE_URL;

/** 是否开发环境 */
const IS_DEV = ENV_CONFIG.IS_DEV;

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

const authRecovery = createAuthRecovery({
    axios,
    instance,
    baseURL: BASE_URL,
    refreshURL: "/api/auth/refresh",
    refreshTimeout: 15000,
    showToast,
});

const upload = createUpload(instance);
const download = createDownload(instance);

export { download, upload };

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
        const authRecoveryResult = await authRecovery.recoverUnauthorized(
            config,
            response?.status,
        );
        if (authRecoveryResult !== AUTH_RECOVERY_NOT_HANDLED) {
            return authRecoveryResult;
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

const {
    get,
    getStream,
    post,
    postStream,
    put,
    patch,
    del,
    head,
    options,
    all,
    race,
    createCancelToken,
    cancelAllRequests,
} = createHttpMethods({
    instance,
    createSseReader,
    cancelAllPendingRequests,
    i18n,
    upload,
    download,
});

export {
    get,
    getStream,
    post,
    postStream,
    put,
    patch,
    del,
    head,
    options,
    all,
    race,
    createCancelToken,
    cancelAllRequests,
};

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
