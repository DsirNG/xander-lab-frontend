import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import Modal from "@shared/ui/overlays/Modal";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { useToast } from "@shared/hooks/useToast";
import { adminService } from "../services/adminService";
import {
    milliPer1kToYuanPerM,
    yuanToMilliPerRequest,
    milliPerRequestToYuan,
    yuanPerMToMilliPer1k,
} from "../utils/pricingUnits";

const toYuanPerM = (milli) => {
    if (milli === null || milli === undefined) return "";
    return String(milliPer1kToYuanPerM(milli));
};

/**
 * 模型定价新建/编辑弹窗。
 * 编辑时模型名不可改：定价按 model 幂等 upsert，改名等价于新增另一条。
 */
const PricingFormModal = ({ isOpen, price, onClose, onSaved }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [billingMode, setBillingMode] = useState("TOKEN");
    const [requestPrice, setRequestPrice] = useState("");
    const [model, setModel] = useState("");
    const [inputPrice, setInputPrice] = useState("");
    const [outputPrice, setOutputPrice] = useState("");
    const [cachedReadPrice, setCachedReadPrice] = useState("0");
    const [cachedWritePrice, setCachedWritePrice] = useState("0");
    const [enabled, setEnabled] = useState(true);
    const [remark, setRemark] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const savingRef = useRef(false);
    const close = () => {
        if (!savingRef.current) onClose();
    };

    const editing = Boolean(price);

    useEffect(() => {
        if (!isOpen) return;
        setBillingMode(price?.billingMode ?? "TOKEN");
        setRequestPrice(price ? String(milliPerRequestToYuan(price.milliPerRequest ?? 0)) : "");
        if (price) {
            setModel(price.model || "");
            setInputPrice(toYuanPerM(price.inputMilliPer1kToken));
            setOutputPrice(toYuanPerM(price.outputMilliPer1kToken));
            setCachedReadPrice(toYuanPerM(price.cachedMilliPer1kToken) || "0");
            setCachedWritePrice(
                toYuanPerM(price.cachedWriteMilliPer1kToken) || "0",
            );
            setEnabled(price.enabled !== false);
            setRemark(price.remark || "");
        } else {
            setModel("");
            setInputPrice("");
            setOutputPrice("");
            setCachedReadPrice("0");
            setCachedWritePrice("0");
            setEnabled(true);
            setRemark("");
        }
        setFormError("");
    }, [isOpen, price]);

    /** 单价输入校验并换算为毫分/1K；非法时返回 null。 */
    const parsePrice = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) return null;
        return yuanPerMToMilliPer1k(num);
    };

    const handleSubmit = async () => {
        if (savingRef.current) return;
        const trimmedModel = model.trim();
        const perRequest = billingMode === "REQUEST";
        const requestMilli = requestPrice.trim() === "" ? null : yuanToMilliPerRequest(requestPrice);
        const inputMilli = perRequest ? 0 : parsePrice(inputPrice);
        const outputMilli = perRequest ? 0 : parsePrice(outputPrice);
        const cachedReadMilli = perRequest ? 0 : parsePrice(cachedReadPrice);
        const cachedWriteMilli = perRequest ? 0 : parsePrice(cachedWritePrice);
        if (!trimmedModel || inputMilli === null || outputMilli === null) {
            setFormError(t("admin.pricing.formRequired"));
            return;
        }
        if (
            ![inputMilli, outputMilli, cachedReadMilli, cachedWriteMilli].every((value) => Number.isSafeInteger(value) && value >= 0) ||
            (perRequest && (!Number.isSafeInteger(requestMilli) || requestMilli < 0))
        ) {
            setFormError(t("admin.pricing.invalidPrice"));
            return;
        }
        try {
            savingRef.current = true;
            setSaving(true);
            await adminService.upsertModelPrice(trimmedModel, {
                billingMode,
                milliPerRequest: perRequest ? requestMilli : 0,
                inputMilliPer1kToken: inputMilli,
                outputMilliPer1kToken: outputMilli,
                cachedMilliPer1kToken: cachedReadMilli,
                cachedWriteMilliPer1kToken: cachedWriteMilli,
                enabled,
                remark: remark.trim() || null,
            });
            toast.success(
                editing
                    ? t("admin.pricing.updated")
                    : t("admin.pricing.created"),
            );
            onClose();
            onSaved?.();
        } catch (err) {
            setFormError(
                err?.response?.data?.message || t("admin.pricing.saveFailed"),
            );
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    const footer = (
        <>
            <Button variant="ghost" onClick={close} disabled={saving}>
                {t("common.cancel")}
            </Button>
            <Button
                variant="ink"
                onClick={handleSubmit}
                loading={saving}
                debounceMs={300}
            >
                {t("common.save")}
            </Button>
        </>
    );

    const priceField = (id, label, value, setter) => (
        <FormField label={label} htmlFor={id}>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-caption font-medium text-ink-faint">
                    ¥
                </span>
                <input
                    id={id}
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="0.00"
                    className={`${formInputCls} pl-7`}
                />
            </div>
        </FormField>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            title={
                editing
                    ? t("admin.pricing.editTitle")
                    : t("admin.pricing.createTitle")
            }
            width="max-w-xl"
            className="rounded-dialog shadow-float!"
            footer={footer}
        >
            <div className="space-y-4">
                <FormField
                    label={t("admin.pricing.model")}
                    hint={editing ? t("admin.pricing.modelHint") : undefined}
                    htmlFor="admin-pricing-model"
                >
                    <input
                        id="admin-pricing-model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        disabled={editing}
                        placeholder={t("admin.pricing.modelPlaceholder")}
                        className={`${formInputCls} disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-faint`}
                    />
                </FormField>

                <FormField label={t("admin.pricing.billingMode")}>
                    <CustomSelect value={billingMode} onChange={setBillingMode} options={[
                        { value: "TOKEN", label: t("admin.pricing.modeToken") },
                        { value: "REQUEST", label: t("admin.pricing.modeRequest") },
                    ]} />
                </FormField>
                {billingMode === "REQUEST" ? (
                    <>
                        <div className="text-micro text-ink-faint">{t("admin.pricing.requestHint")}</div>
                        {priceField("admin-pricing-request", t("admin.pricing.requestPrice"), requestPrice, setRequestPrice)}
                    </>
                ) : (<>
                <p className="text-micro font-medium text-ink-faint">
                    {t("admin.pricing.priceUnit")}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {priceField(
                        "admin-pricing-input",
                        t("admin.pricing.inputPrice"),
                        inputPrice,
                        setInputPrice,
                    )}
                    {priceField(
                        "admin-pricing-output",
                        t("admin.pricing.outputPrice"),
                        outputPrice,
                        setOutputPrice,
                    )}
                    {priceField(
                        "admin-pricing-cached-read",
                        t("admin.pricing.cachedReadPrice"),
                        cachedReadPrice,
                        setCachedReadPrice,
                    )}
                    {priceField(
                        "admin-pricing-cached-write",
                        t("admin.pricing.cachedWritePrice"),
                        cachedWritePrice,
                        setCachedWritePrice,
                    )}
                </div>

                </>)}

                <FormField
                    label={t("admin.pricing.remark")}
                    htmlFor="admin-pricing-remark"
                >
                    <textarea
                        id="admin-pricing-remark"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={2}
                        placeholder={t("admin.pricing.remarkPlaceholder")}
                        className={`${formInputCls} resize-none`}
                    />
                </FormField>

                <label className="flex cursor-pointer items-center gap-2 text-caption font-medium text-ink-muted">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-ink"
                    />
                    {t("admin.pricing.enabled")}
                </label>

                {formError && (
                    <p className="text-caption font-medium text-danger">
                        {formError}
                    </p>
                )}
            </div>
        </Modal>
    );
};

export default PricingFormModal;
