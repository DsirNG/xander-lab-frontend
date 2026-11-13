import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AdminModelPricingPage from "./AdminModelPricingPage";

const mocks = vi.hoisted(() => ({ list: vi.fn(), toast: { error: vi.fn() }, t: (key) => key }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: mocks.t }) }));
vi.mock("@api", () => ({ isRequestCancelled: () => false }));
vi.mock("@shared/hooks/useToast", () => ({ useToast: () => mocks.toast }));
vi.mock("../services/adminService", () => ({ adminService: { listModelPrices: mocks.list } }));
afterEach(cleanup);

it("keeps request and token rates in their own columns and explains the token unit", async () => {
    mocks.list.mockResolvedValue([
        { model: "text-model", billingMode: "TOKEN", inputMilliPer1kToken: 133, outputMilliPer1kToken: 800, enabled: true },
        { model: "image-model", billingMode: "REQUEST", milliPerRequest: 5000, inputMilliPer1kToken: 999, enabled: true },
    ]);
    render(<AdminModelPricingPage />);
    const textRow = (await screen.findByText("text-model")).closest("tr");
    const imageRow = screen.getByText("image-model").closest("tr");
    expect(within(textRow).getAllByRole("cell")[2]).toHaveTextContent("—");
    expect(within(textRow).getAllByRole("cell")[3]).toHaveTextContent("¥13.3");
    expect(within(imageRow).getAllByRole("cell")[2]).toHaveTextContent("¥0.5");
    expect(within(imageRow).getAllByRole("cell")[3]).toHaveTextContent("—");
    expect(screen.getByText("admin.pricing.priceUnit")).toBeInTheDocument();
});

it("paginates the full supplier model catalog", async () => {
    mocks.list.mockResolvedValue(Array.from({ length: 28 }, (_, i) => ({ model: `model-${i}`, billingMode: "TOKEN", enabled: true })));
    render(<AdminModelPricingPage />);
    await screen.findByText("model-0");
    expect(screen.queryByText("model-20")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2", exact: true }));
    expect(screen.getByText("model-20")).toBeInTheDocument();
    expect(screen.getByText("model-27")).toBeInTheDocument();
    expect(screen.queryByText("model-0")).not.toBeInTheDocument();
});
