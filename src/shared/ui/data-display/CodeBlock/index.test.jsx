import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CodeBlock from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("@shared/ui/data-display/SyntaxHighlighter", () => ({
    default: ({ style, showLineNumbers }) =>
        React.createElement("div", {
            "data-testid": "syntax-highlighter",
            "data-code-background":
                style['pre[class*="language-"]']?.background,
            "data-line-numbers": String(showLineNumbers),
        }),
}));

vi.mock("@shared/ui/primitives/Button", () => ({
    default: ({ title, ...props }) =>
        React.createElement("button", { title, ...props }),
}));

afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.theme;
});

describe("CodeBlock theme", () => {
    it("uses the dark syntax theme and updates when the app theme changes", async () => {
        document.documentElement.dataset.theme = "dark";
        const { getByTestId } = render(
            <CodeBlock code="wsl --status" language="powershell" appearance="conversation" />,
        );

        const highlighter = getByTestId("syntax-highlighter");
        expect(highlighter).toHaveAttribute("data-code-background", "#1e1e1e");

        document.documentElement.dataset.theme = "light";
        await waitFor(() =>
            expect(highlighter).toHaveAttribute(
                "data-code-background",
                "hsl(230, 1%, 98%)",
            ),
        );
    });

    it("uses the compact conversation style without line numbers", () => {
        const { container, getByTestId, getByText } = render(
            <CodeBlock code="echo hello" language="bash" appearance="conversation" />,
        );

        expect(getByText("Bash")).toBeInTheDocument();
        expect(getByTestId("syntax-highlighter")).toHaveAttribute(
            "data-line-numbers",
            "false",
        );
        expect(container.firstChild).not.toHaveClass("border");
    });

    it("keeps line numbers in the default code block", () => {
        const { getByTestId } = render(
            <CodeBlock code="echo hello" language="bash" />,
        );

        expect(getByTestId("syntax-highlighter")).toHaveAttribute(
            "data-line-numbers",
            "true",
        );
    });
});
