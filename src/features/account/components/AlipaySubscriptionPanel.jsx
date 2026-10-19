import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthSession } from "@features/auth";
import Button from "@shared/ui/primitives/Button";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { useToast } from "@shared/hooks/useToast";
import { alipayService } from "../services/alipayService";
import {
    checkoutKey,
    finishCheckout,
    saveCheckout,
    submitAlipayForm,
} from "../utils/alipayCheckout";

export default function AlipaySubscriptionPanel() {
    const { t, i18n } = useTranslation();
    const { userInfo } = useAuthSession();
    const toast = useToast();
    const [catalog, setCatalog] = useState(null);
    const [failed, setFailed] = useState(false);
    const [buying, setBuying] = useState(null);
    const [reload, setReload] = useState(0);
    const lock = useRef(false);
    const generation = useRef(0);
    const userId = userInfo?.id;

    useEffect(() => {
        generation.current += 1;
        const controller = new AbortController();
        let active = true;
        alipayService
            .products({ signal: controller.signal })
            .then((data) => {
                if (active) {
                    setCatalog(data);
                    setFailed(false);
                }
            })
            .catch(() => {
                if (active) setFailed(true);
            });
        return () => {
            active = false;
            generation.current += 1;
            controller.abort();
        };
    }, [userId, reload]);

    const buy = async (productId) => {
        if (lock.current || !userId) return;
        lock.current = true;
        const current = generation.current;
        setBuying(productId);
        try {
            const order = await alipayService.create(
                productId,
                checkoutKey(userId, productId),
            );
            if (current !== generation.current) return;
            saveCheckout(userId, order);
            if (!order.paymentHtml) {
                finishCheckout(userId, productId);
                toast.info(t("alipay.existingOrder"));
                return;
            }
            submitAlipayForm(order.paymentHtml, order.environment);
        } catch {
            toast.error(t("alipay.checkoutFailed"));
        } finally {
            lock.current = false;
            setBuying(null);
        }
    };

    if (!catalog && !failed)
        return <LoadingSpinner fullScreen text={t("alipay.loading")} />;
    if (failed)
        return (
            <div role="alert" className="space-y-3">
                <p>{t("alipay.loadFailed")}</p>
                <Button
                    onClick={() => {
                        setFailed(false);
                        setReload((value) => value + 1);
                    }}
                >
                    {t("alipay.retry")}
                </Button>
            </div>
        );
    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-body font-bold text-ink">
                    {t("alipay.title")}
                </h2>
                <p className="mt-1 text-caption text-ink-muted">
                    {t("alipay.description")}
                </p>
            </div>
            {catalog.environment === "sandbox" ? (
                <p
                    role="status"
                    className="rounded-xl bg-accent-soft p-3 text-caption text-ink"
                >
                    {t("alipay.sandbox")}
                </p>
            ) : null}
            {!catalog.enabled ? (
                <p className="text-caption text-ink-muted">
                    {t("alipay.unavailable")}
                </p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {catalog.products.map((product) => (
                        <article
                            key={product.productId}
                            className="min-w-0 space-y-3 rounded-xl border border-border bg-canvas p-4"
                        >
                            <h3 className="font-semibold text-ink">
                                {product.tier}
                            </h3>
                            <p className="text-2xl font-bold text-ink">
                                {new Intl.NumberFormat(i18n.language, {
                                    style: "currency",
                                    currency: "CNY",
                                }).format(product.priceCents / 100)}
                            </p>
                            <p className="text-caption text-ink-muted">
                                {t("alipay.duration", {
                                    days: product.durationDays,
                                })}
                            </p>
                            <Button
                                block
                                loading={buying === product.productId}
                                disabled={Boolean(buying) || !userId}
                                onClick={() => buy(product.productId)}
                            >
                                {t("alipay.buy")}
                            </Button>
                        </article>
                    ))}
                </div>
            )}
            <a
                href="/payment/alipay/return"
                className="inline-block text-caption text-accent underline"
            >
                {t("alipay.checkResult")}
            </a>
        </section>
    );
}
