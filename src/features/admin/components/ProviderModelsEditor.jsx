import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Plus, X } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import { formInputCls } from "@shared/ui/forms/formStyles";
import ModelProbeResult from "./ModelProbeResult";
import { adminService } from "../services/adminService";

/** Draft-only catalog. Secrets are sent through the existing admin probe endpoint. */
export default function ProviderModelsEditor({
    payload,
    models,
    onChange,
    disabled,
}) {
    const { t } = useTranslation();
    const [manual, setManual] = useState("");
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [pending, setPending] = useState(false);
    const request = useRef(null);
    useEffect(() => () => request.current?.abort(), []);
    const add = (model) => {
        const value = model.trim();
        if (
            !value ||
            value.length > 100 ||
            models.includes(value) ||
            models.length >= 200
        )
            return;
        onChange([...models, value]);
        setManual("");
    };
    const discover = async () => {
        if (request.current || disabled) return;
        const controller = new AbortController();
        request.current = controller;
        setPending(true);
        setResult(null);
        try {
            const data = await adminService.testProvider(payload, {
                signal: controller.signal,
                timeout: 100000,
                _silent: true,
            });
            if (!controller.signal.aborted) setResult(data);
        } catch (error) {
            if (!controller.signal.aborted)
                setResult({
                    ok: false,
                    reason: "connection",
                    error: {
                        message:
                            error?.response?.data?.message ||
                            t("admin.probe.connection"),
                    },
                });
        } finally {
            if (!controller.signal.aborted) {
                setPending(false);
                request.current = null;
            }
        }
    };
    return (
        <section className="space-y-3 rounded-card border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-body font-semibold">
                    {t("admin.providers.modelsTitle", { count: models.length })}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    loading={pending}
                    disabled={disabled}
                    onClick={discover}
                >
                    <Download className="h-4 w-4" />
                    {t("admin.providers.fetchModels")}
                </Button>
            </div>
            <div className="text-caption text-ink-muted">
                {t("admin.providers.modelsHint")}
            </div>
            <ModelProbeResult result={result} />
            <div className="flex gap-2">
                <input
                    aria-label={t("admin.providers.manualModel")}
                    maxLength={100}
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            add(manual);
                        }
                    }}
                    className={`${formInputCls} min-w-0 flex-1`}
                    placeholder={t("admin.providers.manualModel")}
                />
                <Button
                    variant="outline"
                    disabled={!manual.trim() || models.length >= 200}
                    onClick={() => add(manual)}
                >
                    <Plus className="h-4 w-4" />
                    {t("admin.providers.addModel")}
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {models.map((model) => (
                    <span
                        key={model}
                        className="inline-flex max-w-full items-center gap-1 rounded-control bg-surface-muted px-2 py-1 text-caption"
                    >
                        <span className="break-all">{model}</span>
                        <button
                            type="button"
                            aria-label={t("admin.providers.removeModel", {
                                model,
                            })}
                            onClick={() =>
                                onChange(
                                    models.filter((item) => item !== model),
                                )
                            }
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </span>
                ))}
            </div>
            {result?.ok && (
                <div className="space-y-2">
                    <input
                        aria-label={t("admin.providers.searchModels")}
                        placeholder={t("admin.providers.searchModels")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={formInputCls}
                    />
                    <div className="max-h-48 overflow-y-auto rounded-control border border-border">
                        {(result.models ?? [])
                            .filter((model) =>
                                model
                                    .toLowerCase()
                                    .includes(query.toLowerCase()),
                            )
                            .map((model) => (
                                <label
                                    key={model}
                                    className="flex items-center gap-2 px-3 py-2 text-caption hover:bg-surface-muted"
                                >
                                    <input
                                        type="checkbox"
                                        checked={models.includes(model)}
                                        disabled={
                                            !models.includes(model) &&
                                            models.length >= 200
                                        }
                                        onChange={(e) =>
                                            e.target.checked
                                                ? add(model)
                                                : onChange(
                                                      models.filter(
                                                          (item) =>
                                                              item !== model,
                                                      ),
                                                  )
                                        }
                                    />
                                    <span className="break-all">{model}</span>
                                </label>
                            ))}
                        {!result.models?.length && (
                            <div className="p-3 text-caption text-ink-muted">
                                {t("admin.providers.noModels")}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
