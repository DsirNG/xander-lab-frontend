import { ENV_CONFIG } from "@config/env";

const IS_DEV = ENV_CONFIG.IS_DEV;

/** 正在进行中的请求 Map：key → AbortController */
const pendingRequests = new Map();

/**
 * 生成请求唯一 key
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @returns {string}
 */
export function buildRequestKey(config) {
    let { method = "", url = "", params, data } = config;
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            /* Preserve non-JSON request bodies. */
        }
    }
    return [
        method.toLowerCase(),
        url,
        JSON.stringify(params || {}),
        JSON.stringify(data || {}),
    ].join("|");
}

/** 将请求加入幂等锁（若已存在则取消旧请求）。 */
export function addPendingRequest(config) {
    const key = buildRequestKey(config);
    if (pendingRequests.has(key)) {
        const controller = pendingRequests.get(key);
        controller.abort("Dedupe: 相同的请求已存在，取消前一个");
        if (IS_DEV) {
            console.debug(
                `%c[HTTP] ⚡ 重复请求已合并: ${config.url}`,
                "color: #fb923c",
            );
        }
    }

    const controller = new AbortController();
    if (config.signal) {
        const callerSignal = config.signal;
        if (callerSignal.aborted) {
            controller.abort(callerSignal.reason);
        } else {
            callerSignal.addEventListener(
                "abort",
                () => controller.abort(callerSignal.reason),
                { once: true },
            );
        }
    }

    config.signal = controller.signal;
    config._pendingRequestKey = key;
    config._pendingController = controller;
    pendingRequests.set(key, controller);
}

/** 从幂等锁中移除请求。 */
export function removePendingRequest(config) {
    const key = config?._pendingRequestKey ?? buildRequestKey(config);
    if (pendingRequests.get(key) === config?._pendingController) {
        pendingRequests.delete(key);
    }
}

/** 取消并清空全部正在进行中的请求。 */
export function cancelAllPendingRequests() {
    pendingRequests.forEach((controller) =>
        controller.abort("页面切换，取消所有请求"),
    );
    pendingRequests.clear();
}
