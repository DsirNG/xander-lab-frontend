import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import Modal from "@shared/ui/overlays/Modal";
import Button from "@shared/ui/primitives/Button";
import TimezoneSelect from "@shared/ui/forms/TimezoneSelect";
import TimeInput from "@shared/ui/forms/TimeInput";
import FormField from "@shared/ui/forms/FormField";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import { blogPlanService } from "../../services/blogPlanService";
import { useToast } from "@shared/hooks/useToast";
import { listKnowledgeMaterials } from "@features/knowledge";
import PlanFormFields from "./PlanFormFields";
import PlanFormSummary from "./PlanFormSummary";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const tomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
};

const initialForm = () => ({
    topic: "",
    scheduleType: "DAILY",
    scheduledDate: tomorrow(),
    timezone: "Asia/Shanghai",
    triggerTime: "09:00",
    syncCsdn: false,
    syncJuejin: false,
    audience: "",
    tone: "",
    aiOption: "DEEP",
    knowledgeMaterialId: "",
    autoPublish: true,
});

const nextRunParts = (
    triggerTime,
    timezone,
    locale,
    scheduleType,
    scheduledDate,
) => {
    try {
        if (scheduleType !== "DAILY" && scheduledDate) {
            const date = new Date(`${scheduledDate}T00:00:00Z`);
            return {
                date: scheduledDate.replaceAll("-", "/"),
                weekday: new Intl.DateTimeFormat(locale, {
                    weekday: "short",
                    timeZone: "UTC",
                }).format(date),
            };
        }
        const parts = Object.fromEntries(
            new Intl.DateTimeFormat("en-CA", {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
            })
                .formatToParts(new Date())
                .map(({ type, value }) => [type, value]),
        );
        const today = Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
        );
        const nextDay =
            `${parts.hour}:${parts.minute}` < triggerTime
                ? today
                : today + 86_400_000;
        const date = new Date(nextDay);
        return {
            date: `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`,
            weekday: new Intl.DateTimeFormat(locale, {
                weekday: "short",
                timeZone: "UTC",
            }).format(date),
        };
    } catch {
        return { date: "—", weekday: "" };
    }
};

/** 自定义计划：单主题 + 每日单触发时间。 */
const PlanFormModal = ({ isOpen, plan, onClose, onSaved }) => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [form, setForm] = useState(initialForm());
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [knowledgeMaterials, setKnowledgeMaterials] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        setForm(
            plan?.id
                ? {
                      topic: plan.topic || "",
                      scheduleType:
                          plan.scheduleType ||
                          (plan.runOnce ? "ONCE" : "DAILY"),
                      scheduledDate: plan.scheduledDate || tomorrow(),
                      timezone: plan.timezone || "Asia/Shanghai",
                      triggerTime:
                          plan.triggerTime || plan.triggerTimes?.[0] || "09:00",
                      syncCsdn: !!plan.syncCsdn,
                      syncJuejin: !!plan.syncJuejin,
                      audience: plan.audience || "",
                      tone: plan.tone || "",
                      aiOption: plan.aiOption || "DEEP",
                      knowledgeMaterialId: plan.knowledgeMaterialId
                          ? String(plan.knowledgeMaterialId)
                          : "",
                      autoPublish: plan.autoPublish !== false,
                  }
                : initialForm(),
        );
        setError("");
        listKnowledgeMaterials({ archive: "ACTIVE" }, { _silent: true })
            .then((items) =>
                setKnowledgeMaterials(Array.isArray(items) ? items : []),
            )
            .catch(() => setKnowledgeMaterials([]));
    }, [isOpen, plan]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        if (error) setError("");
    };

    const submit = async () => {
        if (!form.topic.trim()) {
            setError(t("blogPlans.topicRequired"));
            return;
        }
        if (!TIME_RE.test(form.triggerTime)) {
            setError(t("blogPlans.timeInvalid"));
            return;
        }
        if (form.scheduleType !== "DAILY" && !form.scheduledDate) {
            setError(t("blogPlans.executionDate"));
            return;
        }

        setSaving(true);
        setError("");
        try {
            const payload = {
                topic: form.topic.trim(),
                scheduleType: form.scheduleType,
                scheduledDate:
                    form.scheduleType === "DAILY" ? null : form.scheduledDate,
                timezone: form.timezone,
                triggerTime: form.triggerTime,
                syncCsdn: form.syncCsdn,
                syncJuejin: form.syncJuejin,
                audience: form.audience.trim(),
                tone: form.tone.trim(),
                aiOption: form.aiOption,
                knowledgeMaterialId: form.knowledgeMaterialId
                    ? Number(form.knowledgeMaterialId)
                    : null,
                autoPublish: form.autoPublish,
            };
            if (plan?.id) {
                await blogPlanService.updatePlan(plan.id, payload);
                toast.success(t("blogPlans.updated"));
            } else {
                await blogPlanService.createPlan(payload);
                toast.success(t("blogPlans.created"));
            }
            onClose();
            await onSaved?.();
        } catch (e) {
            toast.error(
                e?.response?.data?.message || t("blogPlans.saveFailed"),
            );
        } finally {
            setSaving(false);
        }
    };

    const footer = (
        <>
            <Button onClick={onClose} disabled={saving} variant="outline">
                {t("common.cancel")}
            </Button>
            <Button onClick={submit} loading={saving} variant="primary">
                {t("common.save")}
            </Button>
        </>
    );

    const nextRun = nextRunParts(
        form.triggerTime,
        form.timezone,
        i18n.resolvedLanguage,
        form.scheduleType,
        form.scheduledDate,
    );
    const planTypes = [
        ["ONCE", "typeOnce", "typeOnceHint"],
        ["DAILY", "typeDaily", "typeDailyHint"],
        ["WEEKLY", "typeWeekly", "typeWeeklyHint"],
    ];
    const aiOptions = [
        ["DEEP", "aiDeep", "aiDeepHint"],
        ["PRACTICAL", "aiPractical", "aiPracticalHint"],
        ["NEWS", "aiNews", "aiNewsHint"],
        ["OPINION", "aiOpinion", "aiOpinionHint"],
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                plan?.id
                    ? t("blogPlans.editTitle")
                    : t("blogPlans.createCustomTitle")
            }
            width="max-w-4xl"
            footer={footer}
            closeOnOutsideClick={!saving}
        >
            <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
                <PlanFormFields
                    t={t}
                    form={form}
                    updateForm={updateForm}
                    planTypes={planTypes}
                    aiOptions={aiOptions}
                    knowledgeMaterials={knowledgeMaterials}
                    error={error}
                    tomorrow={tomorrow}
                />

                <PlanFormSummary
                    t={t}
                    form={form}
                    nextRun={nextRun}
                    planTypes={planTypes}
                />
            </div>
        </Modal>
    );
};

export default PlanFormModal;
