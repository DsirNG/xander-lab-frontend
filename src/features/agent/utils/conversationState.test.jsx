import { describe, expect, it } from "vitest";
import {
    getActiveImageGeneration,
    hasStreamingAnswer,
} from "./conversationState";

describe("agent conversation presentation state", () => {
    it("detects answer and answer delta steps", () => {
        expect(hasStreamingAnswer([{ type: "thought" }])).toBe(false);
        expect(hasStreamingAnswer([{ type: "answer_delta" }])).toBe(true);
        expect(hasStreamingAnswer([{ type: "answer" }])).toBe(true);
    });

    it("tracks the latest image generation progress message", () => {
        expect(
            getActiveImageGeneration([
                { type: "tool", tool: "image_generate", phase: "start" },
                {
                    type: "tool",
                    tool: "image_generate",
                    phase: "progress",
                    message: "正在生成",
                },
            ]),
        ).toEqual({ message: "正在生成" });
        expect(
            getActiveImageGeneration([
                { type: "tool", tool: "image_generate", phase: "end" },
            ]),
        ).toBeNull();
    });
});
