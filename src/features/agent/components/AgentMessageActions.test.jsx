import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AgentMessageActions from "./AgentMessageActions";
import { AgentConversationMessage } from "./AgentConversationMessage";
import WorkspaceAgentConversationMessage from "./WorkspaceAgentConversationMessage";

const writeText = vi.fn();

beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
    });
});

describe("message actions", () => {
    it.each(["user", "assistant"])(
        "copies the complete %s message Markdown",
        async (role) => {
            const content =
                "正文\n```markdown\n![Stars](徽章图片地址)\n```\n结尾";
            render(<AgentMessageActions content={content} role={role} />);
            fireEvent.click(screen.getByRole("button", { name: "Copy" }));
            await waitFor(() =>
                expect(
                    screen.getByRole("button", { name: "Copied to clipboard" }),
                ).toBeInTheDocument(),
            );
            expect(writeText).toHaveBeenCalledExactlyOnceWith(content);
        },
    );

    it("hides actions until the answer finishes streaming", () => {
        const { rerender } = render(
            <AgentMessageActions content="回答" isStreaming />,
        );
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        rerender(<AgentMessageActions content="回答" isStreaming={false} />);
        expect(
            screen.getByRole("button", { name: "Copy" }),
        ).toBeInTheDocument();
    });

    it("reports clipboard failure and permits retry", async () => {
        writeText.mockRejectedValueOnce(new Error("denied"));
        render(<AgentMessageActions content="回答" />);
        fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent("Copy failed"),
        );
        fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: "Copied to clipboard" }),
            ).toBeInTheDocument(),
        );
        expect(writeText).toHaveBeenCalledTimes(2);
    });

    it.each([AgentConversationMessage, WorkspaceAgentConversationMessage])(
        "keeps badge examples in code and preserves surrounding text",
        (Message) => {
            render(
                <Message
                    role="assistant"
                    content={
                        "作者配置徽章。\n\n```markdown\n[![Stars](徽章图片地址)](项目地址)\n```\n\n查看源码。"
                    }
                />,
            );
            expect(screen.getByText("作者配置徽章。")).toBeInTheDocument();
            expect(screen.getByText("查看源码。")).toBeInTheDocument();
            expect(
                screen.queryByRole("img", { name: "Stars" }),
            ).not.toBeInTheDocument();
            expect(document.querySelector("code")).toHaveTextContent(
                "[![Stars](徽章图片地址)](项目地址)",
            );
        },
    );
});
