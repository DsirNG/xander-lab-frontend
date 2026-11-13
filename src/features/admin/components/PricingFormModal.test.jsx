import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PricingFormModal from "./PricingFormModal";

const mocks = vi.hoisted(() => ({ save: vi.fn(), success: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock("@shared/hooks/useToast", () => ({ useToast: () => ({ success: mocks.success }) }));
vi.mock("../services/adminService", () => ({ adminService: { upsertModelPrice: mocks.save } }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.save.mockResolvedValue({}); });

it("switches to per-request pricing and saves CNY as milli-points without token rates", async () => {
    render(<PricingFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("admin.pricing.model"), { target: { value: "image" } });
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "admin.pricing.modeRequest" }));
    expect(screen.queryByLabelText("admin.pricing.inputPrice")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("admin.pricing.requestPrice"), { target: { value: "0.25" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith("image", expect.objectContaining({
        billingMode: "REQUEST", milliPerRequest: 2500, inputMilliPer1kToken: 0, outputMilliPer1kToken: 0,
    })));
});

it("restores an existing request rate and rejects a blank rate", () => {
    render(<PricingFormModal isOpen price={{model:"image",billingMode:"REQUEST",milliPerRequest:2500}} onClose={vi.fn()} />);
    const input = screen.getByLabelText("admin.pricing.requestPrice");
    expect(input).toHaveValue(0.25);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));
    expect(mocks.save).not.toHaveBeenCalled();
    expect(screen.getByText("admin.pricing.invalidPrice")).toBeInTheDocument();
});
