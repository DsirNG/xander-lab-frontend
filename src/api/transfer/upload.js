/**
 * Create a multipart upload transport bound to the shared Axios instance.
 * @param {import('axios').AxiosInstance} instance
 */
export const createUpload = (instance) =>
    function upload(url, fileOrFormData, options = {}) {
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
            Object.entries(extraData).forEach(([key, value]) =>
                formData.append(key, value),
            );
        }

        const { headers = {}, ...restConfig } = config;

        return instance.post(url, formData, {
            ...restConfig,
            headers: { "Content-Type": "multipart/form-data", ...headers },
            onUploadProgress: onProgress
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
            timeout: 0,
            dedupe: false,
        });
    };
