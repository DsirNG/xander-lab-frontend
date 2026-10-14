import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import PlanAiGenerateModal from "./PlanAiGenerateModal";

const service = vi.hoisted(() => ({
    createSeriesDraft: vi.fn(),
    updateSeriesDraft: vi.fn(),
    activateSeries: vi.fn(),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("../../services/blogPlanService", () => ({ blogPlanService: service }));
vi.mock("@shared/hooks/useToast", () => ({ useToast: () => toast }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, args) => (args?.day ? `${key} ${args.day}` : key),
    }),
}));
beforeEach(() => vi.clearAllMocks());

it("previews all 30 topics and activates only after confirming edited topics", async () => {
    const topics = Array.from({ length: 30 }, (_, i) => `Frontend ${i + 1}`);
    const draft = {
        id: 9,
        title: "Frontend series",
        topic: "Frontend",
        topics,
        startDate: "2099-01-01",
        triggerTime: "09:00",
        timezone: "Asia/Shanghai",
        platforms: ["local"],
        publishMode: "REVIEW",
    };
    service.createSeriesDraft.mockResolvedValue(draft);
    service.updateSeriesDraft.mockResolvedValue(draft);
    service.activateSeries.mockResolvedValue({ items: [{ id: 1 }] });
    const onSaved = vi.fn();
    render(<PlanAiGenerateModal isOpen onClose={vi.fn()} onSaved={onSaved} />);
    fireEvent.change(
        screen.getByPlaceholderText("blogPlans.aiSeedPlaceholder"),
        { target: { value: "Frontend" } },
    );
    fireEvent.change(screen.getByRole("spinbutton"), {
        target: { value: "30" },
    });
    fireEvent.click(
        screen.getByRole("button", { name: "blogPlans.aiGenerate" }),
    );
    await screen.findByDisplayValue("Frontend 30");
    expect(service.createSeriesDraft).toHaveBeenCalledOnce();
    expect(service.activateSeries).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    fireEvent.change(screen.getByDisplayValue("Frontend 1"), {
        target: { value: "Edited topic" },
    });
    fireEvent.click(
        screen.getByRole("button", { name: "blogPlans.confirmDailyPlans" }),
    );
    await waitFor(() =>
        expect(service.updateSeriesDraft).toHaveBeenCalledWith(
            9,
            expect.objectContaining({
                days: 30,
                topics: ["Edited topic", ...topics.slice(1)],
            }),
        ),
    );
    expect(service.activateSeries).toHaveBeenCalledWith(9);
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
});

it("rejects an incomplete topic series without activating it", async () => {
    service.createSeriesDraft.mockResolvedValue({
        topics: ["Only one"],
    });
    render(<PlanAiGenerateModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(
        screen.getByPlaceholderText("blogPlans.aiSeedPlaceholder"),
        { target: { value: "Frontend" } },
    );
    fireEvent.click(
        screen.getByRole("button", { name: "blogPlans.aiGenerate" }),
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(service.activateSeries).not.toHaveBeenCalled();
    expect(
        screen.queryByRole("button", { name: "blogPlans.confirmDailyPlans" }),
    ).toBeNull();
});
