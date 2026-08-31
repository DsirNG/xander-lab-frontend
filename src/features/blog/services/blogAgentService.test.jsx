import { afterEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
    get: vi.fn(),
    getStream: vi.fn(),
    post: vi.fn(),
    postStream: vi.fn(),
}));

vi.mock("@api", () => apiMock);

const { blogAgentService } = await import("./blogAgentService.js");

afterEach(() => {
    vi.clearAllMocks();
});

describe("blogAgentService 任务 CRUD", () => {
    it("创建/会话列表/详情端点映射", () => {
        blogAgentService.createTask({ brief: "b" }, { signal: 1 });
        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/blog-agent/tasks",
            { brief: "b" },
            { signal: 1 },
        );
        blogAgentService.getSessions();
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/blog-agent/tasks",
            undefined,
            undefined,
        );
        blogAgentService.getTask(9);
        expect(apiMock.get).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9",
            undefined,
            undefined,
        );
    });
});

describe("blogAgentService 流式接口", () => {
    it("subscribeTaskEvents 无 afterEventId 时不注入参数与头", () => {
        const onEvent = vi.fn();
        blogAgentService.subscribeTaskEvents(9, 0, onEvent, { signal: 1 });
        expect(apiMock.getStream).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/events",
            {
                signal: 1,
                onEvent,
                params: undefined,
                headers: undefined,
            },
        );
    });

    it("subscribeTaskEvents 注入 afterEventId 参数与 Last-Event-ID 头且不覆盖既有配置", () => {
        const onEvent = vi.fn();
        blogAgentService.subscribeTaskEvents(9, 42, onEvent, {
            params: { a: 1 },
            headers: { "X-Custom": "v" },
        });
        expect(apiMock.getStream).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/events",
            {
                params: { a: 1, afterEventId: 42 },
                headers: { "X-Custom": "v", "Last-Event-ID": "42" },
                onEvent,
            },
        );
    });

    it("runTaskStream 与 reviseTaskStream 透传 onEvent", () => {
        const onEvent = vi.fn();
        blogAgentService.runTaskStream(9, onEvent, { signal: 1 });
        expect(apiMock.postStream).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/run/stream",
            undefined,
            {
                onEvent,
                signal: 1,
            },
        );
        blogAgentService.reviseTaskStream(9, "新内容", onEvent);
        expect(apiMock.postStream).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/messages/stream",
            { content: "新内容" },
            { onEvent },
        );
    });
});

describe("blogAgentService 同步执行", () => {
    it("runTask 关闭幂等去重并放宽超时", () => {
        blogAgentService.runTask(9);
        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/run",
            undefined,
            { dedupe: false, timeout: 120000 },
        );
        blogAgentService.runTask(9, { timeout: 5000, signal: 1 });
        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/run",
            undefined,
            { dedupe: false, timeout: 5000, signal: 1 },
        );
    });

    it("publishTask 关闭幂等去重且不限时", () => {
        blogAgentService.publishTask(9);
        expect(apiMock.post).toHaveBeenCalledWith(
            "/api/blog-agent/tasks/9/publish",
            undefined,
            { dedupe: false, timeout: 0 },
        );
    });
});
