import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Sparkles } from "lucide-react";
import Modal from "@shared/ui/overlays/Modal";
import Button from "@shared/ui/primitives/Button";
import TimezoneSelect from "@shared/ui/forms/TimezoneSelect";
import TimeInput from "@shared/ui/forms/TimeInput";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { blogPlanService } from "../../services/blogPlanService";
import PlanPlatformPicker from "./PlanPlatformPicker";
import { useToast } from "@shared/hooks/useToast";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_DAYS = 30;
const tomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const initialForm = () => ({
    topic: "",
    days: 7,
    time: "09:00",
    timezone: "Asia/Shanghai",
    startDate: tomorrowDate(),
    platforms: ["local"],
    publishMode: "REVIEW",
    audience: "",
    tone: "",
});

/**
 * AI 生成计划：按主题方向 + 天数，生成 N 个一次性计划，
 * 从明天起每天同一时刻各发布一篇，执行完自动完结
 */
const PlanAiGenerateModal = ({
    isOpen,
    onClose,
    onSaved,
    initialDraft = null,
}) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [form, setForm] = useState(initialForm());
    const [error, setError] = useState("");
    const [generating, setGenerating] = useState(false);
    const [draft, setDraft] = useState(null);
    const [createdPlans, setCreatedPlans] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setForm(initialForm());
            setError("");
            setCreatedPlans([]);
            setDraft(null);
            if (initialDraft) {
                setForm({
                    topic: initialDraft.topic,
                    days: initialDraft.topics.length,
                    time: initialDraft.triggerTime,
                    timezone: initialDraft.timezone,
                    startDate: initialDraft.startDate,
                    platforms: initialDraft.platforms,
                    publishMode: initialDraft.publishMode,
                    aiOption: initialDraft.aiOption || "DEEP",
                    audience: initialDraft.audience,
                    tone: initialDraft.tone,
                });
                setDraft(initialDraft);
            }
        }
    }, [initialDraft, isOpen]);

    const formatFireTime = (plan) => {
        if (!plan?.nextRunAt) return "—";
        try {
            return new Date(plan.nextRunAt).toLocaleString(undefined, {
                timeZone: plan.timezone || "Asia/Shanghai",
            });
        } catch {
            return new Date(plan.nextRunAt).toLocaleString();
        }
    };

    const submit = async () => {
        if (!form.topic.trim()) {
            setError(t("blogPlans.topicRequired"));
            return;
        }
        if (!TIME_RE.test(form.time)) {
            setError(t("blogPlans.timeInvalid"));
            return;
        }
        if (!form.startDate || form.startDate < tomorrowDate()) {
            setError(t("blogPlans.executionDate"));
            return;
        }
        setGenerating(true);
        setError("");
        try {
            const payload = {
                topic: form.topic.trim(),
                days: form.days,
                triggerTime: form.time,
                startDate: form.startDate,
                timezone: form.timezone,
                platforms: form.platforms,
                publishMode: form.publishMode,
                audience: form.audience.trim(),
                tone: form.tone.trim(),
            };
            const draftSeries =
                await blogPlanService.createSeriesDraft(payload);
            if (
                !Array.isArray(draftSeries.topics) ||
                draftSeries.topics.length !== payload.days
            ) {
                throw new Error(t("blogPlans.dailyTopicsInvalid"));
            }
            setDraft(draftSeries);
        } catch (e) {
            toast.error(
                e?.response?.data?.message ||
                    e.message ||
                    t("blogPlans.generateFailed"),
            );
        } finally {
            setGenerating(false);
        }
    };

    const confirm = async () => {
        const topics = draft.topics.map((topic) => topic.trim());
        if (!form.startDate || form.startDate < tomorrowDate()) {
            setError(t("blogPlans.executionDate"));
            return;
        }
        if (
            topics.some((topic) => !topic) ||
            new Set(topics.map((topic) => topic.toLocaleLowerCase())).size !==
                draft.topics.length
        ) {
            setError(t("blogPlans.dailyTopicsInvalid"));
            return;
        }
        setGenerating(true);
        setError("");
        try {
            const updated = await blogPlanService.updateSeriesDraft(draft.id, {
                title: draft.title,
                topic: draft.topic,
                days: topics.length,
                topics,
                startDate: form.startDate,
                triggerTime: form.time,
                timezone: form.timezone,
                platforms: form.platforms,
                publishMode: form.publishMode,
                audience: form.audience.trim(),
                tone: form.tone.trim(),
                aiOption: form.aiOption,
            });
            const activated = await blogPlanService.activateSeries(updated.id);
            setDraft(null);
            const created = activated.items || [];
            setCreatedPlans(created);
            toast.success(
                t("blogPlans.generatedPlans", { count: created.length }),
            );
            await onSaved?.();
        } catch (e) {
            toast.error(
                e?.response?.data?.message || t("blogPlans.generateFailed"),
            );
        } finally {
            setGenerating(false);
        }
    };

    const footer = (
        <>
            <Button onClick={onClose} disabled={generating} variant="outline">
                {t("common.close")}
            </Button>
            <Button
                onClick={draft ? confirm : submit}
                disabled={createdPlans.length > 0}
                loading={generating}
                variant="ink"
                icon={Sparkles}
            >
                {t(
                    draft
                        ? "blogPlans.confirmDailyPlans"
                        : "blogPlans.aiGenerate",
                )}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("blogPlans.aiGenerateTitle")}
            width="max-w-xl"
            footer={footer}
        >
            <div className="space-y-4">
                <fieldset
                    disabled={generating}
                    className="space-y-4 disabled:opacity-60"
                >
                    <div className="text-xs text-ink-faint">
                        {t("blogPlans.aiGenerateDesc")}
                    </div>

                    <FormField label={t("blogPlans.aiSeed")}>
                        <input
                            className={formInputCls}
                            value={form.topic}
                            maxLength={500}
                            disabled={Boolean(draft)}
                            onChange={(e) =>
                                setForm({ ...form, topic: e.target.value })
                            }
                            placeholder={t("blogPlans.aiSeedPlaceholder")}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField label={t("blogPlans.seriesStartDate")}>
                            <input
                                type="date"
                                min={tomorrowDate()}
                                className={formInputCls}
                                value={form.startDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                        </FormField>
                        <FormField label={t("blogPlans.days")}>
                            <input
                                type="number"
                                min="1"
                                max={MAX_DAYS}
                                className={formInputCls}
                                value={form.days}
                                disabled={Boolean(draft)}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        days: Math.min(
                                            MAX_DAYS,
                                            Math.max(
                                                1,
                                                Number(e.target.value) || 1,
                                            ),
                                        ),
                                    })
                                }
                            />
                        </FormField>
                        <FormField label={t("blogPlans.triggerTime")}>
                            <TimeInput
                                size="sm"
                                value={form.time}
                                onChange={(e) =>
                                    setForm({ ...form, time: e.target.value })
                                }
                            />
                        </FormField>
                        <FormField label={t("blogPlans.timezone")}>
                            <TimezoneSelect
                                size="sm"
                                value={form.timezone}
                                onChange={(value) =>
                                    setForm({ ...form, timezone: value })
                                }
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label={t("blogPlans.audience")}>
                            <input
                                className={formInputCls}
                                value={form.audience}
                                maxLength={120}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        audience: e.target.value,
                                    })
                                }
                                placeholder={t("blogPlans.audiencePlaceholder")}
                            />
                        </FormField>
                        <FormField label={t("blogPlans.tone")}>
                            <input
                                className={formInputCls}
                                value={form.tone}
                                maxLength={60}
                                onChange={(e) =>
                                    setForm({ ...form, tone: e.target.value })
                                }
                                placeholder={t("blogPlans.tonePlaceholder")}
                            />
                        </FormField>
                    </div>

                    <div className="space-y-2">
                        <div className="text-caption font-semibold text-ink">
                            {t("blogPlans.seriesPublishMode")}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {["DRAFT", "REVIEW", "AUTO"].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() =>
                                        setForm({ ...form, publishMode: mode })
                                    }
                                    className={`rounded-xl border px-3 py-2 text-left text-caption ${form.publishMode === mode ? "border-accent bg-accent-soft text-accent" : "border-border text-ink-secondary"}`}
                                >
                                    {t(
                                        `blogPlans.seriesMode${mode === "DRAFT" ? "Draft" : mode === "REVIEW" ? "Review" : "Auto"}`,
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <PlanPlatformPicker
                        value={form.platforms}
                        onChange={(platforms) =>
                            setForm({ ...form, platforms })
                        }
                    />
                </fieldset>
                {draft && (
                    <div className="space-y-3">
                        <p className="text-sm text-ink-secondary">
                            {t("blogPlans.dailyDraftHint")}
                        </p>
                        <div className="max-h-72 space-y-2 overflow-y-auto">
                            {draft.topics.map((topic, index) => (
                                <FormField
                                    key={index}
                                    label={t("blogPlans.dailyTopic", {
                                        day: index + 1,
                                    })}
                                >
                                    <input
                                        className={formInputCls}
                                        value={topic}
                                        maxLength={500}
                                        disabled={generating}
                                        onChange={(event) =>
                                            setDraft((current) => ({
                                                ...current,
                                                topics: current.topics.map(
                                                    (value, i) =>
                                                        i === index
                                                            ? event.target.value
                                                            : value,
                                                ),
                                            }))
                                        }
                                    />
                                </FormField>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            disabled={generating}
                            onClick={() => {
                                setDraft(null);
                                setError("");
                            }}
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                )}

                {createdPlans.length > 0 && (
                    <div className="rounded-xl border border-border bg-surface p-4">
                        <div className="text-xs font-bold text-ink">
                            {t("blogPlans.generatedPlans", {
                                count: createdPlans.length,
                            })}
                        </div>
                        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                            {createdPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="flex min-w-0 items-center gap-2 text-sm"
                                >
                                    <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
                                    <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-bold text-accent">
                                        {formatFireTime(plan)}
                                    </span>
                                    <span className="min-w-0 truncate text-ink">
                                        {plan.topic}
                                    </span>
                                    <span className="ml-auto shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                        {t("blogPlans.oneShot")}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-xs text-ink-faint">
                            {t("blogPlans.oneShotHint")}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PlanAiGenerateModal;
