import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessagesSquare, Send, Trash2 } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import FormField from "@shared/ui/forms/FormField";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { formInputCls } from "@shared/ui/forms/formStyles";
import ModelProbeResult from "../components/ModelProbeResult";
import { FEATURE_KEYS } from "../services/adminService";
import { useModelPlayground } from "../hooks/useModelPlayground";

const IMAGE_SIZES = ["256x256", "512x512", "1024x1024", "1024x1536", "1536x1024", "1792x1024", "1024x1792"];
const CUSTOM = "__custom__";

function PlaygroundSession({ initialSelection }) {
    const { t } = useTranslation();
    const state = useModelPlayground(initialSelection);
    const { selection, providers, configs, turns, pending } = state;
    const [imageDataUrl, setImageDataUrl] = useState("");
    const [imageError, setImageError] = useState("");
    const [maxOutputTokens, setMaxOutputTokens] = useState("");
    const [imageSize, setImageSize] = useState("");
    const readerRef = useRef(null);
    const endRef = useRef(null);
    const image = selection.featureKey === "blog_agent_image";
    const vision = selection.featureKey === "img2three_vision";
    const speech = selection.featureKey === "recitation_asr";
    const provider = providers.find((row) => row.id === selection.providerId);
    const invalidTokens = maxOutputTokens !== "" && (!Number.isInteger(Number(maxOutputTokens)) || Number(maxOutputTokens) < 1 || Number(maxOutputTokens) > 8192);
    const ready = provider?.enabled && provider.apiKeyConfigured && selection.model.trim() && selection.apiStyle && state.prompt.trim() && !speech && (!vision || imageDataUrl) && (!invalidTokens || image);

    useEffect(() => () => { readerRef.current?.abort(); readerRef.current = null; }, []);
    useEffect(() => { endRef.current?.scrollIntoView?.({ block: "end" }); }, [turns, pending]);

    const presets = useMemo(() => configs.flatMap((config) => ["primary", "fallback"].flatMap((slot) => {
        const providerId = config[`${slot}ProviderId`];
        const model = config[`${slot}Model`];
        const apiStyle = config[`${slot}ApiStyle`];
        return providerId && model && apiStyle ? [{ value: `${config.featureKey}:${slot}`, featureKey: config.featureKey, providerId, model, apiStyle,
            label: `${t(`admin.configs.feature.${config.featureKey}`)} · ${t(`admin.configs.${slot}`)} · ${model}` }] : [];
    })), [configs, t]);
    const selectedPreset = presets.find((preset) => ["featureKey", "providerId", "model", "apiStyle"].every((key) => preset[key] === selection[key]))?.value || CUSTOM;
    const availableModels = [...new Set([...state.models, ...presets.filter((preset) => preset.providerId === selection.providerId).map((preset) => preset.model)])];
    const styleOptions = (speech ? ["DASHSCOPE_ASR"] : image ? ["IMAGES_GENERATIONS", "CHAT_COMPLETIONS", "CHAT_PROMPT"] : ["CHAT_COMPLETIONS", "RESPONSES"]).map((value) => ({ value, label: value }));

    const chooseImage = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        readerRef.current?.abort(); readerRef.current = null;
        setImageDataUrl(""); setImageError("");
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) { setImageError("admin.playground.imageLimit"); return; }
        const reader = new FileReader();
        readerRef.current = reader;
        reader.onload = () => { if (readerRef.current === reader) { setImageDataUrl(String(reader.result)); readerRef.current = null; } };
        reader.onerror = () => { if (readerRef.current === reader) { setImageError("admin.playground.imageReadFailed"); readerRef.current = null; } };
        reader.readAsDataURL(file);
    };

    const send = (event) => {
        event?.preventDefault();
        if (!ready || pending) return;
        state.send({ imageDataUrl: vision ? imageDataUrl : undefined, maxOutputTokens: image ? undefined : maxOutputTokens, imageSize: image ? imageSize : undefined });
    };

    if (state.loading) return <LoadingSpinner fullScreen text={t("admin.playground.loading")} />;
    if (state.loadError) return <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <div role="alert" className="text-body text-danger-fg">{t("admin.playground.loadFailed")}</div>
        <Button variant="outline" onClick={state.load}>{t("admin.playground.retry")}</Button>
    </div>;

    return <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
            <div className="min-w-0">
                <div className="flex items-center gap-2 text-title text-ink"><MessagesSquare className="h-4 w-4" aria-hidden="true" />{t("admin.playground.title")}</div>
                <div className="mt-1 text-caption text-ink-muted">{t("admin.playground.subtitle")}</div>
            </div>
            <Button size="sm" variant="ghost" icon={Trash2} disabled={pending || !turns.length} onClick={state.reset}>{t("admin.playground.clear")}</Button>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <aside className="max-h-[40dvh] shrink-0 space-y-4 overflow-y-auto border-b border-border bg-surface p-4 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r lg:p-5">
                <fieldset disabled={pending} className="min-w-0 space-y-4">
                    <FormField label={t("admin.playground.preset")}>
                        <CustomSelect value={selectedPreset} options={[{ value: CUSTOM, label: t("admin.playground.custom") }, ...presets]} placeholder={t("admin.playground.preset")} onChange={(value) => {
                            const preset = presets.find((row) => row.value === value);
                            if (preset) state.changeSelection({ featureKey: preset.featureKey, providerId: preset.providerId, model: preset.model, apiStyle: preset.apiStyle });
                            else state.changeSelection({ model: "" });
                        }} />
                    </FormField>
                    <FormField label={t("admin.playground.provider")}>
                        <CustomSelect value={selection.providerId} options={providers.map((row) => ({ value: row.id, label: `${row.name}${row.enabled ? "" : ` · ${t("admin.providers.statusDisabled")}`}` }))} placeholder={t("admin.playground.provider")} onChange={(providerId) => state.changeSelection({ providerId, model: "" })} />
                        {provider && <div className="mt-1 break-all text-micro text-ink-faint">{provider.baseUrl}</div>}
                    </FormField>
                    <FormField label={t("admin.playground.model")}>
                        <CustomSelect value={availableModels.includes(selection.model) ? selection.model : CUSTOM} options={[{ value: CUSTOM, label: t("admin.playground.customModel") }, ...availableModels.map((value) => ({ value, label: value }))]} placeholder={t("admin.playground.model")} onChange={(value) => state.changeSelection({ model: value === CUSTOM ? "" : value })} />
                        <input aria-label={t("admin.playground.modelId")} value={selection.model} maxLength={100} onChange={(event) => state.changeSelection({ model: event.target.value })} className={`${formInputCls} mt-2`} placeholder={t("admin.playground.modelPlaceholder")} />
                        <Button size="sm" variant="ghost" className="mt-1" loading={state.modelsPending} disabled={!selection.providerId || !provider?.apiKeyConfigured} onClick={state.loadModels}>{t("admin.playground.loadModels")}</Button>
                        {state.modelsResult && <ModelProbeResult result={state.modelsResult} />}
                        {state.modelsResult?.ok && !state.models.length && <div className="mt-1 text-caption text-ink-muted">{t("admin.playground.emptyModels")}</div>}
                    </FormField>
                    <FormField label={t("admin.playground.feature")}>
                        <CustomSelect value={selection.featureKey} options={FEATURE_KEYS.map((value) => ({ value, label: t(`admin.configs.feature.${value}`) }))} placeholder={t("admin.playground.feature")} onChange={(featureKey) => state.changeSelection({ featureKey, apiStyle: featureKey === "recitation_asr" ? "DASHSCOPE_ASR" : featureKey === "blog_agent_image" ? "IMAGES_GENERATIONS" : "CHAT_COMPLETIONS" })} />
                    </FormField>
                    <FormField label={t("admin.playground.apiStyle")}>
                        <CustomSelect value={selection.apiStyle} options={styleOptions} placeholder={t("admin.playground.apiStyle")} onChange={(apiStyle) => state.changeSelection({ apiStyle })} />
                    </FormField>
                    {image ? <FormField label={t("admin.playground.imageSize")} hint={t("admin.playground.optionalHint")}>
                        <CustomSelect value={imageSize} options={[{ value: "", label: t("admin.playground.providerDefault") }, ...IMAGE_SIZES.map((value) => ({ value, label: value }))]} placeholder={t("admin.playground.imageSize")} onChange={setImageSize} />
                    </FormField> : !speech && <FormField label={t("admin.playground.maxTokens")} htmlFor="admin-test-max-tokens" hint={t("admin.playground.optionalHint")}>
                        <input id="admin-test-max-tokens" type="number" min="1" max="8192" value={maxOutputTokens} onChange={(event) => setMaxOutputTokens(event.target.value)} placeholder={t("admin.playground.providerDefault")} className={formInputCls} />
                        {invalidTokens && <div role="alert" className="mt-1 text-caption text-danger-fg">{t("admin.playground.tokenRange")}</div>}
                    </FormField>}
                    {vision && <FormField label={t("admin.playground.testImage")} htmlFor="admin-test-image" hint={t("admin.playground.imageLimit")}>
                        <input id="admin-test-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} className="w-full text-caption text-ink-muted" />
                        {imageDataUrl && <img src={imageDataUrl} alt={t("admin.playground.inputImage")} className="mt-3 max-h-32 rounded-control object-contain" />}
                        {imageError && <div role="alert" className="mt-1 text-caption text-danger-fg">{t(imageError)}</div>}
                    </FormField>}
                </fieldset>
                <div className="text-caption leading-relaxed text-ink-faint">{t("admin.playground.sessionHint")}</div>
            </aside>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div role="log" aria-label={t("admin.playground.conversation")} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                    {!turns.length && <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-center">
                        <MessagesSquare className="h-7 w-7 text-ink-faint" aria-hidden="true" />
                        <div className="text-body font-semibold text-ink">{t("admin.playground.emptyTitle")}</div>
                        <div className="max-w-md text-caption text-ink-muted">{t("admin.playground.emptyHint")}</div>
                    </div>}
                    {turns.map((turn) => <article key={turn.id} className="mx-auto max-w-3xl space-y-3">
                        <div className="ml-auto max-w-[90%] rounded-card bg-surface-muted px-4 py-3">
                            <div className="mb-1 text-micro font-semibold text-ink-muted">{t("admin.playground.you")}</div>
                            <div className="whitespace-pre-wrap break-words text-body text-ink">{turn.prompt}</div>
                            {turn.inputImage && <img src={turn.inputImage} alt={t("admin.playground.inputImage")} className="mt-2 max-h-32 rounded-control object-contain" />}
                        </div>
                        <div className="space-y-3">
                            <div className="break-all text-caption font-semibold text-ink">{turn.model} · {turn.apiStyle}</div>
                            {!turn.result && <div className="flex items-center gap-2 text-caption text-ink-muted"><LoadingSpinner fullScreen={false} size="sm" />{t("admin.playground.waiting")}</div>}
                            {turn.result?.output?.text && <div className="whitespace-pre-wrap break-words text-body leading-relaxed text-ink">{turn.result.output.text}</div>}
                            {turn.result?.output?.images?.map((src, index) => <img key={index} src={src} alt={t("admin.playground.outputImage", { index: index + 1 })} referrerPolicy="no-referrer" className="max-h-[60dvh] max-w-full rounded-card object-contain" />)}
                            <ModelProbeResult result={turn.result} />
                        </div>
                    </article>)}
                    <div ref={endRef} />
                </div>
                <form onSubmit={send} className="shrink-0 space-y-2 border-t border-border bg-canvas p-4 sm:px-6">
                    {speech && <div className="text-caption text-warning-fg">{t("admin.probe.audio_required")}</div>}
                    {provider && (!provider.enabled || !provider.apiKeyConfigured) && <div className="text-caption text-danger-fg">{t(provider.enabled ? "admin.probe.key_missing" : "admin.probe.provider_disabled")}</div>}
                    <textarea aria-label={t("admin.playground.prompt")} value={state.prompt} disabled={pending} maxLength={8000} rows={3} onChange={(event) => state.setPrompt(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.nativeEvent.isComposing) send(event); }} placeholder={t(image ? "admin.playground.imagePromptPlaceholder" : "admin.playground.promptPlaceholder")} className={`${formInputCls} max-h-40 resize-y`} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 text-micro text-ink-faint">{t("admin.probe.costHint")} {t(image ? "admin.playground.imageIndependent" : "admin.playground.shortcut")}</div>
                        <div className="flex shrink-0 gap-2">{pending && <Button key="stop" variant="outline" size="sm" onClick={state.stopWaiting}>{t("admin.playground.stopWaiting")}</Button>}<Button key="send" size="sm" type="submit" icon={Send} loading={pending} disabled={!ready || pending}>{t("admin.playground.send")}</Button></div>
                    </div>
                </form>
            </section>
        </div>
    </div>;
}

export default function AdminModelPlaygroundPage() {
    const [params] = useSearchParams();
    const providerId = Number(params.get("providerId"));
    const featureKey = params.get("featureKey");
    const initialSelection = {
        ...(Number.isSafeInteger(providerId) && providerId > 0 ? { providerId } : {}),
        ...(FEATURE_KEYS.includes(featureKey) ? { featureKey } : {}),
        ...(params.get("model") ? { model: params.get("model").slice(0, 100) } : {}),
        ...(params.get("apiStyle") ? { apiStyle: params.get("apiStyle") } : {}),
    };
    return <PlaygroundSession key={params.toString()} initialSelection={initialSelection} />;
}
