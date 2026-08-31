import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CustomSelect from "./index";

const options = Array.from({ length: 10 }, (_, index) => ({
    value: String(index),
    label: `Option ${index}`,
}));

describe("CustomSelect menu boundaries", () => {
    it("keeps the menu in the component tree and limits it to the space below", async () => {
        render(
            <div data-testid="scroll-area" style={{ overflowY: "auto" }}>
                <CustomSelect
                    options={options}
                    value="0"
                    onChange={() => {}}
                    placeholder="Choose"
                />
            </div>,
        );
        const trigger = screen.getByRole("combobox", { name: "Choose" });
        const select = trigger.parentElement;
        vi.spyOn(select, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 100,
            right: 200,
            bottom: 142,
            width: 200,
            height: 42,
        });
        vi.spyOn(
            screen.getByTestId("scroll-area"),
            "getBoundingClientRect",
        ).mockReturnValue({
            left: 0,
            top: 50,
            right: 300,
            bottom: 250,
            width: 300,
            height: 200,
        });

        fireEvent.click(trigger);
        const listbox = await screen.findByRole("listbox");

        await waitFor(() =>
            expect(listbox).toHaveStyle({ maxHeight: "100px" }),
        );
        expect(select).toContainElement(listbox);
        expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("opens upward and limits height when the space above is larger", async () => {
        render(
            <div data-testid="scroll-area" style={{ overflowY: "auto" }}>
                <CustomSelect
                    options={options}
                    value="0"
                    onChange={() => {}}
                    placeholder="Choose"
                />
            </div>,
        );
        const trigger = screen.getByRole("combobox", { name: "Choose" });
        const select = trigger.parentElement;
        vi.spyOn(select, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 200,
            right: 200,
            bottom: 242,
            width: 200,
            height: 42,
        });
        vi.spyOn(
            screen.getByTestId("scroll-area"),
            "getBoundingClientRect",
        ).mockReturnValue({
            left: 0,
            top: 50,
            right: 300,
            bottom: 260,
            width: 300,
            height: 210,
        });

        fireEvent.click(trigger);
        const listbox = await screen.findByRole("listbox");

        await waitFor(() =>
            expect(listbox).toHaveStyle({ maxHeight: "142px" }),
        );
        expect(listbox.parentElement.className).toContain("upward");
    });
});
