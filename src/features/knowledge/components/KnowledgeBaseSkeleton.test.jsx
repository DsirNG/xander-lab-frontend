import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KnowledgeBaseSkeleton from "./KnowledgeBaseSkeleton";

describe("KnowledgeBaseSkeleton theme", () => {
    it("uses theme tokens for its background, cards, and placeholders", () => {
        const { container } = render(<KnowledgeBaseSkeleton />);
        const skeleton = container.querySelector('[aria-busy="true"]');

        expect(skeleton).toHaveClass("bg-canvas", "text-ink-secondary");
        expect(skeleton.querySelector(".animate-pulse")).toHaveClass(
            "bg-ink-muted/10",
        );
        expect(skeleton.querySelectorAll(".bg-surface").length).toBeGreaterThan(
            0,
        );
        expect(
            [...skeleton.querySelectorAll("[class]")].some((element) =>
                [...element.classList].some((className) =>
                    /^(?:bg|border)-white(?:\/|$)|^bg-\[#/i.test(className),
                ),
            ),
        ).toBe(false);
    });
});
