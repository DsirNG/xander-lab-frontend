import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlanFormModal from "./PlanFormModal";

const planServiceMock = vi.hoisted(() => ({
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("../../services/blogPlanService", () => ({
    blogPlanService: planServiceMock,
}));
vi.mock("@/hooks/useToast", () => ({ useToast: () => toastMock }));
vi.mock("@/features/knowledge/services/knowledgeService", () => ({
    knowledgeService: { list: vi.fn().mockResolvedValue([]) },
}));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { resolvedLanguage: "zh" },
    }),
}));

beforeEach(() => vi.clearAllMocks());

describe("PlanFormModal business controls", () => {
    it("submits selected schedule, AI direction, date and platforms", async () => {
        planServiceMock.createPlan.mockResolvedValue({ id: 1 });
        render(<PlanFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);

        fireEvent.change(
            screen.getByPlaceholderText("blogPlans.topicPlaceholder"),
            {
                target: { value: "React performance" },
            },
        );
        fireEvent.click(screen.getByText("blogPlans.typeOnce"));
        fireEvent.change(screen.getByLabelText("blogPlans.executionDate"), {
            target: { value: "2026-09-01" },
        });
        fireEvent.click(screen.getByText("blogPlans.aiPractical"));
        fireEvent.click(screen.getByText("blogPlans.syncCsdn"));
        fireEvent.click(screen.getByText("blogPlans.syncJuejin"));
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() =>
            expect(planServiceMock.createPlan).toHaveBeenCalledWith(
                expect.objectContaining({
                    topic: "React performance",
                    scheduleType: "ONCE",
                    scheduledDate: "2026-09-01",
                    aiOption: "PRACTICAL",
                    syncCsdn: true,
                    syncJuejin: true,
                }),
            ),
        );
    });

    it("restores platform selections while editing", () => {
        render(
            <PlanFormModal
                isOpen
                plan={{
                    id: 7,
                    topic: "Existing plan",
                    scheduleType: "WEEKLY",
                    scheduledDate: "2026-09-07",
                    syncCsdn: true,
                    syncJuejin: false,
                    aiOption: "NEWS",
                }}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByLabelText("blogPlans.syncCsdn")).toBeChecked();
        expect(screen.getByLabelText("blogPlans.syncJuejin")).not.toBeChecked();
        expect(
            screen.getByLabelText("blogPlans.firstExecutionDate"),
        ).toHaveValue("2026-09-07");
    });
});
