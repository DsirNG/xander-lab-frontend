import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hookState = { current: {} };

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ conversationId: "1" }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ warning: vi.fn(), success: vi.fn(), error: vi.fn() }),
}));

vi.mock("@/hooks/useIsMobile", () => ({ default: () => false }));
vi.mock("@/hooks/useClickOutside", () => ({ default: vi.fn() }));

vi.mock("@features/auth/context/authSessionContextValue", () => ({
    useAuthSession: () => ({
        userInfo: { nickname: "tester" },
        sessionStatus: "authenticated",
    }),
}));

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

vi.mock("../hooks/useAgentConversation", () => ({
    useAgentConversation: () => hookState.current,
}));

import AgentChat from "./AgentChat";

const PENDING_APPROVAL = {
    id: 91,
    toolName: "publish_post",
    status: "PENDING",
    summaryJson: JSON.stringify({
        tool: "publish_post",
        reason: "把这篇稿子发布到线上站点",
    }),
};

const baseState = {
    sessions: [],
    sessionsLoading: false,
    conversation: { id: 1, title: "待审批对话", status: "awaiting_approval" },
    messages: [
        {
            id: 1,
            role: "assistant",
            kind: "answer",
            content: "我要发布这篇文章，等你确认。",
        },
    ],
    loading: false,
    creating: false,
    running: false,
    approvals: [PENDING_APPROVAL],
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
    reset: vi.fn(),
};

describe("AgentChat 审批卡", () => {
    beforeEach(() => {
        hookState.current = { ...baseState };
    });

    it("renders the pending approval so the user can actually answer it", () => {
        // 回归：/workspace/agent 这条入口此前只渲染消息，把 hook 已经取回的 approvals 丢掉，
        // 卡在 awaiting_approval 的一轮既看不到审批卡、也没有别的办法继续。
        render(<AgentChat />);

        expect(
            screen.getByText(/Your approval is required|需要你的确认/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Approve|批准执行/ }),
        ).toBeInTheDocument();
    });

    it("locks the composer while the run is waiting for that approval", () => {
        // 待审批不是"这一轮结束了"：输入框不锁就能再发一轮，把待审批的那轮直接顶掉。
        render(<AgentChat />);

        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("unlocks the composer once the run is done", () => {
        hookState.current = {
            ...baseState,
            conversation: { id: 1, title: "已完成对话", status: "ready" },
            approvals: [],
        };

        render(<AgentChat />);

        expect(screen.getByRole("textbox")).toBeEnabled();
    });
});
