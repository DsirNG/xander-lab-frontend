import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ToastProvider, ToastContext } from "@components/common/Toast";
import { useToast } from "./useToast.js";

const renderWithProvider = () =>
    renderHook(() => useToast(), { wrapper: ToastProvider });

describe("useToast", () => {
    it("exposes the four toast methods and remove", () => {
        const { result } = renderWithProvider();
        expect(typeof result.current.success).toBe("function");
        expect(typeof result.current.error).toBe("function");
        expect(typeof result.current.info).toBe("function");
        expect(typeof result.current.warning).toBe("function");
        expect(typeof result.current.remove).toBe("function");
    });

    it("throws when used outside a ToastProvider", () => {
        expect(() => renderHook(() => useToast())).toThrow(
            "useToast must be used within a ToastProvider",
        );
    });

    it("keeps method references stable across renders", () => {
        const { result, rerender } = renderWithProvider();
        const first = result.current.success;
        rerender();
        expect(result.current.success).toBe(first);
    });

    it("exposes the live toast list through the context", () => {
        const listener = vi.fn();
        const renderToastList = () =>
            renderHook(
                () => {
                    const context = useContext(ToastContext);
                    listener(context.toasts);
                    return context;
                },
                { wrapper: ToastProvider },
            );
        const { result } = renderToastList();
        expect(result.current.toasts).toEqual([]);

        act(() => result.current.success("hello"));
        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0]).toMatchObject({
            message: "hello",
            type: "success",
        });
        expect(listener).toHaveBeenCalledTimes(2);
    });
});
