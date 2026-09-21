import { describe, expect, it } from "vitest";
import { TIMEZONE_OPTIONS, getZoneOffsetLabel } from "./timezones.js";

describe("timezones", () => {
    it("provides the common scheduling zones", () => {
        const values = TIMEZONE_OPTIONS.map((option) => option.value);
        expect(values).toContain("Asia/Shanghai");
        expect(values).toContain("Asia/Tokyo");
        expect(values).toContain("UTC");
        expect(values).toContain("America/New_York");
        expect(values).toContain("Australia/Sydney");
    });

    it("keeps every option labeled and offset-decorated", () => {
        TIMEZONE_OPTIONS.forEach((option) => {
            expect(option.label).toMatch(/\(GMT[+-]\d{2}:\d{2}\)/);
            expect(option.offset).toMatch(/^[+-]\d{2}:\d{2}$/);
        });
    });

    it("computes the current offset label for a known zone", () => {
        const label = getZoneOffsetLabel(
            "Asia/Shanghai",
            new Date("2026-01-15T12:00:00Z"),
        );
        expect(label).toMatch(/GMT\+0?8/);
    });

    it("falls back to GMT for invalid zones", () => {
        expect(getZoneOffsetLabel("Not/A_Zone")).toBe("GMT");
    });

    it("reflects daylight saving transitions for DST zones", () => {
        const summer = getZoneOffsetLabel(
            "Europe/Paris",
            new Date("2026-07-15T12:00:00Z"),
        );
        const winter = getZoneOffsetLabel(
            "Europe/Paris",
            new Date("2026-01-15T12:00:00Z"),
        );
        expect(summer).toMatch(/GMT\+0?2/);
        expect(winter).toMatch(/GMT\+0?1/);
    });
});
