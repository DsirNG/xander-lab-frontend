import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toastMock } = vi.hoisted(() => ({
    toastMock: { warning: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

const hookState = { current: {} };

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ conversationId: "1" }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock("@/hooks/useToast", () => ({ useToast: () => toastMock }));
vi.mock("@/hooks/useIsMobile", () => ({ default: () => false }));
vi.mock("@/hooks/useClickOutside", () => ({ default: vi.fn() }));

vi.mock("@features/auth/context/authSessionContextValue", () => ({
    useAuthSession: () => ({
        userInfo: { nickname: "tester" },
        sessionStatus: "authenticated",
    }),
}));

// 附件上传是这条用例唯一要打桩的服务调用；parseToolPayload 要保留真实现，
// agentTrace 归并消息时依赖它。
vi.mock("../services/agentConversationService", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        agentConversationService: {
            uploadAttachment: vi.fn(async (file) => ({
                url: `https://cdn.example.com/${file.name}`,
                name: file.name,
                contentType: file.type || "text/plain",
            })),
        },
    };
});

// ./AgentChat 被整页导入（借它的 QuizMessage / PlanCard 等），顺带拖进这些依赖。
vi.mock("@/features/blog/services/blogAgentService", () => ({
    blogAgentService: { getTask: vi.fn().mockResolvedValue(null) },
}));
vi.mock("@/features/blog/components/agent/AgentSessionList", () => ({
    default: () => null,
}));
vi.mock("@/features/blog/components/agent/AgentPreviewPanel", () => ({
    default: () => null,
}));
vi.mock("@features/workspace/components/ProfileModal", () => ({
    default: () => null,
}));
vi.mock("../components/WorkspaceAgentSidebar", () => ({ default: () => null }));

vi.mock("../hooks/useAgentConversation", () => ({
    useAgentConversation: () => hookState.current,
}));

import WorkspaceAgentChat from "./WorkspaceAgentChat";

// jsdom 没实现 scrollIntoView，对话区"滚到底部"的 effect 会踩到它。
Element.prototype.scrollIntoView = vi.fn();

const QUIZ = {
    type: "quiz",
    id: "quiz-1",
    title: "JavaScript",
    questions: [
        {
            id: "q1",
            prompt: "Which value is truthy?",
            options: ["false", "true"],
        },
    ],
};

const quizMessage = {
    id: 11,
    role: "assistant",
    kind: "quiz",
    content: JSON.stringify(QUIZ),
};

const baseState = {
    sessions: [],
    conversation: { id: 1, title: "对话", status: "ready" },
    messages: [],
    loading: false,
    creating: false,
    running: false,
    approvals: [],
    decidingApprovalId: null,
    reconnecting: false,
    errorMessage: "",
    liveSteps: [],
    deepThinking: false,
    setDeepThinking: vi.fn(),
    sendMessage: vi.fn(),
    cancelTurn: vi.fn(),
    decideApproval: vi.fn(),
    createConversation: vi.fn(),
    setConversationPinned: vi.fn(),
    reset: vi.fn(),
};

const makeFiles = (count) =>
    Array.from(
        { length: count },
        (_, index) =>
            new File(["x"], `f${index}.txt`, { type: "text/plain" }),
    );

describe("WorkspaceAgentChat 答题卡提交", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hookState.current = {
            ...baseState,
            messages: [quizMessage],
            sendMessage: vi.fn().mockResolvedValue(true),
        };
    });

    it("sends the quiz payload without echoing the raw JSON as a user message", () => {
        // 回归：这条入口（/workspace/ai，主入口）漏了 displayUserMessage:false，
        // 提交后 {"type":"submit_quiz",…} 会当成用户消息显示在对话里。
        render(<WorkspaceAgentChat />);

        fireEvent.click(screen.getByRole("button", { name: /true/ }));
        fireEvent.click(
            screen.getByRole("button", {
                name: /Submit all answers|提交全部答案/,
            }),
        );

        expect(hookState.current.sendMessage).toHaveBeenCalledTimes(1);
        expect(hookState.current.sendMessage).toHaveBeenCalledWith(
            JSON.stringify({
                type: "submit_quiz",
                quiz_id: "quiz-1",
                answers: [{ question_id: "q1", answer: "true" }],
            }),
            { displayUserMessage: false },
        );
    });
});

describe("WorkspaceAgentChat 附件数量", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hookState.current = {
            ...baseState,
            sendMessage: vi.fn().mockResolvedValue(true),
        };
    });

    it("warns when the picked files exceed the remaining slots", async () => {
        // 回归：AgentChat 早有这条提示，这份漏了 —— 一次拖 6 个附件会被静默截成 5 个，
        // 用户以为第 6 个也传上去了。
        const { container } = render(<WorkspaceAgentChat />);

        fireEvent.change(container.querySelector('input[type="file"]'), {
            target: { files: makeFiles(6) },
        });

        await waitFor(() =>
            expect(toastMock.warning).toHaveBeenCalledWith(
                expect.stringMatching(/最多上传 5 个附件|up to 5 attachments/),
            ),
        );
    });

    it("stays quiet when everything fits", async () => {
        const { container } = render(<WorkspaceAgentChat />);

        fireEvent.change(container.querySelector('input[type="file"]'), {
            target: { files: makeFiles(3) },
        });

        await waitFor(() =>
            expect(container.querySelectorAll("img, div").length).toBeGreaterThan(
                0,
            ),
        );
        expect(toastMock.warning).not.toHaveBeenCalled();
    });
});
