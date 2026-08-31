import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./index.jsx";

describe("LoadingSpinner", () => {
    it("renders the spinner without text by default", () => {
        render(<LoadingSpinner fullScreen={false} />);
        expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders the optional text", () => {
        render(<LoadingSpinner fullScreen={false} text="加载中..." />);
        expect(screen.getByText("加载中...")).toBeInTheDocument();
    });

    it("fills the viewport when fullScreen", () => {
        const { container } = render(<LoadingSpinner fullScreen />);
        expect(container.firstChild).toHaveClass("min-h-screen");
    });

    it("sizes the spinner with the sm size class", () => {
        const { container } = render(
            <LoadingSpinner fullScreen={false} size="sm" />,
        );
        expect(container.querySelector(".animate-spin")).toHaveClass(
            "w-5",
            "h-5",
        );
    });

    it("sizes the spinner with the lg size class", () => {
        const { container } = render(
            <LoadingSpinner fullScreen={false} size="lg" />,
        );
        expect(container.querySelector(".animate-spin")).toHaveClass(
            "w-12",
            "h-12",
        );
    });
});
