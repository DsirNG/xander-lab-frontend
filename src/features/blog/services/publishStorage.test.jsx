import { describe, expect, it, beforeEach } from "vitest";
import {
    DRAFT_STORAGE_KEY,
    PUBLISH_REQUEST_STORAGE_KEY,
    clearDraft,
    clearPublishRequestId,
    createPublishRequestId,
    ensurePublishRequestId,
    getPublishRequestId,
    loadDraft,
    saveDraft,
} from "./publishStorage.js";

describe("publishStorage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe("draft", () => {
        it("saves and loads a draft round-trip", () => {
            const form = { title: "你好", content: "正文", tags: ["a", "b"] };
            expect(saveDraft(form)).toBe(true);
            expect(loadDraft()).toEqual(form);
        });

        it("normalizes missing tags to an empty array", () => {
            localStorage.setItem(
                DRAFT_STORAGE_KEY,
                JSON.stringify({ title: "x", content: "y" }),
            );
            expect(loadDraft()).toEqual({ title: "x", content: "y", tags: [] });
        });

        it("returns null and clears the key when the draft is corrupt", () => {
            localStorage.setItem(DRAFT_STORAGE_KEY, "{not-json");
            expect(loadDraft()).toBe(null);
            expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(null);
        });

        it("returns null when no draft exists", () => {
            expect(loadDraft()).toBe(null);
        });

        it("clears the draft", () => {
            saveDraft({ title: "x" });
            clearDraft();
            expect(loadDraft()).toBe(null);
        });
    });

    describe("publish request id", () => {
        it("creates a unique id when none exists", () => {
            const first = createPublishRequestId();
            const second = createPublishRequestId();
            expect(first).toBeTruthy();
            expect(first).not.toBe(second);
        });

        it("persists the id across calls", () => {
            const id = ensurePublishRequestId();
            expect(getPublishRequestId()).toBe(id);
            expect(ensurePublishRequestId()).toBe(id);
        });

        it("clears the id", () => {
            ensurePublishRequestId();
            clearPublishRequestId();
            expect(getPublishRequestId()).toBe(null);
        });
    });
});
