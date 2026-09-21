import React from "react";
import { Check } from "lucide-react";
import FormField from "@shared/ui/forms/FormField";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import TimezoneSelect from "@shared/ui/forms/TimezoneSelect";
import TimeInput from "@shared/ui/forms/TimeInput";
import { formInputCls } from "@shared/ui/forms/formStyles";

export default function PlanFormFields({
    t,
    form,
    updateForm,
    planTypes,
    aiOptions,
    knowledgeMaterials,
    error,
    tomorrow,
}) {
    return (
        <div className="space-y-5">
            <FormField
                label={t("blogPlans.topic")}
                hint={t("blogPlans.customDailyHint")}
            >
                <div className="relative">
                    <input
                        className={`${formInputCls} pr-16`}
                        value={form.topic}
                        maxLength={500}
                        onChange={(event) =>
                            updateForm("topic", event.target.value)
                        }
                        placeholder={t("blogPlans.topicPlaceholder")}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-micro text-ink-faint">
                        {form.topic.length}/500
                    </span>
                </div>
            </FormField>

            <FormField label={t("blogPlans.knowledgeBase")}>
                <CustomSelect
                    size="sm"
                    value={form.knowledgeMaterialId}
                    onChange={(value) =>
                        updateForm("knowledgeMaterialId", value)
                    }
                    options={[
                        {
                            value: "",
                            label: t("blogPlans.noKnowledgeBase"),
                        },
                        ...knowledgeMaterials.map((item) => ({
                            value: String(item.id),
                            label: item.title,
                        })),
                    ]}
                />
            </FormField>

            <div>
                <div className="mb-2 text-caption font-semibold text-ink">
                    {t("blogPlans.scheduleType")}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {planTypes.map(([value, titleKey, hintKey]) => {
                        const selected = form.scheduleType === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => updateForm("scheduleType", value)}
                                className={`relative rounded-xl border px-4 py-3 text-left transition-colors ${selected ? "border-accent bg-accent-soft shadow-sm" : "border-border bg-canvas hover:border-border-strong"}`}
                            >
                                {selected && (
                                    <Check className="absolute right-3 top-3 h-4 w-4 text-accent" />
                                )}
                                <div
                                    className={`text-body font-semibold ${selected ? "text-accent" : "text-ink"}`}
                                >
                                    {t(`blogPlans.${titleKey}`)}
                                </div>
                                <div className="mt-1 pr-4 text-micro text-ink-faint">
                                    {t(`blogPlans.${hintKey}`)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <FormField label={t("blogPlans.triggerTime")}>
                <div
                    className={`grid grid-cols-1 gap-3 ${form.scheduleType === "DAILY" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
                >
                    {form.scheduleType !== "DAILY" && (
                        <input
                            type="date"
                            className={formInputCls}
                            min={tomorrow()}
                            value={form.scheduledDate}
                            onChange={(event) =>
                                updateForm(
                                    "scheduledDate",
                                    event.target.value,
                                )
                            }
                            aria-label={t(
                                form.scheduleType === "ONCE"
                                    ? "blogPlans.executionDate"
                                    : "blogPlans.firstExecutionDate",
                            )}
                        />
                    )}
                    <TimeInput
                        size="sm"
                        value={form.triggerTime}
                        onChange={(event) =>
                            updateForm("triggerTime", event.target.value)
                        }
                    />
                    <TimezoneSelect
                        size="sm"
                        value={form.timezone}
                        onChange={(value) => updateForm("timezone", value)}
                    />
                </div>
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label={t("blogPlans.audience")}>
                    <input
                        className={formInputCls}
                        value={form.audience}
                        maxLength={120}
                        onChange={(event) =>
                            updateForm("audience", event.target.value)
                        }
                        placeholder={t("blogPlans.audiencePlaceholder")}
                    />
                </FormField>
                <FormField label={t("blogPlans.tone")}>
                    <input
                        className={formInputCls}
                        value={form.tone}
                        maxLength={60}
                        onChange={(event) =>
                            updateForm("tone", event.target.value)
                        }
                        placeholder={t("blogPlans.tonePlaceholder")}
                    />
                </FormField>
            </div>

            <div>
                <div className="mb-2 text-caption font-semibold text-ink">
                    {t("blogPlans.aiDirection")}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {aiOptions.map(([value, titleKey, hintKey]) => {
                        const selected = form.aiOption === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => updateForm("aiOption", value)}
                                className={`relative rounded-xl border p-3 text-left transition-colors ${selected ? "border-accent bg-accent-soft" : "border-border bg-canvas hover:border-border-strong"}`}
                            >
                                {selected && (
                                    <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-accent" />
                                )}
                                <div
                                    className={`text-caption font-semibold ${selected ? "text-accent" : "text-ink"}`}
                                >
                                    {t(`blogPlans.${titleKey}`)}
                                </div>
                                <div className="mt-1 pr-2 text-micro text-ink-faint">
                                    {t(`blogPlans.${hintKey}`)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="mb-2 text-caption font-semibold text-ink">
                    {t("blogPlans.publishPlatforms")}
                </div>
                <div
                    className={`flex flex-wrap gap-2 ${form.autoPublish ? "" : "opacity-50"}`}
                >
                    <div className="flex items-center gap-2 rounded-xl border border-accent bg-accent-soft px-3 py-2 text-caption text-accent">
                        <Check className="h-4 w-4" /> {t("blogPlans.localPlatform")}
                    </div>
                    {[
                        ["syncJuejin", form.syncJuejin, t("blogPlans.syncJuejin")],
                        ["syncCsdn", form.syncCsdn, t("blogPlans.syncCsdn")],
                    ].map(([field, checked, label]) => (
                        <label
                            key={field}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-caption transition-colors ${checked ? "border-accent bg-accent-soft text-accent" : "border-border bg-canvas text-ink-secondary"}`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled={!form.autoPublish}
                                onChange={(event) =>
                                    updateForm(field, event.target.checked)
                                }
                                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-body text-ink-secondary">
                <input
                    type="checkbox"
                    checked={form.autoPublish}
                    onChange={(event) =>
                        updateForm("autoPublish", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                {t("blogPlans.autoPublish")}
            </label>

            {error && (
                <div role="alert" className="text-caption text-danger">
                    {error}
                </div>
            )}
        </div>
    );
}
