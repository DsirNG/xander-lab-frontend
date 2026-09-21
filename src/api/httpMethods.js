/**
 * Request-method facade for the shared transport client.
 *
 * Keeping these thin methods separate means http.js can focus on the Axios
 * instance and its interceptors while Feature APIs still use one transport.
 */
export function createHttpMethods({
    instance,
    createSseReader,
    cancelAllPendingRequests,
    i18n,
    upload,
    download,
}) {
    /**
     * GET 请求
     * @template T
     * @param {string} url
     * @param {Object} [params] - URL 查询参数
     * @param {import('axios').AxiosRequestConfig} [config] - 额外配置
     * @returns {Promise<T>}
     */
    function get(url, params, config) {
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
    function post(url, data, config) {
        return instance.post(url, data, config);
    }

    /**
     * Send a POST request whose response is Server-Sent Events, while preserving
     * the shared axios instance's auth and error handling behaviour.
     */
    function postStream(url, data, { onEvent, ...config } = {}) {
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
    function getStream(url, { onEvent, onProgress, ...config } = {}) {
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
    function put(url, data, config) {
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
    function patch(url, data, config) {
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
    function del(url, params, config) {
        return instance.delete(url, { params, ...config });
    }

    /**
     * HEAD 请求（获取响应头）
     * @param {string} url
     * @param {import('axios').AxiosRequestConfig} [config]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    function head(url, config) {
        return instance.head(url, { ...config, rawResponse: true });
    }

    /**
     * OPTIONS 请求（CORS 预检）
     * @param {string} url
     * @param {import('axios').AxiosRequestConfig} [config]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    function options(url, config) {
        return instance.options(url, { ...config, rawResponse: true });
    }

    // ─────────────────────────────────────────────
    // 13. 并发请求
    // ─────────────────────────────────────────────

    /**
     * 并发多个请求（等同 Promise.all，但语义更清晰）
     * @param {Promise[]} requests
     * @returns {Promise<any[]>}
     */
    function all(requests) {
        return Promise.all(requests);
    }

    /**
     * 并发多个请求，任意一个成功即返回
     * @param {Promise[]} requests
     * @returns {Promise<any>}
     */
    function race(requests) {
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
    function createCancelToken() {
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
    function cancelAllRequests() {
        cancelAllPendingRequests();
    }

    return {
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
        upload,
        download,
    };
}
