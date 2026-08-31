import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BlogMarkdown from "./BlogMarkdown";

vi.mock("@/components/common/CodeBlock", () => ({
    default: () => <div />,
}));

describe("BlogMarkdown", () => {
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
        const { container } = render(<BlogMarkdown content={content} />);

        expect(container.querySelectorAll(".katex")).toHaveLength(4);
        expect(container.querySelectorAll(".katex-display")).toHaveLength(1);
        expect(container.querySelectorAll(".katex-html")).toHaveLength(4);
    });
});
