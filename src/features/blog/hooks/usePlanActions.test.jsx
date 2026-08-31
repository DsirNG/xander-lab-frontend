import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlanActions } from "./usePlanActions.js";

const planServiceMock = vi.hoisted(() => ({
    updatePlanStatus: vi.fn(),
    triggerPlan: vi.fn(),
    deletePlan: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("../services/blogPlanService", () => ({
    blogPlanService: planServiceMock,
}));
vi.mock("@/hooks/useToast", () => ({ useToast: () => toastMock }));

const t = (key) => `t:${key}`;
const plan = { id: 9, topic: "AI 主题" };

beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
});

describe("usePlanActions 成功路径", () => {
    it.each([
        ["pause", "PAUSED", "blogPlans.paused"],
        ["resume", "RESUME", "blogPlans.resumed"],
        ["cancel", "CANCELLED", "blogPlans.cancelled"],
    ])("%s 更新状态为 %s 并提示", async (action, status, okKey) => {
        planServiceMock.updatePlanStatus.mockResolvedValue({});
        const onChanged = vi.fn();
        const { result } = renderHook(() => usePlanActions({ onChanged, t }));

        await act(async () => {
            await result.current[action](plan);
        });

        expect(planServiceMock.updatePlanStatus).toHaveBeenCalledWith(
            9,
            status,
        );
        expect(toastMock.success).toHaveBeenCalledWith(`t:${okKey}`);
        expect(onChanged).toHaveBeenCalled();
        expect(result.current.busyId).toBeNull();
    });

    it("trigger 立即执行并提示", async () => {
        planServiceMock.triggerPlan.mockResolvedValue({});
        const { result } = renderHook(() =>
            usePlanActions({ onChanged: vi.fn(), t }),
        );

        await act(async () => {
            await result.current.trigger(plan);
        });

        expect(planServiceMock.triggerPlan).toHaveBeenCalledWith(9);
        expect(toastMock.success).toHaveBeenCalledWith("t:blogPlans.triggered");
    });

    it("remove 确认后删除并刷新", async () => {
        planServiceMock.deletePlan.mockResolvedValue({});
        const onChanged = vi.fn();
        const { result } = renderHook(() => usePlanActions({ onChanged, t }));

        await act(async () => {
            await result.current.remove(plan);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "t:blogPlans.deleteConfirm".replace("{{topic}}", plan.topic),
        );
        expect(planServiceMock.deletePlan).toHaveBeenCalledWith(9);
        expect(toastMock.success).toHaveBeenCalledWith("t:blogPlans.deleted");
        expect(onChanged).toHaveBeenCalled();
    });

    it("remove 取消确认时不执行删除", async () => {
        window.confirm = vi.fn(() => false);
        const { result } = renderHook(() =>
            usePlanActions({ onChanged: vi.fn(), t }),
        );

        await act(async () => {
            await result.current.remove(plan);
        });

        expect(planServiceMock.deletePlan).not.toHaveBeenCalled();
        expect(toastMock.success).not.toHaveBeenCalled();
    });
});

describe("usePlanActions 失败路径", () => {
    it("优先展示后端错误信息，否则用失败文案", async () => {
        planServiceMock.updatePlanStatus.mockRejectedValue({
            response: { data: { message: "服务器忙" } },
        });
        const { result } = renderHook(() =>
            usePlanActions({ onChanged: vi.fn(), t }),
        );

        await act(async () => {
            await result.current.pause(plan);
        });

        expect(toastMock.error).toHaveBeenCalledWith("服务器忙");
        expect(result.current.busyId).toBeNull();
    });

    it("无后端错误信息时回退失败文案", async () => {
        planServiceMock.triggerPlan.mockRejectedValue(new Error("net"));
        const { result } = renderHook(() =>
            usePlanActions({ onChanged: vi.fn(), t }),
        );

        await act(async () => {
            await result.current.trigger(plan);
        });

        expect(toastMock.error).toHaveBeenCalledWith(
            "t:blogPlans.triggerFailed",
        );
    });

    it("操作期间 busyId 指向当前计划", async () => {
        let resolveFn;
        planServiceMock.updatePlanStatus.mockReturnValue(
            new Promise((resolve) => {
                resolveFn = resolve;
            }),
        );
        const { result } = renderHook(() =>
            usePlanActions({ onChanged: vi.fn(), t }),
        );

        let promise;
        act(() => {
            promise = result.current.pause(plan);
        });
        expect(result.current.busyId).toBe(9);

        await act(async () => {
            resolveFn({});
            await promise;
        });
        expect(result.current.busyId).toBeNull();
    });
});
