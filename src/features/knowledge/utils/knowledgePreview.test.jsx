import { describe, expect, it } from "vitest";
import {
    findKnowledgeChapter,
    formatKnowledgeDateTime,
    getKnowledgeChapterContent,
} from "./knowledgePreview";

describe("knowledge preview helpers", () => {
    it("formats valid and invalid dates consistently", () => {
        expect(formatKnowledgeDateTime("2026-09-21T12:04:00.000Z")).toMatch(
            /^2026-09-21 /,
        );
        expect(formatKnowledgeDateTime()).toBe("-");
        expect(formatKnowledgeDateTime("not-a-date")).toBe("-");
    });

    it("finds chapters recursively without depending on component state", () => {
        const chapters = [
            {
                id: "root",
                children: [{ id: "nested", title: "Nested" }],
            },
        ];

        expect(findKnowledgeChapter(chapters, "nested")).toEqual({
            id: "nested",
            title: "Nested",
        });
        expect(findKnowledgeChapter(chapters, "missing")).toBeNull();
    });

    it("prefers chapter offsets and falls back to preview text", () => {
        expect(
            getKnowledgeChapterContent({
                fullContent: "0123456789",
                fallbackText: "excerpt",
                chapter: { startOffset: 2, endOffset: 6 },
            }),
        ).toBe("2345");
        expect(
            getKnowledgeChapterContent({
                fullContent: null,
                fallbackText: "excerpt",
            }),
        ).toBe("excerpt");
    });
});
