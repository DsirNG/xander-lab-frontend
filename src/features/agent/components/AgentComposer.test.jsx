import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentComposer from "./AgentComposer";

const renderComposer = (overrides = {}) => {
    const onSubmit = vi.fn();
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
            onCancel={vi.fn()}
            onToggleDeepThinking={vi.fn()}
            t={(key, fallback) => fallback || key}
            {...overrides}
        />,
    );
    return { onSubmit };
};

describe("AgentComposer 回车发送", () => {
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
});
