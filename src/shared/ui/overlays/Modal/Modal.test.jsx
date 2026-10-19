import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "./index.jsx";

describe("Modal", () => {
    it("renders nothing when closed", () => {
        const { container } = render(
            <Modal isOpen={false} onClose={vi.fn()} title="标题">
                内容
            </Modal>,
        );
        expect(container).not.toHaveTextContent("标题");
    });

    it("renders the title and children when open", () => {
        render(
            <Modal isOpen onClose={vi.fn()} title="弹窗标题">
                <div>弹窗内容</div>
            </Modal>,
        );
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("弹窗标题")).toBeInTheDocument();
        expect(screen.getByText("弹窗内容")).toBeInTheDocument();
    });

    it("can render without a backdrop", () => {
        render(
            <Modal isOpen onClose={vi.fn()} title="无蒙版" showBackdrop={false}>
                内容
            </Modal>,
        );

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(document.querySelector("[data-modal-backdrop]")).toBeNull();
    });

    it("renders the footer when provided", () => {
        render(
            <Modal
                isOpen
                onClose={vi.fn()}
                title="标题"
                footer={<button type="button">确定</button>}
            >
                内容
            </Modal>,
        );
        expect(
            screen.getByRole("button", { name: "确定" }),
        ).toBeInTheDocument();
    });

    it("calls onClose when clicking the close button", () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="标题">
                内容
            </Modal>,
        );
        const closeButton = screen.getByRole("button", { name: /close/i });
        expect(closeButton).toHaveClass("h-10", "w-10");
        expect(closeButton.querySelector("svg")).toHaveClass("h-5", "w-5");
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when pressing Escape", () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen onClose={onClose} title="标题">
                内容
            </Modal>,
        );
        fireEvent.keyDown(window, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose for Escape when closeOnOutsideClick is false", () => {
        const onClose = vi.fn();
        render(
            <Modal
                isOpen
                onClose={onClose}
                title="标题"
                closeOnOutsideClick={false}
            >
                内容
            </Modal>,
        );
        fireEvent.keyDown(window, { key: "Escape" });
        expect(onClose).not.toHaveBeenCalled();
    });

    it("hides the close button when hideCloseButton is set", () => {
        render(
            <Modal isOpen onClose={vi.fn()} title="标题" hideCloseButton>
                内容
            </Modal>,
        );
        expect(
            screen.queryByRole("button", { name: /close/i }),
        ).not.toBeInTheDocument();
    });

    it("does not render the header when title is empty and close button is hidden", () => {
        render(
            <Modal isOpen onClose={vi.fn()} hideCloseButton>
                内容
            </Modal>,
        );
        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("restores body scroll when closed", () => {
        const { rerender } = render(
            <Modal isOpen onClose={vi.fn()} title="标题">
                内容
            </Modal>,
        );
        expect(document.body.style.overflow).toBe("hidden");
        rerender(
            <Modal isOpen={false} onClose={vi.fn()} title="标题">
                内容
            </Modal>,
        );
        expect(document.body.style.overflow).toBe("");
    });

    it("traps focus on Tab: wraps from the last focusable element to the first", () => {
        render(
            <Modal
                isOpen
                onClose={vi.fn()}
                title="标题"
                footer={
                    <>
                        <button type="button">取消</button>
                        <button type="button">确认</button>
                    </>
                }
            >
                内容
            </Modal>,
        );
        const close = screen.getByRole("button", { name: /close/i });
        const confirm = screen.getByRole("button", { name: "确认" });
        confirm.focus();
        fireEvent.keyDown(window, { key: "Tab" });
        expect(close).toHaveFocus();
    });
});

describe("nested Modal compatibility", () => {
    it("keeps the background locked and handles Escape only in the top dialog", () => {
        const outerClose = vi.fn();
        const innerClose = vi.fn();
        const { rerender } = render(
            <>
                <Modal isOpen onClose={outerClose} title="outer" />
                <Modal isOpen onClose={innerClose} title="inner" />
            </>,
        );
        fireEvent.keyDown(window, { key: "Escape" });
        expect(innerClose).toHaveBeenCalledTimes(1);
        expect(outerClose).not.toHaveBeenCalled();
        const ids = screen
            .getAllByRole("dialog")
            .map((dialog) => dialog.getAttribute("aria-labelledby"));
        expect(new Set(ids).size).toBe(2);
        rerender(
            <>
                <Modal isOpen onClose={outerClose} title="outer" />
                <Modal isOpen={false} onClose={innerClose} title="inner" />
            </>,
        );
        expect(document.body.style.overflow).toBe("hidden");
        fireEvent.keyDown(window, { key: "Escape" });
        expect(outerClose).toHaveBeenCalledTimes(1);
    });
    it("restores existing body styles after the last dialog unmounts", () => {
        document.body.style.overflow = "auto";
        document.body.style.paddingRight = "12px";
        const { unmount } = render(
            <Modal isOpen onClose={vi.fn()} title="dialog" />,
        );
        unmount();
        expect(document.body.style.overflow).toBe("auto");
        expect(document.body.style.paddingRight).toBe("12px");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
    });
});
