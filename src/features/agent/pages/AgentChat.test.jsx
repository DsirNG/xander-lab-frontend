import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
    ImageToolProgressPanel,
    ImageToolResult,
    PlanCard,
    ThinkingIndicator,
} from "./AgentChat";
import { SelfCheckCard } from "../components/AgentTraceCard";
import QuizCardStack from "../components/QuizCardStack";
import { parseQuizPayload } from "../components/quizPayload";

describe("ThinkingIndicator", () => {
    it("announces the pending response and renders stable animated dots", () => {
        const { container } = render(<ThinkingIndicator label="Working..." />);

        expect(screen.getByRole("status")).toHaveAttribute(
            "aria-live",
            "polite",
        );
        expect(screen.getByRole("status")).toHaveAttribute(
            "aria-label",
            "Working...",
        );
        expect(screen.queryByText("Working...")).not.toBeInTheDocument();
        expect(container.querySelectorAll(".animate-bounce")).toHaveLength(3);
    });
});

describe("PlanCard", () => {
    const plan = [
        { title: "查知识库", status: "DONE", note: "" },
        { title: "整理复习清单", status: "IN_PROGRESS", note: "按掌握度排序" },
        { title: "生成配图", status: "DROPPED", note: "" },
        { title: "发布", status: "PENDING", note: "" },
    ];

    it("lists every step and strikes through the ones that are already settled", () => {
        const { container } = render(<PlanCard items={plan} />);

        expect(container.querySelectorAll("li")).toHaveLength(4);
        expect(screen.getByText("查知识库")).toHaveClass("line-through");
        expect(screen.getByText("生成配图")).toHaveClass("line-through");
        expect(screen.getByText("整理复习清单")).not.toHaveClass(
            "line-through",
        );
        expect(screen.getByText("发布")).not.toHaveClass("line-through");
        expect(screen.getByText("— 按掌握度排序")).toBeInTheDocument();
    });

    it("renders nothing when the agent has no plan yet", () => {
        const { container } = render(<PlanCard items={[]} />);

        expect(container).toBeEmptyDOMElement();
    });

    it("falls back to the pending style for an unknown status", () => {
        render(
            <PlanCard
                items={[{ title: "未知状态", status: "WAT", note: "" }]}
            />,
        );

        expect(screen.getByText("未知状态")).not.toHaveClass("line-through");
    });
});

describe("SelfCheckCard", () => {
    const critique =
        "还有 1 个步骤没有收口：用 plan_tasks 把它标成 DONE 或 DROPPED";

    it("keeps the raw critique in the detail view instead of the timeline", () => {
        render(<SelfCheckCard content={critique} round={2} />);

        // 主时间线上只留一句人话，给模型看的工具名和状态枚举不该糊在用户脸上。
        expect(screen.queryByText(/plan_tasks/)).not.toBeInTheDocument();

        const toggle = screen.getByRole("button");
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(toggle.textContent).toContain("2");
        expect(toggle.textContent).not.toContain("blog.agentChat");

        fireEvent.click(toggle);

        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText(/plan_tasks/)).toBeInTheDocument();
    });

    it("renders nothing without a critique", () => {
        const { container } = render(<SelfCheckCard content="" round={1} />);

        expect(container).toBeEmptyDOMElement();
    });
});

describe("image generation UI", () => {
    it("renders the dedicated animated generation state", () => {
        const { container } = render(
            <ImageToolProgressPanel message="正在生成图片…" />,
        );

        expect(screen.getByRole("status")).toHaveTextContent("正在生成图片…");
        expect(container.querySelectorAll(".animate-bounce")).toHaveLength(3);
        expect(
            container.querySelectorAll(".animate-pulse").length,
        ).toBeGreaterThan(0);
    });

    it("renders a generated image inline instead of a view link", () => {
        render(
            <ImageToolResult
                url="https://cdn.example.com/cat.png"
                title="可爱小猫"
            />,
        );

        const image = screen.getByRole("img", { name: "可爱小猫" });
        expect(image).toHaveAttribute("src", "https://cdn.example.com/cat.png");
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
});

describe("QuizCardStack", () => {
    const quiz = {
        type: "quiz",
        id: "quiz-1",
        title: "JavaScript",
        questions: [
            {
                id: "q1",
                prompt: "Which value is truthy?",
                options: ["false", "true"],
            },
            {
                id: "q2",
                prompt: "Type a value",
                type: "text",
            },
        ],
    };

    it("keeps answers across cards and submits them as one payload", async () => {
        const onSubmit = vi.fn();
        render(<QuizCardStack payload={quiz} onSubmit={onSubmit} />);

        fireEvent.click(screen.getByRole("button", { name: /true/ }));
        fireEvent.click(screen.getByRole("button", { name: /Next|下一题/ }));
        fireEvent.change(
            screen.getByPlaceholderText(/Type your answer|输入你的答案/),
            { target: { value: "42" } },
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: /Submit all answers|提交全部答案/,
            }),
        );

        expect(onSubmit).toHaveBeenCalledWith({
            type: "submit_quiz",
            quiz_id: "quiz-1",
            answers: [
                { question_id: "q1", answer: "true" },
                { question_id: "q2", answer: "42" },
            ],
        });
    });

    it("parses a quiz embedded in an assistant message", () => {
        expect(parseQuizPayload({ content: JSON.stringify(quiz) })).toEqual(quiz);
    });
});
