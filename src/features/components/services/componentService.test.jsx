import { afterEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@api", () => apiMock);

const { default: ComponentService } = await import("./componentService.js");

afterEach(() => {
    vi.clearAllMocks();
});

describe("ComponentService", () => {
    it("getMenu 默认 zh 并可传语言", () => {
        ComponentService.getMenu();
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/components/menu",
            { lang: "zh" },
            undefined,
        );
        ComponentService.getMenu("en", { signal: 1 });
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/components/menu",
            { lang: "en" },
            { signal: 1 },
        );
    });

    it("getComponentDetail 与 shareComponent 端点映射", () => {
        ComponentService.getComponentDetail("comp-1");
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/components/comp-1",
            { lang: "zh" },
            undefined,
        );
        ComponentService.getComponentDetail("comp-1", "en");
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/components/comp-1",
            { lang: "en" },
            undefined,
        );
        ComponentService.shareComponent({ titleZh: "t" });
        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/components/share",
            { titleZh: "t" },
            undefined,
        );
    });
});
