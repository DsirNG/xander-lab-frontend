import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hookState = { current: {} };

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ warning: vi.fn(), success: vi.fn(), error: vi.fn() }),
}));

vi.mock("@/hooks/useIsMobile", () => ({ default: () => false }));
vi.mock("@/hooks/useClickOutside", () => ({ default: vi.fn() }));

vi.mock("@features/auth/context/authSessionContextValue", () => ({
    useAuthSession: () => ({ userInfo: { nickname: "tester" }, sessionStatus: "authenticated" }),
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

const IMAGE_URL = "https://cdn.example.com/photos/blog/agent/cat.png";

const baseState = {
    sessions: [],
    sessionsLoading: false,
    conversation: { id: 1, title: "图片对话", status: "running" },
    messages: [],
    loading: false,
    creating: false,
    running: true,
    reconnecting: false,
    errorMessage: "",
    deepThinking: false,
    setDeepThinking: vi.fn(),
    sendMessage: vi.fn(),
    cancelTurn: vi.fn(),
    createConversation: vi.fn(),
    reset: vi.fn(),
};

/** 图片工具已经跑完，但图片地址在正文里还在一个字符一个字符地写。 */
const streamedImageTurn = (answerContent) => ({
    ...baseState,
    liveSteps: [
        { type: "user", content: "帮我画一只猫" },
        {
            type: "tool",
            tool: "image_generate",
            phase: "end",
            result: { tool: "image_generate", url: IMAGE_URL, title: "可爱小猫" },
        },
        { type: "answer_delta", content: answerContent },
    ],
});

describe("AgentChat 流式图片地址", () => {
    beforeEach(() => {
        hookState.current = baseState;
    });

    it("图片地址写了一半也不能露出来——这正是「先看到链接、随后又隐藏」的成因", () => {
        hookState.current = streamedImageTurn(
            `图片已生成：![可爱小猫](${IMAGE_URL.slice(0, 30)}`,
        );

        render(<AgentChat />);

        expect(screen.getByRole("img", { name: "可爱小猫" })).toHaveAttribute(
            "src",
            IMAGE_URL,
        );
        expect(screen.queryByText(new RegExp(IMAGE_URL.slice(0, 20)))).not.toBeInTheDocument();
    });

    it("地址写完后正文不展示，图片仍然在", () => {
        hookState.current = streamedImageTurn(`图片已生成：${IMAGE_URL}`);

        render(<AgentChat />);

        expect(screen.getByRole("img", { name: "可爱小猫" })).toHaveAttribute(
            "src",
            IMAGE_URL,
        );
        expect(screen.queryByText(IMAGE_URL)).not.toBeInTheDocument();
    });

    it("没有图片的普通流式回答照常展示", () => {
        hookState.current = {
            ...baseState,
            liveSteps: [{ type: "answer_delta", content: "正在为你整理复习清单" }],
        };

        render(<AgentChat />);

        expect(screen.getByText("正在为你整理复习清单")).toBeInTheDocument();
    });
});
