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

// ─────────────────────────────────────────────
// 1. 常量 & 配置
// ─────────────────────────────────────────────

/** 默认超时（毫秒） */
const DEFAULT_TIMEOUT = ENV_CONFIG.TIMEOUT;

/** API 基础路径 */
const BASE_URL = ENV_CONFIG.BASE_URL;

/** 是否开发环境 */
const IS_DEV = ENV_CONFIG.IS_DEV;

/** Token 存储 key */
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/** 刷新 Token 的接口路径（相对 baseURL） */
const REFRESH_URL = '/auth/refresh';

/** 最大自动重试次数（网络错误 / 5xx） */
const MAX_RETRY = 2;

/** 重试间隔基数（ms），指数退避：delay = BASE_RETRY_DELAY * 2^attempt */
const BASE_RETRY_DELAY = 500;

// ─────────────────────────────────────────────
// 2. Token 工具
// ─────────────────────────────────────────────

export const tokenStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    removeToken: () => localStorage.removeItem(TOKEN_KEY),

    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
    removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

// ─────────────────────────────────────────────
// 3. 错误码映射
// ─────────────────────────────────────────────

/** HTTP 状态码 → 友好提示 */
const HTTP_ERROR_MAP = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '您没有权限执行此操作',
    404: '请求的资源不存在',
    405: '请求方法不被允许',
    408: '请求超时，请稍后重试',
    409: '数据冲突，请刷新后重试',
    422: '请求数据验证失败',
    429: '请求过于频繁，请稍后重试',
    500: '服务器内部错误',
    502: '网关错误，请稍后重试',
    503: '服务暂时不可用',
    504: '网关超时，请稍后重试',
};

/** 业务错误码 → 友好提示（对接后端自定义 code） */
const BIZ_ERROR_MAP = {
    1001: '用户名或密码错误',
    1002: '账号已被禁用',
    1003: '验证码已过期',
    4001: '数据不存在',
    4003: '无操作权限',
    5000: '服务器繁忙，请稍后重试',
};

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
function buildRequestKey(config) {
    let { method = '', url = '', params, data } = config;
    // 转换 data 为对象以保持 key 的一致性
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { /* ignore */ }
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
    config.signal = controller.signal;
    pendingRequests.set(key, controller);
}

/**
 * 从幂等锁中移除请求
 * @param {import('axios').InternalAxiosRequestConfig} config
 */
function removePendingRequest(config) {
    const key = buildRequestKey(config);
    pendingRequests.delete(key);
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
function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

/**
 * 通知所有等待刷新的请求
 * @param {string} newToken
 */
function notifyRefreshSubscribers(newToken) {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
}

/**
 * 执行 Token 刷新
 * @returns {Promise<string>} 新的 access token
 */
async function refreshAccessToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
        throw new HttpError('无刷新令牌，请重新登录', 401, null, null);
    }
    // 使用原始 axios 避免循环拦截
    const response = await axios.post(`${BASE_URL}${REFRESH_URL}`, {
        refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data?.data ?? {};
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
        // 默认行为：(GET, POST, PUT, DELETE, PATCH）防重复
        const isWrite = ['get', 'post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase());
        const shouldDedupe = config.dedupe ?? isWrite;

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
                BIZ_ERROR_MAP[body.code] || body.message || '业务处理失败';
            throw new HttpError(bizMsg, response.status, body.code, body);
        }

        // 非标准结构直接返回
        return body;
    },

    // ── 9.2 错误响应 ──
    async (error) => {
        if (axios.isCancel(error)) {
            // 如果是被幂等锁取消的，静默处理（不报错给业务层）
            if (IS_DEV) {
                console.log(`%c[HTTP] ⚡ 请求已安全取消: ${error.message}`, 'color: #94a3b8');
            }
            // 返回一个永远 pending 的 promise，或者特定的标识，避免业务层进入 catch
            return new Promise(() => { });
        }

        const { config, response } = error;

        if (config) {
            removePendingRequest(config);
        }

        // ── 9.2.1 Token 过期，无感刷新 ──
        if (response?.status === 401 && config && !config._retryRefresh) {
            if (isRefreshing) {
                // 排队等待刷新完成
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((newToken) => {
                        config.headers['Authorization'] = `Bearer ${newToken}`;
                        config._retryRefresh = true;
                        resolve(instance(config));
                    });
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
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                tokenStorage.clear();
                // 触发全局登出事件，由业务层监听
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(
                    new HttpError('登录已过期，请重新登录', 401, null, null)
                );
            }
        }

        // ── 9.2.2 自动重试（网络错误 / 5xx） ──
        const shouldRetry =
            config &&
            !response && // 网络错误（无响应）
            config._retryCount < MAX_RETRY;

        const shouldRetry5xx =
            config &&
            response?.status >= 500 &&
            (config._retryCount ?? 0) < MAX_RETRY;

        if (shouldRetry || shouldRetry5xx) {
            config._retryCount = (config._retryCount ?? 0) + 1;
            const delay = BASE_RETRY_DELAY * Math.pow(2, config._retryCount - 1);

            if (IS_DEV) {
                console.warn(
                    `[HTTP] 重试 ${config._retryCount}/${MAX_RETRY}，延迟 ${delay}ms`,
                    config.url
                );
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
            return instance(config);
        }

        // ── 9.2.3 统一错误处理 ──
        const status = response?.status;
        const serverMsg = response?.data?.message;
        const message =
            serverMsg ||
            HTTP_ERROR_MAP[status] ||
            error.message ||
            '网络请求失败，请检查网络连接';

        if (IS_DEV) {
            console.groupCollapsed(
                `%c[HTTP] ✗ ${config?.method?.toUpperCase()} ${config?.url} [${status ?? 'Network Error'}]`,
                'color: #f87171; font-weight: bold'
            );
            console.error('Error:', error);
            console.groupEnd();
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

    return instance.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
        ...config,
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
        timeout: 0,
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
        // 下载时跳过业务解包，直接拿 AxiosResponse
        rawResponse: false,
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
        cancel: (reason = '请求已取消') => controller.abort(reason),
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
    post,
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
