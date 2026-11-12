import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2, Trash2 } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { pointsCardSlots, pointsCardsPayload } from "../utils/pointsProducts";
import FormField from "@shared/ui/forms/FormField";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { useToast } from "@shared/hooks/useToast";
import { isRequestCancelled } from "@api";
import { adminService } from "../services/adminService";

/**
 * 管理台-微信登录凭据：AppID/AppSecret 维护。
 * AppSecret 只进不出，保存后不再回显；清除后微信登录通道随即关闭。
 */
const AdminWechatCredentialPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const translationRef = useRef(t);
    useEffect(() => {
        translationRef.current = t;
    }, [t]);
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);
    const virtualPaySaveLock = useRef(false);
    const [appId, setAppId] = useState("");
    const [appSecret, setAppSecret] = useState("");
    const [configured, setConfigured] = useState(false);
    const [saving, setSaving] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [formError, setFormError] = useState("");
    const [virtualPay, setVirtualPay] = useState({
        pointsProducts: pointsCardSlots(),
        enabled: false,
        offerId: "",
        appKey: "",
        appKeyConfigured: false,
        plus: { productId: "", priceCents: 0, durationDays: 30 },
        pro: { productId: "", priceCents: 0, durationDays: 30 },
        ultra: { productId: "", priceCents: 0, durationDays: 30 },
    });
    const [virtualPaySaving, setVirtualPaySaving] = useState(false);
    const [virtualPayError, setVirtualPayError] = useState("");

    const load = useCallback(
        async (showLoading = true) => {
            try {
                if (showLoading) setLoading(true);
                const [data, payData] = await Promise.all([
                    adminService.getWechatCredential({ _silent: true }),
                    adminService.getVirtualPaySettings({ _silent: true }),
                ]);
                setAppId(data?.appId || "");
                setConfigured(Boolean(data?.secretConfigured));
                setVirtualPay((current) => ({
                    ...current,
                    ...payData,
                    appKey: "",
                    pointsProducts: pointsCardSlots(payData?.pointsProducts),
                    plus: payData?.plus || current.plus,
                    pro: payData?.pro || current.pro,
                    ultra: payData?.ultra || current.ultra,
                }));
                setDataReady(true);
            } catch (error) {
                if (isRequestCancelled(error)) return;
                toast.error(
                    error?.message ||
                        translationRef.current(
                            "admin.wechatCredential.loadFailed",
                        ),
                );
            } finally {
                setLoading(false);
            }
        },
        [toast],
    );

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async () => {
        const trimmedId = appId.trim();
        const trimmedSecret = appSecret.trim();
        if (!trimmedId || !trimmedSecret) {
            setFormError(t("admin.wechatCredential.formRequired"));
            return;
        }
        try {
            setSaving(true);
            await adminService.saveWechatCredential({
                appId: trimmedId,
                appSecret: trimmedSecret,
            });
            toast.success(t("admin.wechatCredential.saved"));
            setAppSecret("");
            setFormError("");
            await load(false);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ||
                    t("admin.wechatCredential.saveFailed"),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleClear = async () => {
        try {
            setClearing(true);
            await adminService.clearWechatCredential();
            toast.success(t("admin.wechatCredential.cleared"));
            setClearOpen(false);
            setAppSecret("");
            await load(false);
        } catch {
            // HTTP 层已统一提示
        } finally {
            setClearing(false);
        }
    };

    const updateProduct = (tier, field, value) =>
        setVirtualPay((current) => ({
            ...current,
            [tier]: { ...current[tier], [field]: value },
        }));

    const handleVirtualPaySave = async () => {
        if (virtualPaySaveLock.current || !dataReady) return;
        const result = pointsCardsPayload(virtualPay.pointsProducts, [
            virtualPay.plus,
            virtualPay.pro,
            virtualPay.ultra,
        ]);
        if (result.error) {
            setVirtualPayError(t(`admin.wechatCredential.${result.error}`));
            return;
        }
        virtualPaySaveLock.current = true;
        try {
            setVirtualPaySaving(true);
            setVirtualPayError("");
            const payload = {
                ...virtualPay,
                pointsProducts: result.products,
                offerId: virtualPay.offerId.trim(),
                appKey: virtualPay.appKey.trim(),
            };
            await adminService.saveVirtualPaySettings(payload);
            toast.success(t("admin.wechatCredential.virtualPaySaved"));
            await load(false);
        } catch (err) {
            setVirtualPayError(
                err?.response?.data?.message ||
                    t("admin.wechatCredential.virtualPaySaveFailed"),
            );
        } finally {
            virtualPaySaveLock.current = false;
            setVirtualPaySaving(false);
        }
    };

    const updatePointsCard = (index, field, value) =>
        setVirtualPay((current) => ({
            ...current,
            pointsProducts: current.pointsProducts.map((card, i) =>
                i === index ? { ...card, [field]: value } : card,
            ),
        }));

    if (loading) return <LoadingSpinner fullScreen />;
    if (!dataReady)
        return (
            <div className="space-y-4 p-6 text-body text-ink">
                <div role="alert">{t("admin.wechatCredential.loadFailed")}</div>
                <Button onClick={() => load()}>{t("admin.wechatCredential.pointsCardsRetry")}</Button>
            </div>
        );

    return (
        <div className="mx-auto h-full min-h-0 w-full max-w-2xl space-y-6 overflow-y-auto overscroll-y-contain p-4 sm:p-6">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-heading text-ink">
                        {t("admin.wechatCredential.title")}
                    </h2>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium ${
                            configured
                                ? "bg-success-soft text-success-fg"
                                : "bg-surface-muted text-ink-faint"
                        }`}
                    >
                        <KeyRound className="h-3 w-3" aria-hidden="true" />
                        {configured
                            ? t("admin.wechatCredential.configured")
                            : t("admin.wechatCredential.notConfigured")}
                    </span>
                </div>
                <p className="mt-1 text-caption text-ink-muted">
                    {t("admin.wechatCredential.subtitle")}
                </p>
            </div>

            <div className="rounded-panel border border-border bg-surface p-4 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-ink">
                            {t("admin.wechatCredential.virtualPayTitle")}
                        </h3>
                        <p className="mt-1 text-caption text-ink-muted">
                            {t("admin.wechatCredential.virtualPayHint")}
                        </p>
                    </div>
                    <label className="flex items-center gap-2 text-caption font-medium">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border accent-ink"
                            checked={virtualPay.enabled}
                            onChange={(e) =>
                                setVirtualPay((current) => ({
                                    ...current,
                                    enabled: e.target.checked,
                                }))
                            }
                        />
                        {t("admin.wechatCredential.virtualPayEnabled")}
                    </label>
                </div>
                <fieldset
                    disabled={virtualPaySaving}
                    className="min-w-0 space-y-4"
                >
                    <FormField
                        label="OfferID"
                        htmlFor="admin-virtual-pay-offer-id"
                    >
                        <input
                            id="admin-virtual-pay-offer-id"
                            value={virtualPay.offerId}
                            onChange={(e) =>
                                setVirtualPay((current) => ({
                                    ...current,
                                    offerId: e.target.value,
                                }))
                            }
                            className={formInputCls}
                            autoComplete="off"
                        />
                    </FormField>
                    <FormField
                        label="AppKey"
                        hint={
                            virtualPay.appKeyConfigured
                                ? t("admin.wechatCredential.appKeyHint")
                                : undefined
                        }
                        htmlFor="admin-virtual-pay-app-key"
                    >
                        <input
                            id="admin-virtual-pay-app-key"
                            type="password"
                            value={virtualPay.appKey}
                            onChange={(e) =>
                                setVirtualPay((current) => ({
                                    ...current,
                                    appKey: e.target.value,
                                }))
                            }
                            className={formInputCls}
                            autoComplete="new-password"
                        />
                    </FormField>
                    {["plus", "pro", "ultra"].map((tier) => (
                        <div
                            key={tier}
                            className="grid gap-3 rounded-card border border-border bg-canvas p-4 md:grid-cols-3"
                        >
                            <FormField
                                label={t("admin.wechatCredential.productId", {
                                    tier: tier.toUpperCase(),
                                })}
                            >
                                <input
                                    value={virtualPay[tier].productId}
                                    onChange={(e) =>
                                        updateProduct(
                                            tier,
                                            "productId",
                                            e.target.value,
                                        )
                                    }
                                    className={formInputCls}
                                />
                            </FormField>
                            <FormField
                                label={t("admin.wechatCredential.priceCents")}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={virtualPay[tier].priceCents}
                                    onChange={(e) =>
                                        updateProduct(
                                            tier,
                                            "priceCents",
                                            Number(e.target.value),
                                        )
                                    }
                                    className={formInputCls}
                                />
                            </FormField>
                            <FormField
                                label={t("admin.wechatCredential.durationDays")}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={virtualPay[tier].durationDays}
                                    onChange={(e) =>
                                        updateProduct(
                                            tier,
                                            "durationDays",
                                            Number(e.target.value),
                                        )
                                    }
                                    className={formInputCls}
                                />
                            </FormField>
                        </div>
                    ))}
                    <fieldset
                        disabled={virtualPaySaving}
                        className="min-w-0 space-y-4 border-t border-border pt-5"
                    >
                        <legend className="text-title text-ink">
                            {t("admin.wechatCredential.pointsCardsTitle")}
                        </legend>
                        <div className="text-caption text-ink-muted">
                            {t("admin.wechatCredential.pointsCardsHint")}
                        </div>
                        {virtualPay.pointsProducts.map((card, index) => (
                            <div
                                key={index}
                                className="space-y-3 rounded-card border border-border bg-canvas p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-title text-ink">
                                        {t(
                                            "admin.wechatCredential.pointsCardNumber",
                                            { number: index + 1 },
                                        )}
                                    </div>
                                    <label className="flex items-center gap-2 text-caption text-ink">
                                        <input
                                            type="checkbox"
                                            checked={card.enabled}
                                            onChange={(e) =>
                                                updatePointsCard(
                                                    index,
                                                    "enabled",
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 accent-ink"
                                        />
                                        {t(
                                            "admin.wechatCredential.pointsCardEnabled",
                                            { number: index + 1 },
                                        )}
                                    </label>
                                </div>
                                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                                    <FormField
                                        label={t(
                                            "admin.wechatCredential.pointsCardId",
                                        )}
                                        htmlFor={`points-id-${index}`}
                                    >
                                        <input
                                            id={`points-id-${index}`}
                                            value={card.productId}
                                            maxLength={20}
                                            autoComplete="off"
                                            placeholder={`POINTS_${[10, 50, 100][index]}`}
                                            onChange={(e) =>
                                                updatePointsCard(
                                                    index,
                                                    "productId",
                                                    e.target.value,
                                                )
                                            }
                                            className={formInputCls}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t(
                                            "admin.wechatCredential.pointsCardName",
                                        )}
                                        htmlFor={`points-name-${index}`}
                                    >
                                        <input
                                            id={`points-name-${index}`}
                                            value={card.name}
                                            maxLength={20}
                                            onChange={(e) =>
                                                updatePointsCard(
                                                    index,
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            className={formInputCls}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t(
                                            "admin.wechatCredential.pointsCardAmount",
                                        )}
                                        htmlFor={`points-amount-${index}`}
                                    >
                                        <input
                                            id={`points-amount-${index}`}
                                            type="number"
                                            min="10"
                                            max="10000"
                                            step="10"
                                            value={card.points}
                                            onChange={(e) =>
                                                updatePointsCard(
                                                    index,
                                                    "points",
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className={formInputCls}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t(
                                            "admin.wechatCredential.pointsCardPrice",
                                        )}
                                        htmlFor={`points-price-${index}`}
                                    >
                                        <input
                                            id={`points-price-${index}`}
                                            value={
                                                card.points === ""
                                                    ? ""
                                                    : card.points / 10
                                            }
                                            readOnly
                                            className={formInputCls}
                                        />
                                    </FormField>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setVirtualPay((current) => ({
                                            ...current,
                                            pointsProducts:
                                                current.pointsProducts.map(
                                                    (item, i) =>
                                                        i === index
                                                            ? pointsCardSlots()[
                                                                  index
                                                              ]
                                                            : item,
                                                ),
                                        }))
                                    }
                                >
                                    {t(
                                        "admin.wechatCredential.pointsCardClear",
                                    )}
                                </Button>
                            </div>
                        ))}
                    </fieldset>
                    {virtualPayError && (
                        <p className="text-caption font-medium text-danger">
                            {virtualPayError}
                        </p>
                    )}
                    <Button
                        variant="ink"
                        onClick={handleVirtualPaySave}
                        loading={virtualPaySaving}
                    >
                        {t("common.save")}
                    </Button>
                </fieldset>
            </div>

            <div className="rounded-panel border border-border bg-surface p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <FormField
                            label={t("admin.wechatCredential.appId")}
                            htmlFor="admin-wechat-app-id"
                        >
                            <input
                                id="admin-wechat-app-id"
                                value={appId}
                                onChange={(e) => setAppId(e.target.value)}
                                placeholder={t(
                                    "admin.wechatCredential.appIdPlaceholder",
                                )}
                                className={formInputCls}
                                autoComplete="off"
                            />
                        </FormField>

                        <FormField
                            label={t("admin.wechatCredential.appSecret")}
                            hint={
                                configured
                                    ? t("admin.wechatCredential.appSecretHint")
                                    : undefined
                            }
                            htmlFor="admin-wechat-app-secret"
                        >
                            <input
                                id="admin-wechat-app-secret"
                                type="password"
                                value={appSecret}
                                onChange={(e) => setAppSecret(e.target.value)}
                                placeholder={t(
                                    "admin.wechatCredential.appSecretPlaceholder",
                                )}
                                className={formInputCls}
                                autoComplete="new-password"
                            />
                        </FormField>

                        {formError && (
                            <p className="text-caption font-medium text-danger">
                                {formError}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-control bg-ink px-6 py-2.5 text-caption font-bold text-canvas transition hover:bg-ink-secondary active:scale-95 disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                {t("common.save")}
                            </button>
                            {configured && (
                                <button
                                    type="button"
                                    onClick={() => setClearOpen(true)}
                                    disabled={clearing}
                                    className="inline-flex items-center gap-2 rounded-control border border-border px-5 py-2.5 text-caption font-bold text-danger transition hover:bg-danger-soft disabled:opacity-60"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t("admin.wechatCredential.clear")}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={clearOpen}
                title={t("admin.wechatCredential.clearTitle")}
                message={t("admin.wechatCredential.clearMessage")}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                confirming={clearing}
                onConfirm={handleClear}
                onClose={() => setClearOpen(false)}
            />
        </div>
    );
};

export default AdminWechatCredentialPage;
