import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useClickOutside from "./useClickOutside.js";

describe("useClickOutside", () => {
    it("calls the callback when clicking outside the referenced element", () => {
        const callback = vi.fn();
        const ref = { current: document.createElement("div") };
        renderHook(() => useClickOutside(ref, callback));

        const outside = document.createElement("div");
        document.body.appendChild(outside);
        act(() => {
            document.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true }),
            );
        });
        expect(callback).toHaveBeenCalledTimes(1);
        outside.remove();
    });

    it("does not call the callback when clicking inside the referenced element", () => {
        const callback = vi.fn();
        const ref = { current: document.createElement("div") };
        const inside = document.createElement("button");
        ref.current.appendChild(inside);
        renderHook(() => useClickOutside(ref, callback));

        act(() => {
            inside.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true }),
            );
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it("does nothing when enabled is false", () => {
        const callback = vi.fn();
        const ref = { current: document.createElement("div") };
        renderHook(() => useClickOutside(ref, callback, false));

        act(() => {
            document.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true }),
            );
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it("removes the listener on unmount", () => {
        const callback = vi.fn();
        const ref = { current: document.createElement("div") };
        const { unmount } = renderHook(() => useClickOutside(ref, callback));
        unmount();

        act(() => {
            document.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true }),
            );
        });
        expect(callback).not.toHaveBeenCalled();
    });
});
