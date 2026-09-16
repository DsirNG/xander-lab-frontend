import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const { requestInterceptors, responseInterceptors, axiosMock, instanceMock } =
    vi.hoisted(() => {
        const requestInterceptors = [];
        const responseInterceptors = [];
        // 必须可调用：刷新成功后会通过 instance(config) 重放原请求
        const mockInstance = vi.fn();
        mockInstance.interceptors = {
            request: { use: (fn) => requestInterceptors.push(fn) },
            response: {
                use: (fn, errFn) =>
                    responseInterceptors.push({ ok: fn, err: errFn }),
            },
        };
        mockInstance.defaults = {};
        mockInstance.request = vi.fn();
        mockInstance.get = vi.fn();
        mockInstance.post = vi.fn();
        mockInstance.put = vi.fn();
        mockInstance.patch = vi.fn();
        mockInstance.delete = vi.fn();
        mockInstance.head = vi.fn();
        mockInstance.options = vi.fn();
        return {
            requestInterceptors,
            responseInterceptors,
            instanceMock: mockInstance,
            axiosMock: {
                default: vi.fn(),
                create: vi.fn(() => mockInstance),
                post: vi.fn(),
                isCancel: vi.fn(),
            },
        };
    });

vi.mock("axios", () => {
    axiosMock.default.create = axiosMock.create;
    axiosMock.default.post = axiosMock.post;
    axiosMock.default.isCancel = axiosMock.isCancel;
    return axiosMock;
});

vi.mock("@config/env", () => ({
    ENV_CONFIG: {
        BASE_URL: "/api",
        // 刻意用生产环境的值（.env.production 里 VITE_REQUEST_TIMEOUT=30000），
        // 而不是代码默认的 15000 —— 这样"refresh 超时必须与全局超时解耦"
        // 这条不变量才会真的被测试覆盖到。
        TIMEOUT: 30000,
        IS_DEV: false,
        IS_PROD: true,
    },
}));

vi.mock("@locales/index", () => ({
    default: {
        t: (key, fallback) => fallback ?? key,
    },
}));

vi.mock("./httpPolicy.js", () => ({
    MAX_RETRY: 2,
    getRetryDelay: vi.fn(() => 0),
    shouldRetryRequest: vi.fn(() => false),
}));

/**
 * 保留 refreshFailurePolicy 的真实分类逻辑（那正是被测对象），
 * 只把退避时长压成 0，避免每个重试用例都真等 800ms。
 */
vi.mock("./refreshFailurePolicy.js", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, getRefreshRetryDelay: () => 0 };
});

/**
 * 跨 Tab 协调层用替身：这样能直接控制互斥量是否拿到，
 * 并捕获 http.js 注册的广播处理器来模拟「别的 Tab」的事件。
 */
const authChannelMock = vi.hoisted(() => ({
    publish: vi.fn(),
    _handler: null,
    tryAcquire: vi.fn(async () => true),
    release: vi.fn(),
}));

vi.mock("./authChannel.js", () => ({
    AUTH_EVENTS: {
        REFRESH_START: "refresh-start",
        REFRESH_SUCCESS: "refresh-success",
        REFRESH_FAILED: "refresh-failed",
        LOGOUT: "logout",
    },
    authChannel: {
        transport: "broadcast-channel",
        publish: authChannelMock.publish,
        subscribe: vi.fn((handler) => {
            authChannelMock._handler = handler;
            return () => {};
        }),
        close: vi.fn(),
    },
    refreshMutex: {
        strategy: "web-locks",
        tabId: "test-tab",
        tryAcquire: authChannelMock.tryAcquire,
        release: authChannelMock.release,
    },
}));

vi.mock("../../utils", () => ({
    cn: (...parts) => parts.filter(Boolean).join(" "),
}));

const { tokenStorage, buildRequestKey, HttpError } = await import("./http.js");

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    axiosMock.isCancel.mockReturnValue(false);
    // clearAllMocks 不会还原实现，跨用例的 mockResolvedValue 会残留，必须显式复位
    authChannelMock.tryAcquire.mockResolvedValue(true);
    instanceMock.mockReset();
});

afterEach(() => {
    delete window.__toast;
    window.dispatchEvent(new Event("auth:logout"));
});

describe("tokenStorage", () => {
    it("stores and clears tokens", () => {
        tokenStorage.setToken("abc");
        expect(localStorage.getItem("access_token")).toBe("abc");
        tokenStorage.removeToken();
        expect(tokenStorage.getToken()).toBeNull();
    });

    it("stores refresh tokens separately", () => {
        tokenStorage.setRefreshToken("r1");
        expect(tokenStorage.getRefreshToken()).toBe("r1");
        tokenStorage.removeRefreshToken();
        expect(tokenStorage.getRefreshToken()).toBeNull();
    });

    it("clear wipes the full session", () => {
        tokenStorage.setToken("a");
        tokenStorage.setRefreshToken("r");
        localStorage.setItem("user_info", "{}");
        tokenStorage.clear();
        expect(localStorage.getItem("access_token")).toBeNull();
        expect(localStorage.getItem("refresh_token")).toBeNull();
        expect(localStorage.getItem("user_info")).toBeNull();
    });
});

describe("HttpError", () => {
    it("carries status, business code and payload", () => {
        const err = new HttpError("boom", 403, 4003, { message: "boom" });
        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe("HttpError");
        expect(err.message).toBe("boom");
        expect(err.status).toBe(403);
        expect(err.code).toBe(4003);
        expect(err.data).toEqual({ message: "boom" });
    });
});

describe("buildRequestKey", () => {
    it("normalizes method case and serializes params/data", () => {
        const a = buildRequestKey({
            method: "GET",
            url: "/x",
            params: { a: 1 },
            data: { b: 2 },
        });
        const b = buildRequestKey({
            method: "get",
            url: "/x",
            params: { a: 1 },
            data: '{"b":2}',
        });
        expect(a).toBe(b);
    });

    it("handles missing params and data", () => {
        expect(buildRequestKey({ method: "post", url: "/y" })).toBe(
            "post|/y|{}|{}",
        );
    });
});

describe("request interceptor", () => {
    it("attaches the Authorization header when a token exists", async () => {
        tokenStorage.setToken("tok-123", { notify: false });
        const config = await requestInterceptors[0]({
            method: "get",
            url: "/me",
            headers: {},
            dedupe: false,
        });
        expect(config.headers.Authorization).toBe("Bearer tok-123");
    });

    it("skips the token when withToken is false", async () => {
        tokenStorage.setToken("tok-123", { notify: false });
        const config = await requestInterceptors[0]({
            method: "get",
            url: "/x",
            headers: {},
            dedupe: false,
            withToken: false,
        });
        expect(config.headers.Authorization).toBeUndefined();
    });

    it("wires the dedup controller signal into the config", async () => {
        const config = await requestInterceptors[0]({
            method: "get",
            url: "/x",
            headers: {},
        });
        expect(config.signal).toBeInstanceOf(AbortSignal);
        expect(config._pendingRequestKey).toBeDefined();
    });

    it("does not dedupe when dedupe is false", async () => {
        const config = await requestInterceptors[0]({
            method: "get",
            url: "/x",
            headers: {},
            dedupe: false,
        });
        expect(config.signal).toBeUndefined();
    });
});

describe("response interceptor success path", () => {
    it("unwraps { code: 200, data } envelopes", async () => {
        const result = await responseInterceptors[0].ok({
            data: { code: 200, data: { id: 1 }, message: "ok" },
            config: {},
        });
        expect(result).toEqual({ id: 1 });
    });

    it("accepts code 0 as success too", async () => {
        const result = await responseInterceptors[0].ok({
            data: { code: 0, data: [1, 2] },
            config: {},
        });
        expect(result).toEqual([1, 2]);
    });

    it("returns the full body when rawResponse is requested", async () => {
        const body = { code: 200, data: { id: 1 }, message: "ok" };
        const result = await responseInterceptors[0].ok({
            data: body,
            config: { rawResponse: true },
        });
        expect(result).toBe(body);
    });

    it("passes through non-envelope responses untouched", async () => {
        const result = await responseInterceptors[0].ok({
            data: "plain",
            config: {},
        });
        expect(result).toBe("plain");
    });
});

describe("response interceptor error path", () => {
    const businessError = { code: 4001, message: "数据不存在", data: null };

    it("rejects business errors with HttpError and shows a toast", () => {
        const toast = vi.fn();
        window.__toast = toast;
        let caught;
        try {
            responseInterceptors[0].ok({
                status: 200,
                data: businessError,
                config: {},
            });
        } catch (error) {
            caught = error;
        }
        expect(caught).toMatchObject({
            name: "HttpError",
            code: 4001,
            status: 200,
        });
        expect(toast).toHaveBeenCalledWith("error", expect.any(String));
    });

    it("suppresses the toast when _silent is set", async () => {
        const toast = vi.fn();
        window.__toast = toast;
        await expect(
            responseInterceptors[0].err({
                config: { _silent: true },
                response: { status: 200, data: businessError },
            }),
        ).rejects.toMatchObject({ name: "HttpError" });
        expect(toast).not.toHaveBeenCalled();
    });

    it("rejects cancelled requests with a standard CanceledError", async () => {
        axiosMock.isCancel.mockReturnValue(true);
        await expect(
            responseInterceptors[0].err({ config: {}, response: undefined }),
        ).rejects.toMatchObject({
            name: "CanceledError",
            code: "ERR_CANCELED",
            isCancelled: true,
        });
    });

    it("formats network errors with the generic message and shows an error toast", async () => {
        const toast = vi.fn();
        window.__toast = toast;
        await expect(
            responseInterceptors[0].err({
                config: { url: "/x", method: "get" },
                response: undefined,
            }),
        ).rejects.toMatchObject({ name: "HttpError", status: undefined });
        expect(toast).toHaveBeenCalledWith("error", expect.any(String));
    });
});

// ─────────────────────────────────────────────
// 刷新路径（V9 §44 / §45 / §46）
// ─────────────────────────────────────────────

describe("refresh failure classification (§45)", () => {
    const config401 = () => ({
        url: "/api/me",
        method: "get",
        headers: {},
        dedupe: false,
    });

    const trigger401 = (config) =>
        responseInterceptors[0].err({ config, response: { status: 401 } });

    const refreshOk = (accessToken, refreshToken) => ({
        data: { code: 200, data: { accessToken, refreshToken } },
    });

    it("暂时性失败（503）保留凭据、不强制登出，且不伪装成登录过期", async () => {
        tokenStorage.setToken("old-at", { notify: false });
        tokenStorage.setRefreshToken("old-rt");
        const toast = vi.fn();
        window.__toast = toast;
        axiosMock.post.mockRejectedValue({ response: { status: 503 } });

        const config = config401();
        await expect(trigger401(config)).rejects.toMatchObject({
            status: 503,
        });

        // §45 的核心：不清 Token、不跳登录页
        expect(tokenStorage.getToken()).toBe("old-at");
        expect(tokenStorage.getRefreshToken()).toBe("old-rt");
        expect(toast).toHaveBeenCalledWith("warning", expect.any(String));
        // 文案不能是「登录已过期」
        expect(toast.mock.calls[0][1]).not.toMatch(/登录已过期|Session expired/);
    });

    it("§46 暂时性失败只重试一次，重试仍失败就停止", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockRejectedValue({ response: { status: 503 } });

        await expect(trigger401(config401())).rejects.toMatchObject({
            status: 503,
        });

        // 首次 + 1 次重试
        expect(axiosMock.post).toHaveBeenCalledTimes(2);
        expect(tokenStorage.getRefreshToken()).toBe("old-rt");
    });

    it("§46 重试成功则轮换凭据并重放原请求", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post
            .mockRejectedValueOnce({ response: { status: 503 } })
            .mockResolvedValueOnce(refreshOk("new-at", "new-rt"));
        instanceMock.mockResolvedValue("replayed");

        const config = config401();
        await expect(trigger401(config)).resolves.toBe("replayed");

        expect(axiosMock.post).toHaveBeenCalledTimes(2);
        expect(tokenStorage.getToken()).toBe("new-at");
        expect(tokenStorage.getRefreshToken()).toBe("new-rt");
        expect(config.headers.Authorization).toBe("Bearer new-at");
    });

    it("不可恢复失败（401）清空凭据并强制登出，且完全不重试", async () => {
        tokenStorage.setToken("old-at", { notify: false });
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockRejectedValue({ response: { status: 401 } });

        await expect(trigger401(config401())).rejects.toMatchObject({
            status: 401,
        });

        expect(tokenStorage.getToken()).toBeNull();
        expect(tokenStorage.getRefreshToken()).toBeNull();
        expect(axiosMock.post).toHaveBeenCalledTimes(1);
    });

    it("403 同样判定为不可恢复", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockRejectedValue({ response: { status: 403 } });

        await expect(trigger401(config401())).rejects.toMatchObject({
            status: 401,
        });
        expect(tokenStorage.getRefreshToken()).toBeNull();
        expect(axiosMock.post).toHaveBeenCalledTimes(1);
    });

    it("本地没有 refresh token 时不发请求，直接判定会话不可恢复", async () => {
        tokenStorage.setToken("old-at", { notify: false });

        await expect(trigger401(config401())).rejects.toMatchObject({
            status: 401,
        });

        expect(axiosMock.post).not.toHaveBeenCalled();
        expect(tokenStorage.getToken()).toBeNull();
    });

    it("网络错误（无响应）按暂时性处理，保留凭据", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockRejectedValue({ code: "ERR_NETWORK" });

        await expect(trigger401(config401())).rejects.toMatchObject({
            status: 503,
        });
        expect(tokenStorage.getRefreshToken()).toBe("old-rt");
    });

    it("刷新成功时广播 refresh-success", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockResolvedValue(refreshOk("new-at", "new-rt"));
        instanceMock.mockResolvedValue("ok");

        await trigger401(config401());

        expect(authChannelMock.publish).toHaveBeenCalledWith("refresh-start");
        expect(authChannelMock.publish).toHaveBeenCalledWith("refresh-success");
    });

    it("刷新失败时广播 refresh-failed 并带上分类", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockRejectedValue({ response: { status: 503 } });

        await expect(trigger401(config401())).rejects.toBeDefined();

        expect(authChannelMock.publish).toHaveBeenCalledWith(
            "refresh-failed",
            { unrecoverable: false },
        );
    });

    it("无论成功失败都释放跨 Tab 互斥量", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockRejectedValue({ response: { status: 503 } });

        await expect(trigger401(config401())).rejects.toBeDefined();

        expect(authChannelMock.release).toHaveBeenCalled();
    });

    it("同一 Tab 并发两个 401 只发起一次刷新", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockResolvedValue(refreshOk("new-at", "new-rt"));
        instanceMock.mockResolvedValue("ok");

        // 两个请求在同一 tick 同时收到 401：本 Tab 的锁必须在 await
        // 跨 Tab 互斥之前就置位，否则第二个请求会在 await 期间看到
        // isRefreshing 仍为 false，于是两个请求都去刷新。
        const pending = [trigger401(config401()), trigger401(config401())];
        await Promise.all(pending);

        expect(axiosMock.post).toHaveBeenCalledTimes(1);
    });

    it("§35 Contract：refresh 超时必须固定在 15s，不跟随全局 30s", async () => {
        tokenStorage.setRefreshToken("old-rt");
        axiosMock.post.mockResolvedValue(refreshOk("new-at", "new-rt"));
        instanceMock.mockResolvedValue("ok");

        await trigger401(config401());

        // 全局超时是 30000（生产值），但 refresh 必须用 Contract 值 15000。
        // 若这里跟着全局走，生产环境就会出现 grace(25s) < timeout(30s)：
        // 响应丢失后的重试会落在 grace 之外，被服务端判成 Reuse 并撤销整个会话族。
        const [, , options] = axiosMock.post.mock.calls[0];
        expect(options.timeout).toBe(15000);
        expect(options.timeout).not.toBe(30000);
    });
});

describe("cross-tab coordination (§44)", () => {
    const config401 = () => ({
        url: "/api/me",
        method: "get",
        headers: {},
        dedupe: false,
    });

    const trigger401 = (config) =>
        responseInterceptors[0].err({ config, response: { status: 401 } });

    /** 让拦截器跑过内部 await，真正进入等待状态 */
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    it("拿不到跨 Tab 互斥时不自己刷新，等广播到新 token 后重放", async () => {
        tokenStorage.setRefreshToken("old-rt");
        authChannelMock.tryAcquire.mockResolvedValue(false);
        instanceMock.mockResolvedValue("replayed");

        const config = config401();
        const pending = trigger401(config);

        // 必须先让拦截器 await 完 tryAcquire 并把自己挂进队列，
        // 否则广播发出时队列还是空的，这个 Promise 永远不会落定
        await flush();

        // 别的 Tab 刷新成功，新 token 已写进共享的 localStorage
        tokenStorage.setToken("remote-at", { notify: false });
        authChannelMock._handler("refresh-success", {});

        await expect(pending).resolves.toBe("replayed");
        expect(axiosMock.post).not.toHaveBeenCalled();
        expect(config.headers.Authorization).toBe("Bearer remote-at");
        // 本 Tab 没刷新，就不该广播 refresh-start
        expect(authChannelMock.publish).not.toHaveBeenCalledWith(
            "refresh-start",
        );
    });

    it("收到别的 Tab 的 refresh-start 后本 Tab 连互斥量都不去抢", async () => {
        tokenStorage.setRefreshToken("old-rt");
        instanceMock.mockResolvedValue("replayed");

        authChannelMock._handler("refresh-start", {});

        const config = config401();
        const pending = trigger401(config);

        tokenStorage.setToken("remote-at", { notify: false });
        authChannelMock._handler("refresh-success", {});

        await expect(pending).resolves.toBe("replayed");
        expect(authChannelMock.tryAcquire).not.toHaveBeenCalled();
        expect(axiosMock.post).not.toHaveBeenCalled();
    });

    it("别的 Tab 暂时性刷新失败时，排队请求拿到 503 且凭据保留", async () => {
        tokenStorage.setToken("old-at", { notify: false });
        tokenStorage.setRefreshToken("old-rt");
        window.__toast = vi.fn();

        // 必须先进入「等别的 Tab」状态，否则本 Tab 会自己去刷新，
        // 这个用例就会因为别的原因通过而失去意义
        authChannelMock._handler("refresh-start", {});

        const config = config401();
        const pending = trigger401(config);

        authChannelMock._handler("refresh-failed", { unrecoverable: false });

        await expect(pending).rejects.toMatchObject({ status: 503 });
        expect(axiosMock.post).not.toHaveBeenCalled();
        expect(tokenStorage.getToken()).toBe("old-at");
        expect(tokenStorage.getRefreshToken()).toBe("old-rt");
    });

    it("别的 Tab 判定会话不可恢复时，本 Tab 也跟着清空凭据", async () => {
        tokenStorage.setToken("old-at", { notify: false });
        tokenStorage.setRefreshToken("old-rt");
        window.__toast = vi.fn();

        authChannelMock._handler("refresh-start", {});

        const config = config401();
        const pending = trigger401(config);

        authChannelMock._handler("refresh-failed", { unrecoverable: true });

        await expect(pending).rejects.toMatchObject({ status: 401 });
        expect(axiosMock.post).not.toHaveBeenCalled();
        expect(tokenStorage.getToken()).toBeNull();
        expect(tokenStorage.getRefreshToken()).toBeNull();
    });

    it("收到别的 Tab 的 logout 时本 Tab 降为未登录", () => {
        tokenStorage.setToken("old-at", { notify: false });
        tokenStorage.setRefreshToken("old-rt");
        window.__toast = vi.fn();

        authChannelMock._handler("logout", { reason: "logout" });

        expect(tokenStorage.getToken()).toBeNull();
        expect(tokenStorage.getRefreshToken()).toBeNull();
    });

    it("本 Tab 登出会广播出去，但远端登出不会回弹成死循环", () => {
        window.__toast = vi.fn();

        window.dispatchEvent(
            new CustomEvent("auth:logout", { detail: { reason: "logout" } }),
        );
        expect(authChannelMock.publish).toHaveBeenCalledWith("logout", {
            reason: "logout",
        });

        authChannelMock.publish.mockClear();
        // 远端登出触发的本地清理不得再广播回其它 Tab
        authChannelMock._handler("logout", { reason: "logout" });
        expect(authChannelMock.publish).not.toHaveBeenCalled();
    });
});
