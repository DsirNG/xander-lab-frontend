import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import AdminWechatCredentialPage from "./AdminWechatCredentialPage";
import { adminService } from "../services/adminService";
const { toast, t } = vi.hoisted(() => ({
    toast: { success: vi.fn(), error: vi.fn() },
    t: (key, options) => (options?.number ? `${key} ${options.number}` : key),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t }) }));
vi.mock("@shared/hooks/useToast", () => ({ useToast: () => toast }));
vi.mock("@api", () => ({ isRequestCancelled: () => false }));
vi.mock("../services/adminService", () => ({
    adminService: {
        getWechatCredential: vi.fn(),
        getVirtualPaySettings: vi.fn(),
        saveVirtualPaySettings: vi.fn(),
    },
}));
const card = {
    productId: "POINTS_50",
    name: "50 points",
    priceCents: 500,
    points: 50,
    enabled: true,
};
const settings = {
    enabled: true,
    offerId: "offer",
    appKeyConfigured: true,
    pointsProducts: [],
    plus: { productId: "PLUS", priceCents: 200, durationDays: 30 },
    pro: { productId: "PRO", priceCents: 400, durationDays: 30 },
    ultra: { productId: "ULTRA", priceCents: 1000, durationDays: 30 },
};
const save = () => screen.getAllByRole("button", { name: "common.save" })[0];
const ready = () =>
    screen.findByLabelText("admin.wechatCredential.pointsCardEnabled 1");
const inputs = (key) =>
    screen.getAllByLabelText(`admin.wechatCredential.${key}`);
beforeEach(() => {
    vi.clearAllMocks();
    adminService.getWechatCredential.mockResolvedValue({});
    adminService.getVirtualPaySettings.mockResolvedValue(settings);
    adminService.saveVirtualPaySettings.mockResolvedValue({});
});
it("configures three cards, calculates cents and prevents duplicate saves while pending", async () => {
    let resolve;
    adminService.saveVirtualPaySettings.mockImplementation(
        () =>
            new Promise((done) => {
                resolve = done;
            }),
    );
    render(<AdminWechatCredentialPage />);
    await ready();
    for (const [i, n] of [10, 50, 100].entries()) {
        fireEvent.change(inputs("pointsCardId")[i], {
            target: { value: `POINTS_${n}` },
        });
        fireEvent.change(inputs("pointsCardName")[i], {
            target: { value: `${n} points` },
        });
        fireEvent.change(inputs("pointsCardAmount")[i], {
            target: { value: String(n) },
        });
        fireEvent.click(
            screen.getByLabelText(
                `admin.wechatCredential.pointsCardEnabled ${i + 1}`,
            ),
        );
        expect(inputs("pointsCardPrice")[i]).toHaveValue(String(n / 10));
    }
    fireEvent.click(save());
    fireEvent.click(save());
    expect(adminService.saveVirtualPaySettings).toHaveBeenCalledTimes(1);
    const payload = adminService.saveVirtualPaySettings.mock.calls[0][0];
    expect(
        payload.pointsProducts.map((p) => [
            p.productId,
            p.priceCents,
            p.points,
            p.enabled,
        ]),
    ).toEqual([
        ["POINTS_10", 100, 10, true],
        ["POINTS_50", 500, 50, true],
        ["POINTS_100", 1000, 100, true],
    ]);
    expect(payload.appKey).toBe("");
    await act(async () => resolve({}));
    await waitFor(() => expect(save()).toBeEnabled());
});
it("rejects incomplete, invalid quantities and duplicate IDs before sending", async () => {
    render(<AdminWechatCredentialPage />);
    await ready();
    fireEvent.click(
        screen.getByLabelText("admin.wechatCredential.pointsCardEnabled 1"),
    );
    fireEvent.click(save());
    expect(
        screen.getByText("admin.wechatCredential.pointsCardsInvalid"),
    ).toBeInTheDocument();
    fireEvent.change(inputs("pointsCardId")[0], { target: { value: "PLUS" } });
    fireEvent.change(inputs("pointsCardName")[0], {
        target: { value: "card" },
    });
    fireEvent.click(save());
    expect(
        screen.getByText("admin.wechatCredential.pointsCardsDuplicate"),
    ).toBeInTheDocument();
    fireEvent.change(inputs("pointsCardId")[0], {
        target: { value: "POINTS_10" },
    });
    fireEvent.change(inputs("pointsCardAmount")[0], {
        target: { value: "11" },
    });
    fireEvent.click(save());
    expect(
        screen.getByText("admin.wechatCredential.pointsCardsInvalid"),
    ).toBeInTheDocument();
    expect(adminService.saveVirtualPaySettings).not.toHaveBeenCalled();
});
it("preserves failed edits and sends disabled cards or explicit empty arrays", async () => {
    adminService.getVirtualPaySettings.mockResolvedValue({
        ...settings,
        pointsProducts: [card],
    });
    adminService.saveVirtualPaySettings.mockRejectedValueOnce({
        response: { data: { message: "save failed" } },
    });
    render(<AdminWechatCredentialPage />);
    await ready();
    expect(inputs("pointsCardId")[0]).toHaveValue("POINTS_50");
    fireEvent.click(
        screen.getByLabelText("admin.wechatCredential.pointsCardEnabled 1"),
    );
    fireEvent.click(save());
    await screen.findByText("save failed");
    expect(inputs("pointsCardId")[0]).toHaveValue("POINTS_50");
    expect(
        adminService.saveVirtualPaySettings.mock.calls[0][0].pointsProducts,
    ).toEqual([{ ...card, enabled: false }]);
    fireEvent.click(
        screen.getAllByRole("button", {
            name: "admin.wechatCredential.pointsCardClear",
        })[0],
    );
    fireEvent.click(save());
    await waitFor(() =>
        expect(adminService.saveVirtualPaySettings).toHaveBeenCalledTimes(2),
    );
    expect(
        adminService.saveVirtualPaySettings.mock.calls[1][0].pointsProducts,
    ).toEqual([]);
});
it("blocks empty-form saves when loading fails and allows retry", async () => {
    adminService.getVirtualPaySettings.mockRejectedValue(new Error("offline"));
    render(<AdminWechatCredentialPage />);
    await screen.findByRole("alert");
    expect(
        screen.queryByRole("button", { name: "common.save" }),
    ).not.toBeInTheDocument();
    adminService.getVirtualPaySettings.mockResolvedValue(settings);
    fireEvent.click(screen.getByRole("button", { name: "admin.wechatCredential.pointsCardsRetry" }));
    await ready();
    expect(save()).toBeEnabled();
});
