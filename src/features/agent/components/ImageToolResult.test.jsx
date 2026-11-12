import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ImageToolResult from "./ImageToolResult";

describe("ImageToolResult", () => {
    it("renders an inline provider image before OSS storage completes", () => {
        const { rerender } = render(<ImageToolResult url="data:image/png;base64,YQ==" title="Dog" storageStatus="saving" />);
        expect(screen.getByRole("img", { name: "Dog" })).toHaveAttribute("src", "data:image/png;base64,YQ==");
        expect(screen.getByRole("status")).toBeInTheDocument();
        rerender(<ImageToolResult url="https://cdn.example/dog.png" title="Dog" />);
        expect(screen.getByRole("img", { name: "Dog" })).toHaveAttribute("src", "https://cdn.example/dog.png");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});
