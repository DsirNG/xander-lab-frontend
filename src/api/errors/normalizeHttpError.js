import i18n from "@locales/index";

/** 标准化的 HTTP/业务错误对象。 */
export class HttpError extends Error {
    /**
     * @param {string} message - 错误信息
     * @param {number} [status] - HTTP 状态码
     * @param {number} [code] - 业务错误码
     * @param {any} [data] - 原始响应数据
     */
    constructor(message, status, code, data) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

const HTTP_ERROR_KEYS = {
    400: "http.errors.badRequest",
    401: "http.errors.unauthorized",
    403: "http.errors.forbidden",
    404: "http.errors.notFound",
    405: "http.errors.methodNotAllowed",
    408: "http.errors.requestTimeout",
    409: "http.errors.conflict",
    422: "http.errors.unprocessable",
    429: "http.errors.tooManyRequests",
    500: "http.errors.internalError",
    502: "http.errors.badGateway",
    503: "http.errors.serviceUnavailable",
    504: "http.errors.gatewayTimeout",
};

const BIZ_ERROR_KEYS = {
    1001: "http.errors.invalidCredentials",
    1002: "http.errors.accountDisabled",
    1003: "http.errors.codeExpired",
    4001: "http.errors.dataNotFound",
    4003: "http.errors.noPermission",
    5000: "http.errors.serverBusy",
};

/** 获取 HTTP 状态码对应的用户提示。 */
export const getHttpErrorMessage = (status) => {
    const key = HTTP_ERROR_KEYS[status];
    return key ? i18n.t(key) : "";
};

/** 获取业务错误码对应的用户提示。 */
export const getBizErrorMessage = (code, fallback) => {
    const key = BIZ_ERROR_KEYS[code];
    return key ? i18n.t(key) : fallback || i18n.t("http.errors.bizDefault");
};

/** 从 Blob 错误响应中解析服务端 message。 */
export async function extractBlobErrorMessage(data) {
    if (!data || typeof data.text !== "function") return "";
    try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        return typeof parsed?.message === "string" ? parsed.message : "";
    } catch {
        return "";
    }
}
