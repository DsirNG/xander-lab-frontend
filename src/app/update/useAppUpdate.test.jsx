import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAppUpdate from "./useAppUpdate.js";

const { APP_UPDATE_EVENT, requireAppUpdate, get } = vi.hoisted(() => ({
    APP_UPDATE_EVENT: "app:update-required",
    requireAppUpdate: vi.fn(),
    get: vi.fn(),
}));

vi.mock("./appUpdate", () => ({ APP_UPDATE_EVENT, requireAppUpdate }));
vi.mock("@api/http", () => ({ get }));
vi.stubEnv("VITE_APP_VERSION", "1.2.3");

const staleManifest = { version: "2.0.0" };

const mount = async () => {
    let result;
    let unmount;
    await act(async () => {
        const r = renderHook(() => useAppUpdate());
        result = r.result;
        unmount = r.unmount;
    });
    return { result, unmount };
};

beforeEach(() => {
    vi.useFakeTimers();
    get.mockReset();
    requireAppUpdate.mockClear();
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe("useAppUpdate", () => {
    it("挂载时立即检查版本，版本不一致时触发更新", async () => {
        get.mockResolvedValue(staleManifest);

        const { result, unmount } = await mount();
        unmount();

        expect(get).toHaveBeenCalledWith(
            "/version.json",
            { t: expect.any(Number) },
            expect.objectContaining({
                baseURL: "",
                _silent: true,
                _skipRetry: true,
                dedupe: false,
                withToken: false,
            }),
        );
        expect(requireAppUpdate).toHaveBeenCalledTimes(1);
        expect(result.current).toBe(false);
    });

    it("版本一致或请求失败时静默跳过", async () => {
        get.mockResolvedValue({ version: "1.2.3" });
        let unmount = (await mount()).unmount;
        unmount();
        expect(requireAppUpdate).not.toHaveBeenCalled();

        requireAppUpdate.mockClear();
        get.mockClear();
        get.mockRejectedValueOnce(new Error("offline"));
        unmount = (await mount()).unmount;
        unmount();
        expect(requireAppUpdate).not.toHaveBeenCalled();
    });

    it("页面回到前台时重新检查版本", async () => {
        get.mockResolvedValue(staleManifest);

        const { unmount } = await mount();
        unmount();
        expect(requireAppUpdate).toHaveBeenCalledTimes(1);

        requireAppUpdate.mockClear();
        get.mockClear();
        get.mockResolvedValue(staleManifest);

        await mount();
        expect(requireAppUpdate).toHaveBeenCalledTimes(1);
        await act(async () => {
            document.dispatchEvent(new Event("visibilitychange"));
        });
        unmount();

        expect(requireAppUpdate).toHaveBeenCalledTimes(2);
    });

    it("监听更新事件置 updateRequired 为 true，卸载后定时器不再检查", async () => {
        get.mockResolvedValue(staleManifest);

        const { result, unmount } = await mount();
        expect(result.current).toBe(false);

        act(() => {
            window.dispatchEvent(new CustomEvent(APP_UPDATE_EVENT));
        });
        expect(result.current).toBe(true);

        await act(async () => {
            unmount();
            vi.advanceTimersByTime(2 * 60 * 1000);
        });
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("vite:preloadError 事件触发更新", async () => {
        get.mockResolvedValue(staleManifest);

        let unmount;
        await mount().then((r) => {
            unmount = r.unmount;
        });

        const event = new Event("vite:preloadError", { cancelable: true });
        act(() => {
            window.dispatchEvent(event);
        });
        expect(event.defaultPrevented).toBe(true);
        expect(requireAppUpdate).toHaveBeenCalledTimes(2);

        unmount();
    });
});
