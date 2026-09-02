import { act, renderHook, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toolCallSummary, compactToolResult } from "./useAgentConversation.js";
import { agentConversationService } from "../services/agentConversationService.js";

const { translate } = vi.hoisted(() => ({ translate: (key) => key }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: translate }),
}));

vi.mock("../services/agentConversationService.js", () => ({
    agentConversationService: {
        create: vi.fn(),
        list: vi.fn(),
        get: vi.fn(),
        sendMessageStream: vi.fn(),
        subscribeEvents: vi.fn(),
        cancel: vi.fn(),
        markRead: vi.fn(() => Promise.resolve(null)),
        pin: vi.fn(() => Promise.resolve(null)),
        unpin: vi.fn(() => Promise.resolve(null)),
    },
    parseToolPayload: (content) => {
        if (!content) return null;
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
    agentConversationService.list.mockResolvedValue([]);
});

describe("toolCallSummary", () => {
    it("extracts the tool name from the parsed payload", () => {
        const message = { content: '{"tool":"webSearch","query":"x"}' };
        const summary = toolCallSummary(message, vi.fn());
        expect(summary.tool).toBe("webSearch");
        expect(summary.payload).toEqual({ tool: "webSearch", query: "x" });
    });

    it("falls back to message.toolName when the payload has no tool", () => {
        const summary = toolCallSummary(
            { content: '{"a":1}', toolName: "readFile" },
            vi.fn(),
        );
        expect(summary.tool).toBe("readFile");
    });

    it("uses the translated unknown label when nothing is available", () => {
        const t = vi.fn((key) => `i18n:${key}`);
        const summary = toolCallSummary({ content: "bad json" }, t);
        expect(summary.tool).toBe("i18n:blog.agentChat.unknownTool");
        expect(t).toHaveBeenCalledWith("blog.agentChat.unknownTool");
    });

    it("returns null payload for empty content", () => {
        const summary = toolCallSummary({}, vi.fn());
        expect(summary.payload).toBe(null);
    });
});

describe("compactToolResult", () => {
    it("passes short strings through unchanged", () => {
        expect(compactToolResult("ok")).toBe("ok");
    });

    it("serializes objects", () => {
        expect(compactToolResult({ a: 1 })).toBe('{"a":1}');
    });

    it("truncates long strings to 200 chars with an ellipsis", () => {
        const long = "x".repeat(500);
        const compact = compactToolResult(long);
        expect(compact).toHaveLength(201);
        expect(compact.endsWith("…")).toBe(true);
    });

    it("serializes long objects and truncates the result", () => {
        const compact = compactToolResult({ data: "y".repeat(300) });
        expect(compact).toHaveLength(201);
    });

    it("returns undefined for nullish input", () => {
        expect(compactToolResult(null)).toBe("null");
        expect(compactToolResult(undefined)).toBeUndefined();
        expect(compactToolResult("")).toBe("");
    });
});

describe("useAgentConversation new conversation", () => {
    it("keeps the empty page state while the create request is pending", async () => {
        const { useAgentConversation } =
            await import("./useAgentConversation.js");
        let resolveCreate;
        agentConversationService.create.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveCreate = resolve;
                }),
        );
        const { result } = renderHook(() =>
            useAgentConversation({ conversationId: null }),
        );

        let request;
        act(() => {
            request = result.current.createConversation("hello");
        });

        expect(result.current.creating).toBe(true);
        expect(result.current.liveSteps).toEqual([]);

        await act(async () => {
            resolveCreate({
                conversation: {
                    id: 42,
                    title: "hello",
                    status: "ready",
                    runVersion: 1,
                },
                messages: [],
            });
            await request;
        });
        expect(result.current.creating).toBe(false);
        expect(result.current.liveSteps).toContainEqual({
            type: "user",
            content: "hello",
        });
    });

    it("uses the created shell without entering recovery loading and streams the first message", async () => {
        const { useAgentConversation } =
            await import("./useAgentConversation.js");
        const calls = [];
        const shell = {
            conversation: { id: 42, status: "ready", runVersion: 0 },
            messages: [],
        };
        agentConversationService.create.mockImplementation(async () => {
            calls.push("create");
            return shell;
        });
        agentConversationService.sendMessageStream.mockImplementation(() => {
            calls.push("stream");
            return new Promise(() => {});
        });
        agentConversationService.get.mockImplementation(async () => {
            calls.push("get");
            return shell;
        });

        const wrapper = ({ children }) => <StrictMode>{children}</StrictMode>;
        const { result, rerender } = renderHook(
            ({ conversationId }) => useAgentConversation({ conversationId }),
            { initialProps: { conversationId: null }, wrapper },
        );

        await act(async () => {
            await result.current.createConversation("hello");
        });
        expect(agentConversationService.create).toHaveBeenCalledWith(
            "hello",
            expect.objectContaining({ _silent: true }),
        );
        expect(result.current.sessions).toContainEqual(shell.conversation);
        expect(result.current.liveSteps).toContainEqual({
            type: "user",
            content: "hello",
        });
        rerender({ conversationId: "42" });

        expect(result.current.loading).toBe(false);
        await waitFor(() =>
            expect(
                agentConversationService.sendMessageStream,
            ).toHaveBeenCalledWith(
                "42",
                "hello",
                [],
                expect.any(Function),
                expect.objectContaining({ _silent: true }),
                false,
            ),
        );
        expect(
            agentConversationService.sendMessageStream,
        ).toHaveBeenCalledTimes(1);
        expect(result.current.liveSteps).toContainEqual({
            type: "user",
            content: "hello",
        });
        expect(agentConversationService.get).not.toHaveBeenCalled();
    });
});

describe("useAgentConversation autonomy events", () => {
    // 拿到服务端流的 onEvent 回调，直接喂 plan/reflection 事件，不必真的起一条 SSE。
    const streamHarness = async () => {
        const { useAgentConversation } =
            await import("./useAgentConversation.js");
        const shell = {
            conversation: { id: 42, status: "ready", runVersion: 0 },
            messages: [],
        };
        let onEvent;
        agentConversationService.create.mockResolvedValue(shell);
        agentConversationService.get.mockResolvedValue(shell);
        agentConversationService.sendMessageStream.mockImplementation(
            (id, text, files, listener) => {
                onEvent = listener;
                return new Promise(() => {});
            },
        );

        const { result, rerender } = renderHook(
            ({ conversationId }) => useAgentConversation({ conversationId }),
            { initialProps: { conversationId: null } },
        );
        await act(async () => {
            await result.current.createConversation("hello");
        });
        rerender({ conversationId: "42" });
        await waitFor(() => expect(typeof onEvent).toBe("function"));

        return {
            result,
            emit: async (payload) => {
                await act(async () => {
                    onEvent(payload);
                });
            },
        };
    };

    it("keeps one plan step and replaces it whenever the agent rewrites the plan", async () => {
        const { result, emit } = await streamHarness();

        await emit({
            id: 1,
            event: "plan",
            data: { items: [{ title: "查知识库", status: "IN_PROGRESS" }] },
        });
        await emit({ id: 2, event: "thought", data: "先看看素材库里有什么" });
        await emit({
            id: 3,
            event: "plan",
            data: {
                items: [
                    { title: "查知识库", status: "DONE" },
                    {
                        title: "整理复习清单",
                        status: "PENDING",
                        note: "按掌握度排序",
                    },
                ],
            },
        });

        const planSteps = result.current.liveSteps.filter(
            (step) => step.type === "plan",
        );
        expect(planSteps).toHaveLength(1);
        expect(planSteps[0].items).toEqual([
            { title: "查知识库", status: "DONE" },
            { title: "整理复习清单", status: "PENDING", note: "按掌握度排序" },
        ]);
        // 计划就地替换，但不能吃掉它之后到达的其他步骤。
        expect(result.current.liveSteps).toContainEqual({
            type: "thought",
            content: "先看看素材库里有什么",
        });
    });

    it("drops a malformed plan payload instead of rendering a broken card", async () => {
        const { result, emit } = await streamHarness();

        await emit({ id: 1, event: "plan", data: { items: "not-an-array" } });

        expect(result.current.liveSteps).toContainEqual({
            type: "plan",
            items: [],
        });
    });

    it("restores the persisted plan when an existing conversation is opened", async () => {
        const { useAgentConversation } =
            await import("./useAgentConversation.js");
        agentConversationService.get.mockResolvedValue({
            conversation: {
                id: 42,
                status: "ready",
                runVersion: 3,
                planJson: JSON.stringify([
                    { title: "设计连接协议", status: "DONE" },
                    { title: "编写客户端", status: "IN_PROGRESS" },
                ]),
            },
            messages: [],
        });

        const { result } = renderHook(() =>
            useAgentConversation({ conversationId: "42" }),
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.messages).toContainEqual(
            expect.objectContaining({
                kind: "plan",
                content: JSON.stringify([
                    { title: "设计连接协议", status: "DONE" },
                    { title: "编写客户端", status: "IN_PROGRESS" },
                ]),
            }),
        );
    });

    it("keeps one historical plan card per user turn and uses its latest status", async () => {
        const { useAgentConversation } =
            await import("./useAgentConversation.js");
        agentConversationService.get.mockResolvedValue({
            conversation: { id: 42, status: "ready", runVersion: 3 },
            messages: [
                { id: 1, role: "user", kind: "message", content: "first" },
                { id: 2, role: "assistant", kind: "thought", content: "plan" },
                {
                    id: 3,
                    role: "assistant",
                    kind: "plan",
                    content: '[{"title":"first","status":"IN_PROGRESS"}]',
                },
                {
                    id: 4,
                    role: "assistant",
                    kind: "plan",
                    content: '[{"title":"first","status":"DONE"}]',
                },
                { id: 5, role: "user", kind: "message", content: "second" },
                {
                    id: 6,
                    role: "assistant",
                    kind: "plan",
                    content: '[{"title":"second","status":"IN_PROGRESS"}]',
                },
            ],
        });

        const { result } = renderHook(() =>
            useAgentConversation({ conversationId: "42" }),
        );
        await waitFor(() => expect(result.current.loading).toBe(false));

        const plans = result.current.messages.filter(
            (message) => message.kind === "plan",
        );
        expect(plans).toHaveLength(2);
        expect(plans[0].id).toBe(3);
        expect(plans[0].content).toContain('"DONE"');
        expect(plans[1].id).toBe(6);
    });

    it("withdraws the streamed answer draft when the self-check rejects the reply", async () => {
        const { result, emit } = await streamHarness();

        await emit({ id: 1, event: "answer_delta", data: "都办好了" });
        await waitFor(() =>
            expect(result.current.liveSteps).toContainEqual({
                type: "answer_delta",
                content: "都办好了",
            }),
        );

        await emit({
            id: 2,
            event: "reflection",
            data: { round: 1, critique: "还有 1 个步骤没有收口" },
        });

        expect(
            result.current.liveSteps.some(
                (step) => step.type === "answer_delta",
            ),
        ).toBe(false);
        expect(result.current.liveSteps).toContainEqual({
            type: "reflection",
            round: 1,
            content: "还有 1 个步骤没有收口",
        });

        // 缓冲里的草稿也必须清掉，否则下一帧会把"已完成"重新画回来。
        await emit({
            id: 3,
            event: "answer_delta",
            data: "实际结论是查询失败",
        });
        await waitFor(() =>
            expect(result.current.liveSteps).toContainEqual({
                type: "answer_delta",
                content: "实际结论是查询失败",
            }),
        );
    });

    it("shows the code deliverable as soon as it streams and replaces a revised one", async () => {
        const { result, emit } = await streamHarness();
        const first = {
            type: "artifact",
            id: "artifact-42-1",
            files: [{ path: "server.js", content: "const ws = 1;" }],
        };

        await emit({ id: 1, event: "artifact", data: first });
        await emit({ id: 2, event: "thought", data: "两个文件都写好了" });
        await emit({
            id: 3,
            event: "artifact",
            data: { ...first, files: [{ path: "server.js", content: "const ws = 2;" }] },
        });

        const artifacts = result.current.liveSteps.filter(
            (step) => step.type === "artifact",
        );
        // 同一张卡改了一版就地替换，否则时间线上并排堆两份源码。
        expect(artifacts).toHaveLength(1);
        expect(artifacts[0].payload.files[0].content).toBe("const ws = 2;");
        // 替换不能吃掉它之后到达的其他步骤。
        expect(result.current.liveSteps).toContainEqual({
            type: "thought",
            content: "两个文件都写好了",
        });

        // 另一张卡（新的 id）是新的交付物，要另开一张。
        await emit({
            id: 4,
            event: "artifact",
            data: { ...first, id: "artifact-42-2" },
        });

        expect(
            result.current.liveSteps.filter((step) => step.type === "artifact"),
        ).toHaveLength(2);
    });
});

describe("useAgentConversation deep thinking preference", () => {
    const openReadyConversation = async () => {
        const { useAgentConversation } =
            await import("./useAgentConversation.js");
        agentConversationService.get.mockResolvedValue({
            conversation: { id: 42, status: "ready", runVersion: 3 },
            messages: [],
        });
        agentConversationService.sendMessageStream.mockImplementation(
            () => new Promise(() => {}),
        );
        const { result } = renderHook(() =>
            useAgentConversation({ conversationId: "42" }),
        );
        await waitFor(() => expect(result.current.loading).toBe(false));
        return result;
    };

    beforeEach(() => {
        window.localStorage.removeItem("agent.deepThinking");
    });

    it("defaults to off so a normal turn is not slowed down by self-checks", async () => {
        const result = await openReadyConversation();

        expect(result.current.deepThinking).toBe(false);

        await act(async () => {
            result.current.sendMessage("帮我写点东西");
        });

        expect(
            agentConversationService.sendMessageStream,
        ).toHaveBeenCalledWith(
            "42",
            "帮我写点东西",
            [],
            expect.any(Function),
            expect.objectContaining({ _silent: true }),
            false,
        );
    });

    it("forwards the flag and remembers the choice once the user turns it on", async () => {
        const result = await openReadyConversation();

        act(() => {
            result.current.setDeepThinking(true);
        });
        expect(result.current.deepThinking).toBe(true);
        expect(window.localStorage.getItem("agent.deepThinking")).toBe("1");

        await act(async () => {
            result.current.sendMessage("帮我把计划做完");
        });

        expect(
            agentConversationService.sendMessageStream,
        ).toHaveBeenCalledWith(
            "42",
            "帮我把计划做完",
            [],
            expect.any(Function),
            expect.objectContaining({ _silent: true }),
            true,
        );
    });

    it("restores the stored preference on mount", async () => {
        window.localStorage.setItem("agent.deepThinking", "1");

        const result = await openReadyConversation();

        expect(result.current.deepThinking).toBe(true);
    });
});
