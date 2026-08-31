import { describe, expect, it } from "vitest";
import { parseToolPayload } from "./agentConversationService.js";

describe("parseToolPayload", () => {
    it("parses valid json content", () => {
        const payload = parseToolPayload(
            '{"tool":"webSearch","query":"react"}',
        );
        expect(payload).toEqual({ tool: "webSearch", query: "react" });
    });

    it("returns null for invalid json", () => {
        expect(parseToolPayload("not-json")).toBe(null);
    });

    it("returns null for empty content", () => {
        expect(parseToolPayload("")).toBe(null);
        expect(parseToolPayload(null)).toBe(null);
        expect(parseToolPayload(undefined)).toBe(null);
    });
});
