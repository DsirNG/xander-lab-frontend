import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentComposer from "./AgentComposer";

const renderComposer = (overrides = {}) => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
        <AgentComposer
            input="你好"
            attachments={[]}
            locked={false}
            uploadingAttachments={false}
            canSend
            isActive={false}
            fileInputRef={createRef()}
            textareaRef={createRef()}
            onInputChange={vi.fn()}
            onFilesSelected={vi.fn()}
            onRemoveAttachment={vi.fn()}
            onSubmit={onSubmit}
            onCancel={onCancel}
            onToggleDeepThinking={vi.fn()}
            t={(key, fallback) => fallback || key}
            {...overrides}
        />,
    );
    return { onSubmit, onCancel };
};

describe("AgentComposer 回车发送", () => {
    it("keeps the expanded draft stable when its text fits only at the wider expanded width", () => {
        const scrollHeight = vi
            .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
            .mockImplementation(function () {
                return this.closest("[data-multiline]").dataset.multiline ===
                    "true"
                    ? 40
                    : 64;
            });
        try {
            renderComposer({ input: "临界宽度下刚好需要换行的消息" });
            const textarea = screen.getByRole("textbox");
            expect(textarea.closest("[data-multiline]")).toHaveAttribute(
                "data-multiline",
                "true",
            );
            expect(textarea.style.height).toBe("40px");
            expect(scrollHeight.mock.calls.length).toBeLessThan(5);
        } finally {
            scrollHeight.mockRestore();
        }
    });

    it("collapses an expanded draft after the input is cleared", () => {
        const scrollHeight = vi
            .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
            .mockImplementation(function () {
                return this.value ? 64 : 40;
            });
        try {
            const Harness = () => {
                const [input, setInput] = React.useState("需要换行的消息");
                const textareaRef = React.useRef(null);
                return (
                    <AgentComposer
                        input={input}
                        attachments={[]}
                        textareaRef={textareaRef}
                        fileInputRef={React.useRef(null)}
                        onInputChange={setInput}
                        t={(key) => key}
                    />
                );
            };
            render(<Harness />);
            const textarea = screen.getByRole("textbox");
            expect(textarea.closest("[data-multiline]")).toHaveAttribute(
                "data-multiline",
                "true",
            );
            fireEvent.change(textarea, { target: { value: "" } });
            expect(textarea.closest("[data-multiline]")).toHaveAttribute(
                "data-multiline",
                "false",
            );
        } finally {
            scrollHeight.mockRestore();
        }
    });

    it("sends on a plain Enter", () => {
        const { onSubmit } = renderComposer();

        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("keeps Shift+Enter as a newline", () => {
        const { onSubmit } = renderComposer();

        fireEvent.keyDown(screen.getByRole("textbox"), {
            key: "Enter",
            shiftKey: true,
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("lets the IME keep Enter while a candidate is being composed", () => {
        // 回归：中文/日文输入法里回车是"确认候选词"，不是发送。
        // 不判合成态的话，拼音打到一半就被当成发送——输入框被清空，
        // 一条带着半截拼音的消息飞出去。
        const { onSubmit } = renderComposer();

        fireEvent.keyDown(screen.getByRole("textbox"), {
            key: "Enter",
            isComposing: true,
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does not send while the composer is locked", () => {
        const { onSubmit } = renderComposer({ locked: true });

        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows a disabled stopping state after the stop action starts", () => {
        const { onCancel } = renderComposer({
            isActive: true,
            isCancelling: true,
        });
        const stopButton = screen.getByRole("button", {
            name: "blog.agentChat.stopping",
        });

        expect(stopButton).toBeDisabled();
        fireEvent.click(stopButton);
        expect(onCancel).not.toHaveBeenCalled();
    });
});
