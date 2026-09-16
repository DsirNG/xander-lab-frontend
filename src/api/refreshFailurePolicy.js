/**
 * Refresh 专用失败分类与重试策略（V9 §45 / §46）。
 *
 * 与 `httpPolicy.js` 同构：把策略从 Axios 层剥离出来，保持纯函数、可独立单测。
 * 这里**只**回答两个问题：
 *   1. 这次刷新失败是不是「会话不可恢复」（要清凭据、跳登录页）？
 *   2. 值不值得再试一次？
 *
 * ── 为什么按 HTTP 状态分类，而不是按服务端文案 ──
 * 方案 §45 用 `401 INVALID_REFRESH_TOKEN` / `401 REFRESH_TOKEN_REUSED` /
 * `403 ACCOUNT_DISABLED` 三个名字描述不可恢复的失败。但服务端契约里
 * `Result.code` 就是 HTTP 状态码本身（`Result.unauthorized()` → 401，
 * `Result.forbidden()` → 403），线上没有独立的业务码字符串。所以三个名字
 * 在传输层收敛为「4xx 鉴权失败」，分类只能按状态做，不能去匹配 message
 * （文案会被翻译、会被改写，匹配文案是把 i18n 当协议用）。
 *
 * ── 为什么「未知」默认归为可重试 ──
 * 两个方向的错误代价不对称：
 *   - 误判为 transient：多一次重试 + 一句「暂时无法刷新会话」，用户仍是登录态，
 *     手动重试即可恢复。
 *   - 误判为 unrecoverable：直接清掉本地凭据并跳登录页，不可逆。
 * 所以凡是 §45 没有明确点名的状态，一律保守地按 transient 处理。
 *
 * @module api/refreshFailurePolicy
 */

/** 刷新失败分类。 */
export const REFRESH_FAILURE = {
    /** 会话不可恢复：清凭据、跳登录页。 */
    UNRECOVERABLE: "unrecoverable",
    /** 暂时性失败：保留凭据，退避后最多重试一次。 */
    TRANSIENT: "transient",
};

/** Refresh 专用最大重试次数（§45：最多重试 1 次）。 */
export const REFRESH_MAX_RETRY = 1;

/** Refresh 重试退避基数（ms）。 */
export const REFRESH_RETRY_BASE_DELAY = 800;

/** 不可恢复的 HTTP 状态：401 无效/重放 refresh token，403 账号被封禁。 */
const UNRECOVERABLE_STATUSES = new Set([401, 403]);

/**
 * 从各种形状的失败对象里取出 HTTP 状态码。
 *
 * 依次尝试：
 *   - `error.status`：本模块自己的 `HttpError`
 *   - `error.response.status`：Axios 原生错误
 *   - `error.code`：仅当它是数字（服务端 envelope 里回填的状态码）；
 *     Axios 的网络/超时错误把 `code` 设成字符串（`ERR_NETWORK`、
 *     `ECONNABORTED`），必须排除，否则会拿到 NaN。
 *
 * @param {any} error
 * @returns {number|undefined} 状态码；无法判定时返回 undefined
 */
export function readRefreshFailureStatus(error) {
    const candidates = [error?.status, error?.response?.status, error?.code];
    for (const candidate of candidates) {
        if (typeof candidate === "number" && Number.isFinite(candidate)) {
            return candidate;
        }
    }
    return undefined;
}

/**
 * 把一次刷新失败归类为 unrecoverable / transient。
 *
 * @param {any} error Axios 错误或 `HttpError`
 * @returns {'unrecoverable'|'transient'}
 */
export function classifyRefreshFailure(error) {
    const status = readRefreshFailureStatus(error);
    // 没有状态码 = 网络错误 / 超时 / 请求被中断：服务端从未表态，
    // 凭据很可能仍然有效，绝不能据此清凭据。
    if (status === undefined) return REFRESH_FAILURE.TRANSIENT;
    return UNRECOVERABLE_STATUSES.has(status)
        ? REFRESH_FAILURE.UNRECOVERABLE
        : REFRESH_FAILURE.TRANSIENT;
}

/**
 * 该失败是否属于「会话不可恢复」。
 * @param {any} error
 * @returns {boolean}
 */
export const isUnrecoverableRefreshFailure = (error) =>
    classifyRefreshFailure(error) === REFRESH_FAILURE.UNRECOVERABLE;

/**
 * 本次失败后是否还应该再重试。
 *
 * 只有暂时性失败才重试；且服务端已提供幂等 grace（§45），
 * 所以刷新这一次重试是安全的。
 *
 * 计数口径与 `httpPolicy.shouldRetryRequest` 一致：`retriesDone` 是
 * **已经重试过的次数**，不是失败次数。传 0 表示刚第一次失败、还没重试过。
 *
 * @param {any} error
 * @param {number} [retriesDone] 已经重试过的次数，缺省 0
 * @returns {boolean}
 */
export function shouldRetryRefresh(error, retriesDone) {
    if (classifyRefreshFailure(error) === REFRESH_FAILURE.UNRECOVERABLE) {
        return false;
    }
    return (retriesDone ?? 0) < REFRESH_MAX_RETRY;
}

/**
 * 第 `attempt` 次重试前的退避时长（ms），指数退避。
 * @param {number} attempt 从 1 开始
 * @returns {number}
 */
export const getRefreshRetryDelay = (attempt) =>
    REFRESH_RETRY_BASE_DELAY * Math.pow(2, Math.max(0, (attempt ?? 1) - 1));
