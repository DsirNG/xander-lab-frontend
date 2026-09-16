import assert from "node:assert/strict";
import test from "node:test";
import {
    REFRESH_FAILURE,
    REFRESH_MAX_RETRY,
    REFRESH_RETRY_BASE_DELAY,
    classifyRefreshFailure,
    getRefreshRetryDelay,
    isUnrecoverableRefreshFailure,
    readRefreshFailureStatus,
    shouldRetryRefresh,
} from "./refreshFailurePolicy.js";

/** 构造 Axios 风格错误 */
const axiosError = (status) => ({ response: { status } });

/** 构造本仓库 HttpError 风格错误 */
const httpError = (status, code) => ({ status, code });

test("§45 不可恢复：401 / 403 一律判定为 unrecoverable", () => {
    // 401 INVALID_REFRESH_TOKEN（随机垃圾 token）
    assert.equal(
        classifyRefreshFailure(axiosError(401)),
        REFRESH_FAILURE.UNRECOVERABLE,
    );
    // 401 REFRESH_TOKEN_REUSED（真正的 reuse，family 已撤销）
    assert.equal(
        classifyRefreshFailure(httpError(401, 401)),
        REFRESH_FAILURE.UNRECOVERABLE,
    );
    // 403 ACCOUNT_DISABLED
    assert.equal(
        classifyRefreshFailure(axiosError(403)),
        REFRESH_FAILURE.UNRECOVERABLE,
    );
});

test("§45 暂时性：503 / 5xx 判定为 transient", () => {
    // 503 AUTH_BACKEND_UNAVAILABLE
    assert.equal(
        classifyRefreshFailure(axiosError(503)),
        REFRESH_FAILURE.TRANSIENT,
    );
    assert.equal(
        classifyRefreshFailure(axiosError(500)),
        REFRESH_FAILURE.TRANSIENT,
    );
    assert.equal(
        classifyRefreshFailure(axiosError(502)),
        REFRESH_FAILURE.TRANSIENT,
    );
    assert.equal(
        classifyRefreshFailure(axiosError(504)),
        REFRESH_FAILURE.TRANSIENT,
    );
});

test("§45 暂时性：网络错误与超时没有状态码，不得清凭据", () => {
    // Axios 网络错误
    assert.equal(
        classifyRefreshFailure({ code: "ERR_NETWORK", response: undefined }),
        REFRESH_FAILURE.TRANSIENT,
    );
    // Axios 超时
    assert.equal(
        classifyRefreshFailure({ code: "ECONNABORTED" }),
        REFRESH_FAILURE.TRANSIENT,
    );
    // 完全空的错误对象
    assert.equal(classifyRefreshFailure(undefined), REFRESH_FAILURE.TRANSIENT);
    assert.equal(classifyRefreshFailure(null), REFRESH_FAILURE.TRANSIENT);
});

test("Axios 的字符串 code 不会被当成状态码", () => {
    // 这是最容易踩的坑：Number("ERR_NETWORK") 是 NaN，
    // 若不排除字符串就会得到 NaN 并让后续 Set 判断全部落空。
    assert.equal(readRefreshFailureStatus({ code: "ERR_NETWORK" }), undefined);
    assert.equal(readRefreshFailureStatus({ code: "ECONNABORTED" }), undefined);
    // 数字 code 才是服务端 envelope 回填的状态码
    assert.equal(readRefreshFailureStatus({ code: 503 }), 503);
});

test("状态码优先级：status > response.status > code", () => {
    assert.equal(
        readRefreshFailureStatus({ status: 401, response: { status: 503 } }),
        401,
    );
    assert.equal(
        readRefreshFailureStatus({ response: { status: 403 }, code: 500 }),
        403,
    );
});

test("未点名的状态码保守归为 transient（不可逆操作要谨慎）", () => {
    // §45 只点名了 401/403/503/5xx。其它状态（含 400/422/429）
    // 一律不销毁本地凭据：误判为 transient 只是多一次重试，
    // 误判为 unrecoverable 则是不可逆地把用户踢下线。
    for (const status of [400, 404, 405, 408, 409, 422, 429]) {
        assert.equal(
            classifyRefreshFailure(axiosError(status)),
            REFRESH_FAILURE.TRANSIENT,
            `status ${status} 应保守归为 transient`,
        );
    }
});

test("isUnrecoverableRefreshFailure 与分类保持一致", () => {
    assert.equal(isUnrecoverableRefreshFailure(axiosError(401)), true);
    assert.equal(isUnrecoverableRefreshFailure(axiosError(403)), true);
    assert.equal(isUnrecoverableRefreshFailure(axiosError(503)), false);
    assert.equal(isUnrecoverableRefreshFailure(axiosError(500)), false);
    assert.equal(isUnrecoverableRefreshFailure(undefined), false);
});

test("§45 最多重试一次：还没重试过时放行，已重试过就停止", () => {
    assert.equal(REFRESH_MAX_RETRY, 1);
    // retriesDone = 0：刚第一次失败，允许重试
    assert.equal(shouldRetryRefresh(axiosError(503), 0), true);
    // retriesDone = 1：已经重试过一次并再次失败 → 停止
    assert.equal(shouldRetryRefresh(axiosError(503), 1), false);
    assert.equal(shouldRetryRefresh(axiosError(503), 2), false);
    // 缺省 retriesDone 视为 0
    assert.equal(shouldRetryRefresh(axiosError(503)), true);
});

test("不可恢复的失败一次都不重试", () => {
    assert.equal(shouldRetryRefresh(axiosError(401), 0), false);
    assert.equal(shouldRetryRefresh(axiosError(401), 1), false);
    assert.equal(shouldRetryRefresh(axiosError(403), 0), false);
});

test("重试退避指数增长且首次为基数", () => {
    assert.equal(REFRESH_RETRY_BASE_DELAY, 800);
    assert.deepEqual([1, 2, 3].map(getRefreshRetryDelay), [800, 1600, 3200]);
    // 非法/缺省入参不产生 NaN 或负延迟
    assert.equal(getRefreshRetryDelay(0), 800);
    assert.equal(getRefreshRetryDelay(undefined), 800);
});
