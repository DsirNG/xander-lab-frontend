import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorkspaceAgentSkeleton from "./WorkspaceAgentSkeleton";

describe("WorkspaceAgentSkeleton theme", () => {
    it("uses theme tokens for the chat surface, message bubbles, and placeholders", () => {
        const { container } = render(<WorkspaceAgentSkeleton />);
        const skeleton = container.querySelector('[aria-busy="true"]');

        expect(skeleton).toHaveClass("bg-canvas");
        expect(skeleton.querySelector(".animate-pulse")).toHaveClass(
            "bg-ink-muted/10",
        );
        expect(skeleton.querySelector(".bg-accent-soft")).toBeInTheDocument();
        expect(
            [...skeleton.querySelectorAll("[class]")].some((element) =>
                [...element.classList].some((className) =>
                    /^(?:bg|border)-white(?:\/|$)|^bg-\[#/i.test(className),
                ),
            ),
        ).toBe(false);
    });
});
