import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useBlogPlans from "./useBlogPlans";
import { blogPlanService } from "../services/blogPlanService";
vi.mock("../services/blogPlanService", () => ({
    blogPlanService: { listPlans: vi.fn() },
}));
beforeEach(() => vi.clearAllMocks());
describe("plan list loading", () => {
    it("exposes a retryable error instead of showing failure as an empty successful list", async () => {
        blogPlanService.listPlans
            .mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValueOnce({ records: [{ id: 3 }], total: 1 });
        const { result } = renderHook(() => useBlogPlans());
        await waitFor(() => expect(result.current.loadError).toBe(true));
        expect(result.current.loading).toBe(false);
        await act(() => result.current.loadPlans());
        expect(result.current.plans).toEqual([{ id: 3 }]);
        expect(result.current.loadError).toBe(false);
    });
    it("ignores a late response from the previous page", async () => {
        let finishFirst;
        blogPlanService.listPlans
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finishFirst = resolve;
                    }),
            )
            .mockResolvedValueOnce({ records: [{ id: 20 }], total: 20 });
        const { result } = renderHook(() => useBlogPlans());
        act(() => result.current.setPage(2));
        await waitFor(() => expect(result.current.plans).toEqual([{ id: 20 }]));
        await act(async () => finishFirst({ records: [{ id: 1 }], total: 20 }));
        expect(result.current.plans).toEqual([{ id: 20 }]);
    });
});
