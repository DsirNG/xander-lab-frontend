import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n, { i18nReady } from "@/locales";
import AlipaySubscriptionPanel from "./AlipaySubscriptionPanel";
import AlipayReturnPage from "../pages/AlipayReturnPage";
import { MemoryRouter } from "react-router-dom";
import { alipayService } from "../services/alipayService";
import { submitAlipayForm } from "../utils/alipayCheckout";

const session = vi.hoisted(() => ({
    userInfo: { id: 42 },
    sessionStatus: "authenticated",
    refresh: vi.fn(),
}));
vi.mock("@features/auth", () => ({ useAuthSession: () => session }));
vi.mock("@shared/hooks/useToast", () => ({
    useToast: () => ({ error: vi.fn(), info: vi.fn() }),
}));
vi.mock("../services/alipayService", () => ({
    alipayService: { products: vi.fn(), create: vi.fn(), reconcile: vi.fn() },
}));

const tradeNo = "A" + "1".repeat(32);
beforeEach(async () => {
    vi.clearAllMocks();
    sessionStorage.clear();
    session.userInfo = { id: 42 };
    session.sessionStatus = "authenticated";
    await i18nReady;
    await i18n.changeLanguage("zh");
    alipayService.products.mockResolvedValue({
        enabled: true,
        environment: "sandbox",
        products: [
            {
                productId: "pro-month",
                tier: "PRO",
                priceCents: 2400,
                durationDays: 30,
            },
        ],
    });
});

it("prevents duplicate checkouts and reuses the same key after an uncertain response", async () => {
    let reject;
    alipayService.create.mockImplementationOnce(
        () =>
            new Promise((_, fail) => {
                reject = fail;
            }),
    );
    render(<AlipaySubscriptionPanel />);
    const button = await screen.findByRole("button", {
        name: "使用支付宝购买",
    });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(alipayService.create).toHaveBeenCalledTimes(1);
    const key = alipayService.create.mock.calls[0][1];
    await act(async () => reject(new Error("network")));
    alipayService.create.mockRejectedValueOnce(new Error("network"));
    fireEvent.click(button);
    expect(alipayService.create.mock.calls[1][1]).toBe(key);
    await waitFor(() => expect(button).not.toBeDisabled());
});

it("shows disabled catalogs and releases initial loading on failure", async () => {
    alipayService.products.mockRejectedValueOnce(new Error("offline"));
    render(<AlipaySubscriptionPanel />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
        "订阅套餐加载失败",
    );
    alipayService.products.mockResolvedValueOnce({
        enabled: false,
        products: [],
    });
    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    expect(
        await screen.findByText("支付宝支付暂未开放，请稍后再试。"),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: "使用支付宝购买" }),
    ).not.toBeInTheDocument();
});

it("ignores forged callback order numbers without a local checkout", async () => {
    render(
        <MemoryRouter
            initialEntries={[
                `/payment/alipay/return?out_trade_no=${tradeNo}&trade_status=TRADE_SUCCESS`,
            ]}
        >
            <AlipayReturnPage />
        </MemoryRouter>,
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
        "暂无可确认的订单",
    );
    expect(alipayService.reconcile).not.toHaveBeenCalled();
});

it("queries only this account's saved order and trusts the server result", async () => {
    sessionStorage.setItem("alipay:pending:42", tradeNo);
    alipayService.reconcile.mockResolvedValue({
        outTradeNo: tradeNo,
        productId: "pro-month",
        status: "PENDING",
    });
    render(
        <MemoryRouter
            initialEntries={[
                "/payment/alipay/return?out_trade_no=forged&trade_status=TRADE_SUCCESS",
            ]}
        >
            <AlipayReturnPage />
        </MemoryRouter>,
    );
    expect(await screen.findByRole("status")).toHaveTextContent("尚未确认付款");
    expect(alipayService.reconcile.mock.calls[0][0]).toBe(tradeNo);
    expect(session.refresh).not.toHaveBeenCalled();
});

it("refreshes account benefits only after a delivered server result", async () => {
    sessionStorage.setItem("alipay:pending:42", tradeNo);
    alipayService.reconcile.mockResolvedValue({
        outTradeNo: tradeNo,
        productId: "pro-month",
        status: "DELIVERED",
    });
    render(
        <MemoryRouter>
            <AlipayReturnPage />
        </MemoryRouter>,
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
        "订阅权益已开通",
    );
    expect(session.refresh).toHaveBeenCalledTimes(1);
});

it("rejects foreign form actions and submits safe fields without executing scripts", () => {
    expect(() =>
        submitAlipayForm(
            '<form method="POST" action="https://attacker.test/gateway.do"></form>',
            "sandbox",
        ),
    ).toThrow();
    const submit = vi
        .spyOn(HTMLFormElement.prototype, "submit")
        .mockImplementation(function () {
            expect(this.action).toContain(
                "https://openapi-sandbox.dl.alipaydev.com/gateway.do",
            );
            expect(this.querySelector('[name="biz_content"]').value).toBe(
                "signed-data",
            );
            expect(this.querySelector("script")).toBeNull();
        });
    try {
        submitAlipayForm(
            '<form method="POST" action="https://openapi-sandbox.dl.alipaydev.com/gateway.do"><input type="hidden" name="biz_content" value="signed-data"></form><script>throw Error("unsafe")</script>',
            "sandbox",
        );
        expect(submit).toHaveBeenCalledTimes(1);
    } finally {
        submit.mockRestore();
    }
});
