const DEFAULT_DOWNLOAD_TIMEOUT = 10 * 60 * 1000;

const resolveFilename = (response, filename) => {
    if (filename) return filename;
    const disposition = response?.headers?.["content-disposition"] ?? "";
    const match = disposition.match(
        /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i,
    );
    return match ? decodeURIComponent(match[1]) : "download";
};

/**
 * Create a Blob download transport bound to the shared Axios instance.
 * @param {import('axios').AxiosInstance} instance
 * @param {number} timeout
 */
export const createDownload = (instance, timeout = DEFAULT_DOWNLOAD_TIMEOUT) =>
    async function download(url, options = {}) {
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
            timeout,
            dedupe: false,
            onDownloadProgress: onProgress
                ? (progressEvent) => {
                      const percent = progressEvent.total
                          ? Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total,
                            )
                          : 0;
                      onProgress(percent, progressEvent);
                  }
                : undefined,
            ...config,
        });

        const resolvedFilename = resolveFilename(response, filename);
        const blob = response instanceof Blob ? response : new Blob([response]);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = resolvedFilename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
    };
