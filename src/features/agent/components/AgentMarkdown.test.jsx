import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentMarkdown from "./AgentMarkdown";

vi.mock("@shared/ui/data-display/CodeBlock", () => ({
    default: ({ code, language, appearance }) => (
        <div
            data-testid="code-block"
            data-language={language}
            data-appearance={appearance}
        >
            {code}
        </div>
    ),
}));

describe("AgentMarkdown", () => {
    it("anchors the streaming cursor to the Markdown content instead of its container edge", () => {
        const { container } = render(
            <AgentMarkdown content="The answer ends here." isStreaming />,
        );

        const markdown = container.querySelector(".prose");
        const cursor = container.querySelector("[data-streaming-cursor]");

        expect(cursor).toBeInTheDocument();
        expect(cursor.parentElement).toBe(markdown);
        expect(cursor).toHaveAttribute("aria-hidden", "true");
    });

    it("positions the streaming cursor at the measured end of the rendered text", () => {
        const rangeDescriptor = Object.getOwnPropertyDescriptor(
            Range.prototype,
            "getBoundingClientRect",
        );
        const measuredRange = vi.fn(function measureRange() {
            return { left: 260, right: 260, top: 154, height: 24 };
        });
        Object.defineProperty(Range.prototype, "getBoundingClientRect", {
            configurable: true,
            value: measuredRange,
        });
        const rootRect = { left: 100, top: 50 };
        const elementRectSpy = vi
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockImplementation(function getElementRect() {
                return this.classList?.contains("prose")
                    ? rootRect
                    : { left: 0, top: 0 };
            });

        try {
            const { container } = render(
                <AgentMarkdown content="The answer ends here." isStreaming />,
            );
            const cursor = container.querySelector("[data-streaming-cursor]");

            expect(cursor.style.left).toBe("160px");
            expect(cursor.style.top).toBe("108px");
        } finally {
            elementRectSpy.mockRestore();
            if (rangeDescriptor) {
                Object.defineProperty(
                    Range.prototype,
                    "getBoundingClientRect",
                    rangeDescriptor,
                );
            } else {
                delete Range.prototype.getBoundingClientRect;
            }
        }
    });

    it("renders GFM structure and secures external links", () => {
        const content = [
            "## Result",
            "",
            "- first",
            "- second",
            "",
            "[OpenAI](https://openai.com)",
            "",
            "| Name | State |",
            "| --- | --- |",
            "| Agent | ready |",
        ].join("\n");

        const { container } = render(<AgentMarkdown content={content} />);

        expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
        expect(
            container.querySelector("h1, h2, h3, p"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Result")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "OpenAI" })).toHaveAttribute(
            "target",
            "_blank",
        );
        expect(screen.getByRole("link", { name: "OpenAI" })).toHaveAttribute(
            "rel",
            "noopener noreferrer",
        );
        expect(container.querySelector("script")).not.toBeInTheDocument();
    });

    it("routes fenced HTML through the shared sandbox-capable code block", () => {
        render(
            <AgentMarkdown content={"```html\n<button>Run</button>\n```"} />,
        );

        expect(screen.getByTestId("code-block")).toHaveAttribute(
            "data-language",
            "html",
        );
        expect(screen.getByTestId("code-block")).toHaveAttribute(
            "data-appearance",
            "conversation",
        );
        expect(screen.getByTestId("code-block")).toHaveTextContent(
            "<button>Run</button>",
        );
        expect(
            screen.queryByRole("button", { name: "Run" }),
        ).not.toBeInTheDocument();
    });

    it("keeps raw HTML inert instead of injecting it into the page", () => {
        const { container } = render(
            <AgentMarkdown content={"<button>Unsafe</button>"} />,
        );

        expect(
            screen.queryByRole("button", { name: "Unsafe" }),
        ).not.toBeInTheDocument();
        expect(container).toHaveTextContent("<button>Unsafe</button>");
    });

    it("unescapes model-escaped backticks so inline code renders without raw backticks", () => {
        const content =
            "使用 \\`Axios + onDownloadProgress\\` 接收 SSE 流，不使用原生 \\`EventSource\\`";
        const { container } = render(<AgentMarkdown content={content} />);

        const codes = container.querySelectorAll("code");
        expect(codes).toHaveLength(2);
        expect(codes[0]).toHaveTextContent("Axios + onDownloadProgress");
        expect(codes[1]).toHaveTextContent("EventSource");
        expect(container.textContent).not.toContain("`");
    });

    it("renders standard and model-style TeX expressions with KaTeX", () => {
        const content = [
            "特殊角求值 (\\sin30^\\circ=\\frac12)",
            "",
            "[ \\sin30^\\circ+\\cos60^\\circ=1 ]",
            "",
            "\\(\\tan\\alpha=\\frac34\\)",
            "",
            "\\[\\sin^2\\alpha+\\cos^2\\alpha=1\\]",
        ].join("\n");
        const { container } = render(<AgentMarkdown content={content} />);

        expect(container.querySelectorAll(".katex")).toHaveLength(4);
        expect(container.querySelectorAll(".katex-display")).toHaveLength(1);
        expect(container.querySelectorAll(".katex-html")).toHaveLength(4);
    });

    it("renders unambiguous plain-text fractions and radicals as KaTeX", () => {
        const { container } = render(
            <AgentMarkdown content="正弦值是 3/5，且 sin 60° = √3/2。" />,
        );

        expect(container.querySelectorAll(".katex")).toHaveLength(2);
        expect(container.querySelector(".katex-error")).not.toBeInTheDocument();
    });

    it("preserves LaTeX parentheses inside display equations", () => {
        const content = String.raw`\[
\left(\frac35\right)^2+\cos^2\alpha=1
\]`;
        const { container } = render(<AgentMarkdown content={content} />);

        expect(container.querySelectorAll(".katex")).toHaveLength(1);
        expect(container.querySelector(".katex-error")).not.toBeInTheDocument();
        expect(container).toHaveTextContent("cos");
        expect(container.textContent).not.toContain("\\left$");
    });

    it("renders boxed answer content without a cramped formula frame", () => {
        const content = String.raw`\[
\boxed{\frac12，\quad \frac12，\quad 1}
\]`;
        const { container } = render(<AgentMarkdown content={content} />);

        expect(container.querySelectorAll(".katex")).toHaveLength(1);
        expect(container.querySelector(".fbox")).not.toBeInTheDocument();
        expect(container.querySelector(".katex-error")).not.toBeInTheDocument();
    });
});
