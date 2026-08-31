import { describe, expect, it } from "vitest";
import { milliPer1kToYuanPerM, yuanPerMToMilliPer1k } from "./pricingUnits.js";

describe("pricingUnits", () => {
    it("converts yuan per million tokens to milli-points per thousand tokens", () => {
        expect(yuanPerMToMilliPer1k(2)).toBe(20);
        expect(yuanPerMToMilliPer1k(12)).toBe(120);
        expect(yuanPerMToMilliPer1k(0.2)).toBe(2);
    });

    it("converts persisted milli-point prices back to yuan per million tokens", () => {
        expect(milliPer1kToYuanPerM(20)).toBe(2);
        expect(milliPer1kToYuanPerM(120)).toBe(12);
        expect(milliPer1kToYuanPerM(2)).toBe(0.2);
    });
});
