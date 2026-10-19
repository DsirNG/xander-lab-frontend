import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorkspaceHomeSkeleton from "./WorkspaceHomeSkeleton";

describe("WorkspaceHomeSkeleton theme", () => {
    it("uses theme tokens for the page and its cards", () => {
        const { container } = render(<WorkspaceHomeSkeleton />);
        const skeleton = container.querySelector('[aria-busy="true"]');

        expect(skeleton).toHaveClass("bg-canvas", "text-ink-secondary");
        expect(skeleton.querySelector(".animate-pulse")).toHaveClass(
            "bg-ink-muted/10",
        );
        expect(skeleton.querySelectorAll(".bg-surface").length).toBeGreaterThan(
            0,
        );
        expect(skeleton.querySelector(".bg-surface-muted")).toBeInTheDocument();
    });
});
