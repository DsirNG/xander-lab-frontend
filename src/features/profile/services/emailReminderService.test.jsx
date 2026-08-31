import { afterEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
}));

vi.mock("@api/http", () => apiMock);

const { emailReminderService } = await import("./emailReminderService.js");

afterEach(() => {
    vi.clearAllMocks();
});

describe("emailReminderService.list 参数过滤", () => {
    it("过滤空值与 undefined/null，保留 0 值", () => {
        emailReminderService.list({ page: 2, size: 20, status: 0, search: "" });
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/email-reminders",
            { page: 2, size: 20, status: 0 },
            undefined,
        );
    });

    it("全部为空时退化为默认分页参数", () => {
        emailReminderService.list();
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/email-reminders",
            { page: 1, size: 10 },
            undefined,
        );
    });

    it("保留非空搜索词", () => {
        emailReminderService.list({ search: "csdn" });
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/email-reminders",
            { page: 1, size: 10, search: "csdn" },
            undefined,
        );
    });
});

describe("emailReminderService CRUD 端点映射", () => {
    it("创建与状态更新", () => {
        emailReminderService.create({ email: "a@b.c" }, { signal: 1 });
        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/email-reminders",
            { email: "a@b.c" },
            { signal: 1 },
        );
        emailReminderService.updateStatus(3, "PAUSED");
        expect(apiMock.patch).toHaveBeenCalledWith(
            "/api/email-reminders/3/status",
            { status: "PAUSED" },
            undefined,
        );
    });

    it("删除", () => {
        emailReminderService.remove(3);
        expect(apiMock.del).toHaveBeenCalledWith(
            "/api/email-reminders/3",
            undefined,
            undefined,
        );
    });
});
