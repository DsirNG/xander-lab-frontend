import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useAgentConversationLive } from "./useAgentConversationLive";
import { getActiveImageGeneration } from "../utils/conversationState";

const preview = { tool: "image_generate", invocationId: "image-7-1",
    result: { url: "data:image/png;base64,YQ==", title: "Dog", storageStatus: "saving" } };

function useHarness() {
    const [steps, setLiveSteps] = useState([]);
    const live = useAgentConversationLive({ t: (key) => key, isCurrent: () => true,
        setConversation: vi.fn(), setErrorMessage: vi.fn(), setLiveSteps, updateRunning: vi.fn() });
    return { ...live, steps };
}

describe("live image preview delivery", () => {
    it("shows preview before storage and replaces it when the persisted image arrives", () => {
        const { result } = renderHook(useHarness);
        act(() => {
            result.current.applyEvent("7", 0, { id: 1, event: "tool_start", data: preview });
            result.current.applyEvent("7", 0, { id: 0, event: "image_preview", data: preview });
            result.current.applyEvent("7", 0, { id: 2, event: "tool_progress", data: { ...preview, progress: 100 } });
        });
        expect(result.current.steps.some(step => step.type === "image_preview")).toBe(true);
        expect(getActiveImageGeneration(result.current.steps)).toBeNull();
        act(() => result.current.applyEvent("7", 0, { id: 3, event: "tool_result",
            data: { ...preview, result: { url: "https://cdn.example/dog.png", assetId: 192 } } }));
        expect(result.current.steps.some(step => step.type === "image_preview")).toBe(false);
        expect(result.current.steps.at(-1).result.assetId).toBe(192);
    });

    it("keeps the generated preview on saving failure and removes it for a new run", () => {
        const { result } = renderHook(useHarness);
        act(() => {
            result.current.applyEvent("7", 0, { id: 0, event: "image_preview", data: preview });
            result.current.applyEvent("7", 0, { id: 1, event: "tool_error", data: preview });
            result.current.clearLiveState({ preserveImagePreviews: true });
        });
        expect(result.current.steps).toHaveLength(1);
        expect(result.current.steps[0].result.url).toBe(preview.result.url);
        act(() => result.current.beginRunGeneration(2));
        expect(result.current.steps).toHaveLength(0);
    });
});


describe("provisional answer and durable replay", () => {
    it("shows text before persistence and removes overlaps on replay or reconnect", async () => {
        const { result } = renderHook(useHarness);
        const emit = (id, event, data) => act(() => result.current.applyEvent("7", 0, { id, event, data }));
        emit(1, "started", {});
        emit(0, "answer_preview", { offset: 0, text: "Hello" });
        emit(0, "answer_preview", { offset: 5, text: " world" });
        await waitFor(() => expect(result.current.steps.find(s => s.type === "answer_delta")?.content).toBe("Hello world"));
        expect(result.current.cursorRef.current).toBe(1);
        emit(2, "answer_delta", "Hel");
        emit(2, "answer_delta", "Hel"); // Same event from a reconnect must not advance twice.
        emit(3, "answer_delta", "lo world!");
        emit(4, "complete", {});
        expect(result.current.steps.find(s => s.type === "answer_delta").content).toBe("Hello world!");
        expect(result.current.cursorRef.current).toBe(4);
    });

    it("reconstructs the same answer from durable strings after a page reload", () => {
        const { result } = renderHook(useHarness);
        act(() => {
            result.current.applyEvent("7", 0, { id: 2, event: "answer_delta", data: "Hello" });
            result.current.applyEvent("7", 0, { id: 3, event: "answer_delta", data: " world" });
            result.current.applyEvent("7", 0, { id: 4, event: "complete", data: {} });
        });
        expect(result.current.steps.find(s => s.type === "answer_delta").content).toBe("Hello world");
    });

    it("resets offsets for a new turn and ignores invalid or stale previews", () => {
        const { result } = renderHook(useHarness);
        act(() => {
            result.current.applyEvent("7", 0, { id: 0, event: "answer_preview", data: { offset: 0, text: "old" } });
            result.current.beginRunGeneration(2);
        });
        act(() => {
            result.current.applyEvent("7", 0, { id: 0, event: "answer_preview", data: { offset: 0, text: "stale" } });
            result.current.applyEvent("7", 1, { id: 0, event: "answer_preview", data: { offset: -1, text: "invalid" } });
            result.current.applyEvent("7", 1, { id: 0, event: "answer_preview", data: { offset: 0, text: "new" } });
            result.current.applyEvent("7", 1, { id: 1, event: "answer_delta", data: "new" });
            result.current.applyEvent("7", 1, { id: 2, event: "complete", data: {} });
        });
        expect(result.current.steps.find(s => s.type === "answer_delta").content).toBe("new");
    });
});
