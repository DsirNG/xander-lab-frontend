import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2, Trash2 } from "lucide-react";
import FormField from "@components/common/FormField";
import ConfirmModal from "@components/common/ConfirmModal";
import { formInputCls } from "@components/common/formStyles";
import { useToast } from "@/hooks/useToast";
import { adminService } from "../services/adminService";

/**
 * 管理台-微信登录凭据：AppID/AppSecret 维护。
 * AppSecret 只进不出，保存后不再回显；清除后微信登录通道随即关闭。
 */
const AdminWechatCredentialPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [appId, setAppId] = useState("");
    const [appSecret, setAppSecret] = useState("");
    const [configured, setConfigured] = useState(false);
    const [saving, setSaving] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [formError, setFormError] = useState("");
    const [virtualPay, setVirtualPay] = useState({
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

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [data, payData] = await Promise.all([
                adminService.getWechatCredential(),
                adminService.getVirtualPaySettings(),
            ]);
            setAppId(data?.appId || "");
            setConfigured(Boolean(data?.secretConfigured));
            setVirtualPay((current) => ({
                ...current,
                ...payData,
                appKey: "",
                plus: payData?.plus || current.plus,
                pro: payData?.pro || current.pro,
                ultra: payData?.ultra || current.ultra,
            }));
        } catch {
            toast.error(t("admin.wechatCredential.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

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
            await load();
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
            await load();
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
        try {
            setVirtualPaySaving(true);
            setVirtualPayError("");
            const payload = {
                ...virtualPay,
                offerId: virtualPay.offerId.trim(),
                appKey: virtualPay.appKey.trim(),
            };
            await adminService.saveVirtualPaySettings(payload);
            toast.success(t("admin.wechatCredential.virtualPaySaved"));
            await load();
        } catch (err) {
            setVirtualPayError(
                err?.response?.data?.message ||
                    t("admin.wechatCredential.virtualPaySaveFailed"),
            );
        } finally {
            setVirtualPaySaving(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ink">
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
                <p className="mt-1 text-xs text-ink-muted">
                    {t("admin.wechatCredential.subtitle")}
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-canvas p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-ink">
                            {t("admin.wechatCredential.virtualPayTitle")}
                        </h3>
                        <p className="mt-1 text-xs text-ink-muted">
                            {t("admin.wechatCredential.virtualPayHint")}
                        </p>
                    </div>
                    <label className="flex items-center gap-2 text-caption font-medium">
                        <input
                            type="checkbox"
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
                <div className="space-y-4">
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
                            className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-3"
                        >
                            <FormField
                                label={`${tier.toUpperCase()} Product ID`}
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
                    {virtualPayError && (
                        <p className="text-xs font-medium text-danger">
                            {virtualPayError}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleVirtualPaySave}
                        disabled={virtualPaySaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-caption font-bold text-white disabled:opacity-60"
                    >
                        {virtualPaySaving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {t("common.save")}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-canvas p-6">
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
                            <p className="text-xs font-medium text-danger">
                                {formError}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-caption font-bold text-white transition hover:bg-accent active:scale-95 disabled:opacity-60"
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
                                    className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-caption font-bold text-danger transition hover:bg-danger-soft disabled:opacity-60"
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
