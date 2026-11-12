import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import ModelPlaygroundLink from "./ModelPlaygroundLink";
import Modal from "@shared/ui/overlays/Modal";
import FormField from "@shared/ui/forms/FormField";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { useToast } from "@shared/hooks/useToast";
import { adminService } from "../services/adminService";

/** Edits primary and fallback provider, model, and API style for a feature. */
const API_STYLE_IMAGES = "IMAGES_GENERATIONS";
const API_STYLE_CHAT = "CHAT_COMPLETIONS";
const API_STYLE_CHAT_PROMPT = "CHAT_PROMPT";
const API_STYLE_RESPONSES = "RESPONSES";
const API_STYLE_DASHSCOPE_ASR = "DASHSCOPE_ASR";

const providerLabel = (provider) => {
    if (!provider.baseUrl) return provider.name;
    try {
        return `${provider.name} · ${new URL(provider.baseUrl).hostname}`;
    } catch {
        return provider.name;
    }
};

const FeatureConfigModal = ({
    isOpen,
    config,
    providers,
    onClose,
    onSaved,
}) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [enabled, setEnabled] = useState(false);
    const [primaryProviderId, setPrimaryProviderId] = useState(null);
    const [primaryModel, setPrimaryModel] = useState("");
    const [primaryApiStyle, setPrimaryApiStyle] = useState("");
    const [fallbackProviderId, setFallbackProviderId] = useState(null);
    const [fallbackModel, setFallbackModel] = useState("");
    const [fallbackApiStyle, setFallbackApiStyle] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const providerOptions = useMemo(
        () =>
            providers.map((p) => ({
                value: p.id,
                label: providerLabel(p),
            })),
        [providers],
    );
    const fallbackOptions = useMemo(
        () => [
            { value: "", label: t("admin.configs.noFallback") },
            ...providerOptions,
        ],
        [providerOptions, t],
    );
    const styleOptions = useMemo(() => {
        const isImage = config?.featureKey === "blog_agent_image";
        const isSpeech = config?.featureKey === "recitation_asr";
        // agent / blog_agent / img2three_vision 的客户端已按 apiStyle 分流：配成
        // CHAT_COMPLETIONS 就发 /chat/completions，否则发 /responses。所以文本功能
        // 这里可以如实给出两个选项，选中哪个就真的走哪个。
        const options = isSpeech
            ? [API_STYLE_DASHSCOPE_ASR]
            : isImage
              ? [API_STYLE_CHAT, API_STYLE_CHAT_PROMPT, API_STYLE_IMAGES]
              : [API_STYLE_RESPONSES, API_STYLE_CHAT];
        return options.map((style) => ({
            value: style,
            label:
                style === API_STYLE_IMAGES
                    ? t("admin.configs.apiStyleImages")
                    : style === API_STYLE_CHAT
                      ? t("admin.configs.apiStyleChat")
                      : style === API_STYLE_CHAT_PROMPT
                        ? t("admin.configs.apiStyleChatPrompt")
                        : style === API_STYLE_DASHSCOPE_ASR
                          ? t("admin.configs.apiStyleDashscopeAsr")
                          : t("admin.configs.apiStyleResponses"),
        }));
    }, [config?.featureKey, t]);

    useEffect(() => {
        if (!isOpen) return;
        if (config) {
            setEnabled(config.enabled);
            setPrimaryProviderId(config.primaryProviderId || null);
            setPrimaryModel(config.primaryModel || "");
            // 存量值原样带回：客户端现在按 apiStyle 分流，存 CHAT_COMPLETIONS 也是
            // 合法且会被采纳的，下拉里能找到匹配项，不必再做归一。
            setPrimaryApiStyle(config.primaryApiStyle || "");
            setFallbackProviderId(config.fallbackProviderId || null);
            setFallbackModel(config.fallbackModel || "");
            setFallbackApiStyle(config.fallbackApiStyle || "");
        } else {
            setEnabled(false);
            setPrimaryProviderId(null);
            setPrimaryModel("");
            setPrimaryApiStyle("");
            setFallbackProviderId(null);
            setFallbackModel("");
            setFallbackApiStyle("");
        }
        setFormError("");
    }, [isOpen, config]);

    const handlePrimaryProviderChange = (providerId) => {
        setPrimaryProviderId(providerId);
        if (providerId && config?.featureKey === "recitation_asr") {
            setPrimaryApiStyle(API_STYLE_DASHSCOPE_ASR);
        }
    };

    const handleSubmit = async () => {
        const primaryModelTrimmed = primaryModel.trim();
        const fallbackModelTrimmed = fallbackModel.trim();
        const fallbackActive = Boolean(fallbackProviderId);
        if (
            !enabled &&
            (primaryProviderId ||
                primaryModelTrimmed ||
                primaryApiStyle ||
                fallbackProviderId ||
                fallbackModelTrimmed ||
                fallbackApiStyle)
        ) {
            setFormError(t("admin.configs.formUntypedWhileEnabled"));
            return;
        }
        if (enabled && !primaryProviderId) {
            setFormError(t("admin.configs.formPrimaryRequired"));
            return;
        }
        if (primaryProviderId && (!primaryModelTrimmed || !primaryApiStyle)) {
            setFormError(t("admin.configs.formModelRequired"));
            return;
        }
        if (fallbackActive && (!fallbackModelTrimmed || !fallbackApiStyle)) {
            setFormError(t("admin.configs.formModelRequired"));
            return;
        }
        if (
            primaryProviderId &&
            fallbackActive &&
            primaryProviderId === fallbackProviderId &&
            primaryModelTrimmed === fallbackModelTrimmed
        ) {
            setFormError(t("admin.configs.formFallbackDuplicate"));
            return;
        }
        try {
            setSaving(true);
            await adminService.updateFeatureConfig(config.featureKey, {
                enabled,
                primaryProviderId,
                primaryModel: primaryModelTrimmed || null,
                primaryApiStyle: primaryApiStyle || null,
                fallbackProviderId: fallbackActive ? fallbackProviderId : null,
                fallbackModel: fallbackActive
                    ? fallbackModelTrimmed || null
                    : null,
                fallbackApiStyle: fallbackActive
                    ? fallbackApiStyle || null
                    : null,
            });
            toast.success(t("admin.configs.updated"));
            onClose();
            onSaved?.();
        } catch (err) {
            setFormError(
                err?.response?.data?.message || t("admin.configs.saveFailed"),
            );
        } finally {
            setSaving(false);
        }
    };

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-control px-5 py-2.5 text-caption font-bold text-ink-muted transition hover:bg-surface-muted disabled:opacity-50"
            >
                {t("common.cancel")}
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-control bg-ink px-6 py-2.5 text-caption font-bold text-canvas transition hover:bg-ink-secondary active:scale-95 disabled:opacity-60"
            >
                {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {t("common.save")}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("admin.configs.editTitle", {
                feature: t(`admin.configs.feature.${config?.featureKey}`),
            })}
            width="max-w-2xl"
            className="rounded-dialog shadow-float!"
            footer={footer}
        >
            <div className="space-y-5">
                <div className="flex flex-wrap gap-4">
            <ModelPlaygroundLink
                active={isOpen}
                featureKey={config?.featureKey}
                label={t("admin.probe.primary")}
                disabled={saving || !primaryProviderId || !primaryModel.trim() || !primaryApiStyle}
                payload={{ providerId: primaryProviderId, model: primaryModel.trim(), apiStyle: primaryApiStyle }}
            />
            <ModelPlaygroundLink
                active={isOpen}
                featureKey={config?.featureKey}
                label={t("admin.probe.fallback")}
                disabled={saving || !fallbackProviderId || !fallbackModel.trim() || !fallbackApiStyle}
                payload={{ providerId: fallbackProviderId, model: fallbackModel.trim(), apiStyle: fallbackApiStyle }}
            />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-caption font-medium text-ink">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-ink"
                    />
                    {t("admin.configs.formEnabled")}
                    <span className="text-micro font-normal text-ink-faint">
                        {t("admin.configs.formEnabledHint")}
                    </span>
                </label>

                <p className="rounded-control bg-surface-muted px-3 py-2.5 text-micro leading-relaxed text-ink-muted">
                    {t("admin.configs.configHint")}
                </p>

                <div>
                    <p className="mb-2 text-caption font-bold text-ink-secondary">
                        {t("admin.configs.primary")}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField label={t("admin.configs.primaryProvider")}>
                            <CustomSelect
                                size="xs"
                                options={providerOptions}
                                value={primaryProviderId}
                                onChange={handlePrimaryProviderChange}
                                placeholder={t("admin.configs.selectProvider")}
                            />
                        </FormField>
                        <FormField
                            label={t("admin.configs.primaryModel")}
                            htmlFor="admin-config-primary-model"
                        >
                            <input
                                id="admin-config-primary-model"
                                value={primaryModel}
                                onChange={(e) =>
                                    setPrimaryModel(e.target.value)
                                }
                                placeholder={
                                    config?.featureKey === "recitation_asr"
                                        ? "paraformer-v2"
                                        : "gpt-4o"
                                }
                                className={formInputCls}
                                disabled={!primaryProviderId}
                            />
                        </FormField>
                        <FormField label={t("admin.configs.primaryApiStyle")}>
                            <CustomSelect
                                size="xs"
                                options={styleOptions}
                                value={primaryApiStyle || ""}
                                onChange={(value) =>
                                    setPrimaryApiStyle(value || "")
                                }
                                placeholder={t("admin.configs.selectProvider")}
                            />
                        </FormField>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-caption font-bold text-ink-secondary">
                        {t("admin.configs.fallback")}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField label={t("admin.configs.fallbackProvider")}>
                            <CustomSelect
                                size="xs"
                                options={fallbackOptions}
                                value={fallbackProviderId || ""}
                                onChange={(value) => {
                                    setFallbackProviderId(
                                        value === "" ? null : value,
                                    );
                                    if (value === "") {
                                        setFallbackModel("");
                                        setFallbackApiStyle("");
                                    } else if (
                                        config?.featureKey === "recitation_asr"
                                    ) {
                                        setFallbackApiStyle(
                                            API_STYLE_DASHSCOPE_ASR,
                                        );
                                    }
                                }}
                                placeholder={t("admin.configs.selectProvider")}
                            />
                        </FormField>
                        <FormField
                            label={t("admin.configs.fallbackModel")}
                            htmlFor="admin-config-fallback-model"
                        >
                            <input
                                id="admin-config-fallback-model"
                                value={fallbackModel}
                                onChange={(e) =>
                                    setFallbackModel(e.target.value)
                                }
                                placeholder={
                                    config?.featureKey === "recitation_asr"
                                        ? "paraformer-v2"
                                        : "gpt-4o-mini"
                                }
                                className={formInputCls}
                                disabled={!fallbackProviderId}
                            />
                        </FormField>
                        <FormField label={t("admin.configs.fallbackApiStyle")}>
                            <CustomSelect
                                size="xs"
                                options={styleOptions}
                                value={fallbackApiStyle || ""}
                                onChange={(value) =>
                                    setFallbackApiStyle(value || "")
                                }
                                placeholder={t("admin.configs.selectProvider")}
                            />
                        </FormField>
                    </div>
                </div>

                <p className="text-micro text-ink-faint">
                    {t("admin.configs.apiStyleHint")}
                </p>

                {formError && (
                    <p className="text-caption font-medium text-danger">
                        {formError}
                    </p>
                )}
            </div>
        </Modal>
    );
};

export default FeatureConfigModal;
