import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthSession } from "@features/auth";
import Button from "@shared/ui/primitives/Button";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { alipayService } from "../services/alipayService";
import { finishCheckout, savedCheckout } from "../utils/alipayCheckout";

/** Callback parameters are untrusted. Only query an order stored by this user's checkout session. */
export default function AlipayReturnPage() {
    const { t } = useTranslation();
    const { userInfo, sessionStatus, refresh } = useAuthSession();
    const [order, setOrder] = useState(null);
    const [checking, setChecking] = useState(false);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const userId = userInfo?.id;
    const requestVersion = useRef(0);

    useEffect(() => {
        const version = ++requestVersion.current;
        if (sessionStatus !== "authenticated" || !userId) return undefined;
        let tradeNo;
        try {
            tradeNo = savedCheckout(userId);
        } catch {
            return undefined;
        }
        if (!tradeNo) return undefined;
        const controller = new AbortController();
        setChecking(true);
        setFailed(false);
        setOrder(null);
        alipayService
            .reconcile(tradeNo, { signal: controller.signal })
            .then((data) => {
                if (requestVersion.current !== version) return;
                setOrder(data);
                if (["DELIVERED", "CLOSED", "REFUNDED"].includes(data.status))
                    finishCheckout(userId, data.productId);
                if (data.status === "DELIVERED") refresh();
            })
            .catch(() => {
                if (requestVersion.current === version) setFailed(true);
            })
            .finally(() => {
                if (requestVersion.current === version) setChecking(false);
            });
        return () => {
            requestVersion.current += 1;
            controller.abort();
        };
    }, [userId, sessionStatus, refresh, attempt]);

    let message = t("alipay.noOrder");
    if (failed) message = t("alipay.confirmFailed");
    else if (order && sessionStatus === "authenticated")
        message = t(`alipay.status.${order.status}`, {
            defaultValue: t("alipay.pending"),
        });
    if (sessionStatus === "checking" || checking)
        return <LoadingSpinner fullScreen text={t("alipay.confirming")} />;
    return (
        <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
            <section className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-surface p-6 text-ink">
                <h1 className="text-xl font-bold">{t("alipay.resultTitle")}</h1>
                <p role="status" className="leading-relaxed">
                    {message}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    {sessionStatus === "authenticated" ? (
                        <Button
                            onClick={() => setAttempt((value) => value + 1)}
                        >
                            {t("alipay.refresh")}
                        </Button>
                    ) : (
                        <Link className="text-accent underline" to="/login">
                            {t("alipay.signIn")}
                        </Link>
                    )}
                    <Link className="text-accent underline" to="/app">
                        {t("alipay.back")}
                    </Link>
                </div>
            </section>
        </main>
    );
}
