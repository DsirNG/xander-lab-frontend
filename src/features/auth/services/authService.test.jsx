import { afterEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    tokenStorage: {
        setToken: vi.fn(),
        setRefreshToken: vi.fn(),
        getRefreshToken: vi.fn(),
        getToken: vi.fn(),
        clear: vi.fn(),
    },
}));

vi.mock("@api", () => apiMock);

const { authService } = await import("./authService.js");

afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

describe("authService.login", () => {
    it("调用 POST /api/auth/login 并保存令牌、用户信息与登录事件", async () => {
        const res = {
            accessToken: "at",
            refreshToken: "rt",
            userInfo: { id: 1, name: "tester" },
        };
        const eventSpy = vi.spyOn(window, "dispatchEvent");
        apiMock.post.mockResolvedValue(res);

        await expect(
            authService.login({ account: "a", password: "p" }),
        ).resolves.toBe(res);

        expect(apiMock.post).toHaveBeenCalledWith("/api/auth/login", {
            account: "a",
            password: "p",
        });
        expect(apiMock.tokenStorage.setToken).toHaveBeenCalledWith("at", {
            notify: false,
        });
        expect(apiMock.tokenStorage.setRefreshToken).toHaveBeenCalledWith("rt");
        expect(localStorage.getItem("user_info")).toBe(
            JSON.stringify(res.userInfo),
        );
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "auth:login",
                detail: { user: res.userInfo },
            }),
        );
    });

    it("无 accessToken 时不保存令牌、不分发事件", async () => {
        const eventSpy = vi.spyOn(window, "dispatchEvent");
        apiMock.post.mockResolvedValue({ code: 0 });

        await authService.login({ account: "a" });

        expect(apiMock.tokenStorage.setToken).not.toHaveBeenCalled();
        expect(apiMock.tokenStorage.setRefreshToken).not.toHaveBeenCalled();
        expect(eventSpy).not.toHaveBeenCalled();
    });
});

describe("authService.logout", () => {
    it("携带 refresh token 静默登出并清空会话、分发登出事件", async () => {
        apiMock.tokenStorage.getRefreshToken.mockReturnValue("rt");
        const eventSpy = vi.spyOn(window, "dispatchEvent");

        await authService.logout();

        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/auth/logout",
            { refreshToken: "rt" },
            { _silent: true, _skipAuthRecovery: true },
        );
        expect(apiMock.tokenStorage.clear).toHaveBeenCalled();
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "auth:logout",
                detail: { reason: "logout" },
            }),
        );
    });

    it("登出接口失败时仍然清空会话并分发事件", async () => {
        apiMock.post.mockRejectedValue(new Error("network"));
        const eventSpy = vi.spyOn(window, "dispatchEvent");

        await expect(authService.logout()).rejects.toThrow("network");

        expect(apiMock.tokenStorage.clear).toHaveBeenCalled();
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: "auth:logout" }),
        );
    });
});

describe("authService.checkCurrentSession", () => {
    it("无任何凭据时直接返回 null 且不发请求", async () => {
        apiMock.tokenStorage.getToken.mockReturnValue("");
        apiMock.tokenStorage.getRefreshToken.mockReturnValue("");

        await expect(authService.checkCurrentSession()).resolves.toBeNull();

        expect(apiMock.get).not.toHaveBeenCalled();
        expect(apiMock.tokenStorage.getRefreshToken).toHaveBeenCalled();
    });

    it("有 token 时以静默、去幂等配置请求 /me 并合并自定义 config", async () => {
        apiMock.tokenStorage.getToken.mockReturnValue("at");
        apiMock.get.mockResolvedValue({ id: 1 });

        const res = await authService.checkCurrentSession({ retry: 2 });

        expect(apiMock.get).toHaveBeenCalledWith("/api/auth/me", undefined, {
            _silent: true,
            dedupe: false,
            retry: 2,
        });
        expect(res).toEqual({ id: 1 });
    });
});

describe("authService 本地用户信息", () => {
    it("getLocalUserInfo 解析本地存储的 JSON，无数据返回 null", () => {
        expect(authService.getLocalUserInfo()).toBeNull();
        localStorage.setItem("user_info", '{"id":7}');
        expect(authService.getLocalUserInfo()).toEqual({ id: 7 });
    });

    it("setLocalUserInfo 传空值移除存储的条目", () => {
        localStorage.setItem("user_info", '{"id":7}');
        authService.setLocalUserInfo(null);
        expect(localStorage.getItem("user_info")).toBeNull();
        authService.setLocalUserInfo({ id: 8 });
        expect(localStorage.getItem("user_info")).toBe('{"id":8}');
    });
});

describe("authService 会话状态", () => {
    it("isLoggedIn 只看 access token", () => {
        apiMock.tokenStorage.getToken.mockReturnValue("");
        expect(authService.isLoggedIn()).toBe(false);
        apiMock.tokenStorage.getToken.mockReturnValue("at");
        expect(authService.isLoggedIn()).toBe(true);
    });

    it("hasSessionCredentials 接受 access 或 refresh 任一凭据", () => {
        apiMock.tokenStorage.getToken.mockReturnValue("");
        apiMock.tokenStorage.getRefreshToken.mockReturnValue("");
        expect(authService.hasSessionCredentials()).toBe(false);
        apiMock.tokenStorage.getRefreshToken.mockReturnValue("rt");
        expect(authService.hasSessionCredentials()).toBe(true);
    });
});
