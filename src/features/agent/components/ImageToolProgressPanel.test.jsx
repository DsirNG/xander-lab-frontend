import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageToolProgressPanel } from "./AgentMessageParts";

describe("ImageToolProgressPanel", () => {
    it("shows only a corner percentage and updates it without a progress bar", () => {
        const { rerender } = render(<ImageToolProgressPanel progress={12} />);
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        expect(screen.getByText("12%")).toBeInTheDocument();
        rerender(<ImageToolProgressPanel progress={68} />);
        expect(screen.getByText("68%")).toBeInTheDocument();
        rerender(<ImageToolProgressPanel progress={100} />);
        expect(screen.getByText("100%")).toBeInTheDocument();
    });
});
