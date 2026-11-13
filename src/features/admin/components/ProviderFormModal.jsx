import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import ProviderModelsEditor from "./ProviderModelsEditor";
import ProviderPresetPicker from "./ProviderPresetPicker";
import ModelProbeButton from "./ModelProbeButton";
import Modal from "@shared/ui/overlays/Modal";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { useToast } from "@shared/hooks/useToast";
import { adminService } from "../services/adminService";

/**
 * 模型供应商新建/编辑弹窗。
 * apiKey 只进不出：编辑时留空表示保持原密钥不变。
 */
const ProviderFormModal = ({
    isOpen,
    provider,
    providers,
    onClose,
    onSaved,
}) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [name, setName] = useState("");
    const [vendor, setVendor] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [description, setDescription] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [priority, setPriority] = useState("0");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [models, setModels] = useState([]);
    const [choosing, setChoosing] = useState(false);
    const savingRef = useRef(false);
    const close = () => {
        if (!savingRef.current) onClose();
    };
    const editing = Boolean(provider);

    useEffect(() => {
        if (!isOpen) return;
        setChoosing(!provider);
        setModels(provider?.models ?? []);
        if (provider) {
            setName(provider.name || "");
            setVendor(provider.vendor || "OPENAI_COMPATIBLE");
            setBaseUrl(provider.baseUrl || "");
            setApiKey("");
            setDescription(provider.description || "");
            setEnabled(provider.enabled !== false);
            setPriority(String(provider.priority ?? 0));
        } else {
            setName("");
            setVendor("OPENAI_COMPATIBLE");
            setBaseUrl("");
            setApiKey("");
            setDescription("");
            setEnabled(true);
            setPriority("0");
        }
        setFormError("");
    }, [isOpen, provider]);

    const handleSubmit = async () => {
        if (savingRef.current) return;
        const trimmedName = name.trim();
        const trimmedBaseUrl = baseUrl.trim();
        const trimmedKey = apiKey.trim();
        if (!trimmedName || !trimmedBaseUrl) {
            setFormError(t("admin.providers.formRequired"));
            return;
        }
        if (!editing && !trimmedKey) {
            setFormError(t("admin.providers.formKeyRequired"));
            return;
        }
        const nameTaken = providers?.some(
            (p) =>
                p.name?.toLowerCase() === trimmedName.toLowerCase() &&
                p.id !== provider?.id,
        );
        if (nameTaken) {
            setFormError(t("admin.providers.nameTaken"));
            return;
        }
        const payload = {
            models,
            name: trimmedName,
            vendor: vendor.trim() || "OPENAI_COMPATIBLE",
            baseUrl: trimmedBaseUrl.replace(/\/+$/, ""),
            apiKey: editing && !trimmedKey ? null : trimmedKey,
            description: description.trim() || null,
            enabled,
            priority: Number(priority) || 0,
        };
        try {
            savingRef.current = true;
            setSaving(true);
            if (editing) {
                await adminService.updateProvider(provider.id, payload);
                toast.success(t("admin.providers.updated"));
            } else {
                await adminService.createProvider(payload);
                toast.success(t("admin.providers.created"));
            }
            onClose();
            onSaved?.();
        } catch (err) {
            setFormError(
                err?.response?.data?.message || t("admin.providers.saveFailed"),
            );
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    const footer = choosing ? (
        <Button variant="ghost" onClick={close}>
            {t("common.cancel")}
        </Button>
    ) : (
        <>
            <Button variant="ghost" onClick={close} disabled={saving}>
                {t("common.cancel")}
            </Button>
            <Button variant="ink" onClick={handleSubmit} loading={saving}>
                {editing ? t("common.save") : t("admin.providers.create")}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            title={
                editing
                    ? t("admin.providers.editTitle")
                    : t("admin.providers.createTitle")
            }
            width="max-w-4xl"
            height={760}
            className="rounded-dialog shadow-float!"
            footer={footer}
        >
            {choosing ? (
                <ProviderPresetPicker
                    onSelect={(preset) => {
                        setName(preset.name);
                        setBaseUrl(preset.baseUrl);
                        setVendor("OPENAI_COMPATIBLE");
                        setApiKey("");
                        setModels([]);
                        setChoosing(false);
                    }}
                />
            ) : (
                <fieldset disabled={saving} className="min-w-0 space-y-4">
                    {!editing && (
                        <div className="flex items-center justify-between rounded-card bg-surface-muted p-4">
                            <div className="text-body font-semibold">
                                {name || t("admin.providers.custom")}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setChoosing(true)}
                            >
                                {t("admin.providers.changePreset")}
                            </Button>
                        </div>
                    )}
                    <div className="text-caption text-ink-muted">
                        {t("admin.providers.setupHint")}
                    </div>
                    <FormField
                        label={t("admin.providers.name")}
                        htmlFor="admin-provider-name"
                    >
                        <input
                            id="admin-provider-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("admin.providers.namePlaceholder")}
                            className={formInputCls}
                        />
                    </FormField>

                    <FormField
                        label={t("admin.providers.baseUrl")}
                        htmlFor="admin-provider-base-url"
                    >
                        <input
                            id="admin-provider-base-url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://api.example.com/v1"
                            className={formInputCls}
                        />
                    </FormField>

                    <FormField
                        label={t("admin.providers.apiKey")}
                        hint={
                            editing
                                ? t("admin.providers.apiKeyHint")
                                : undefined
                        }
                        htmlFor="admin-provider-api-key"
                    >
                        <input
                            id="admin-provider-api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={
                                editing
                                    ? t("admin.providers.apiKeyEditPlaceholder")
                                    : t("admin.providers.apiKeyPlaceholder")
                            }
                            className={formInputCls}
                            autoComplete="new-password"
                        />
                    </FormField>

                    <ModelProbeButton
                        active={isOpen}
                        label={t("admin.probe.provider")}
                        disabled={
                            saving ||
                            !baseUrl.trim() ||
                            (!apiKey.trim() && !provider?.apiKeyConfigured)
                        }
                        payload={{
                            providerId: provider?.id,
                            baseUrl: baseUrl.trim(),
                            apiKey: apiKey.trim() || undefined,
                        }}
                    />
                    <ProviderModelsEditor
                        key={`${isOpen}:${provider?.id ?? "new"}:${baseUrl}:${apiKey}`}
                        payload={{
                            providerId: provider?.id,
                            baseUrl: baseUrl.trim(),
                            apiKey: apiKey.trim() || undefined,
                        }}
                        models={models}
                        onChange={setModels}
                        disabled={
                            saving ||
                            !baseUrl.trim() ||
                            (!apiKey.trim() && !provider?.apiKeyConfigured)
                        }
                    />
                    <FormField
                        label={t("admin.providers.description")}
                        htmlFor="admin-provider-description"
                    >
                        <textarea
                            id="admin-provider-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className={`${formInputCls} resize-none`}
                        />
                    </FormField>

                    <details className="rounded-card border border-border p-4">
                        <summary className="cursor-pointer text-body font-semibold">
                            {t("admin.providers.advanced")}
                        </summary>
                        <FormField
                            label={t("admin.providers.vendor")}
                            htmlFor="admin-provider-vendor"
                        >
                            <input
                                id="admin-provider-vendor"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                placeholder="OPENAI_COMPATIBLE"
                                className={formInputCls}
                            />
                        </FormField>

                        <div className="mt-4 flex flex-wrap gap-4">
                            <label className="flex cursor-pointer items-center gap-2 text-caption font-medium text-ink-muted">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) =>
                                        setEnabled(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-border accent-ink"
                                />
                                {t("admin.providers.enabled")}
                            </label>
                            <label className="flex items-center gap-2 text-caption font-medium text-ink-muted">
                                <span>{t("admin.providers.priority")}</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={priority}
                                    onChange={(e) =>
                                        setPriority(e.target.value)
                                    }
                                    className={`${formInputCls} max-w-24`}
                                />
                            </label>
                        </div>
                    </details>
                    {formError && (
                        <p className="text-caption font-medium text-danger">
                            {formError}
                        </p>
                    )}
                </fieldset>
            )}
        </Modal>
    );
};

export default ProviderFormModal;
