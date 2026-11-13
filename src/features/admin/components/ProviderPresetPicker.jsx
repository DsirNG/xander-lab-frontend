import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Server, Settings2 } from "lucide-react";
import { formInputCls } from "@shared/ui/forms/formStyles";

// Official API base URLs; model names are discovered live rather than frozen in presets.
const PRESETS = [
    {
        name: "DeepSeek",
        baseUrl: "https://api.deepseek.com",
        category: "vendor",
    },
    {
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1",
        category: "platform",
    },
];
export default function ProviderPresetPicker({ onSelect }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const presets = PRESETS.filter(
        (item) =>
            (category === "all" || item.category === category) &&
            `${item.name} ${item.baseUrl}`
                .toLowerCase()
                .includes(search.toLowerCase()),
    );
    return (
        <div className="space-y-5">
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={formInputCls}
                placeholder={t("admin.providers.searchPresets")}
                aria-label={t("admin.providers.searchPresets")}
            />
            <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex shrink-0 gap-1 sm:w-36 sm:flex-col">
                    {["all", "vendor", "platform"].map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setCategory(key)}
                            aria-pressed={category === key}
                            className={`rounded-control px-3 py-2 text-left text-caption ${category === key ? "bg-surface-muted font-semibold text-ink" : "text-ink-muted"}`}
                        >
                            {t(`admin.providers.category.${key}`)}
                        </button>
                    ))}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                    <button
                        type="button"
                        onClick={() => onSelect({ name: "", baseUrl: "" })}
                        className="flex w-full items-center gap-3 rounded-card border border-border bg-surface p-4 text-left hover:bg-surface-muted"
                    >
                        <Settings2 className="h-6 w-6 shrink-0" />
                        <div>
                            <div className="text-body font-semibold">
                                {t("admin.providers.custom")}
                            </div>
                            <div className="mt-1 text-caption text-ink-muted">
                                {t("admin.providers.customHint")}
                            </div>
                        </div>
                    </button>
                    <div className="grid gap-3 md:grid-cols-2">
                        {presets.map((preset) => (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => onSelect(preset)}
                                className="flex min-w-0 items-center gap-3 rounded-card border border-border bg-surface p-4 text-left hover:bg-surface-muted"
                            >
                                <Server className="h-6 w-6 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-body font-semibold">
                                        {preset.name}
                                    </div>
                                    <div className="mt-1 truncate text-caption text-ink-muted">
                                        {preset.baseUrl}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    {!presets.length && (
                        <div className="text-caption text-ink-muted">
                            {t("admin.providers.noMatches")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
