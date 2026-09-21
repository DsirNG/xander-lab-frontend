import { useMemo, useState } from "react";
import { useToast } from "@shared/hooks/useToast";
import { emailReminderService } from "../services/emailReminderService";
import {
    HTML_STARTERS,
    TEMPLATE_IDS,
    TEMPLATE_NONE,
    buildReminderPreviewHtml,
    resolveContentType,
} from "../utils/emailReminderTemplates";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createClientRequestId = () =>
    globalThis.crypto?.randomUUID?.() ||
    `email-reminder-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toDateTimeLocalValue = (date) => {
    const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60_000,
    );
    return localDate.toISOString().slice(0, 16);
};

const pad2 = (value) => String(value).padStart(2, "0");

const wallTimeToOffsetDateTime = (dateValue, timeValue, timeZone) => {
    const [year, month, day] = dateValue.split("-").map(Number);
    const [hour, minute] = timeValue.split(":").map(Number);
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    const asParts = (ms) => {
        const parts = formatter.formatToParts(new Date(ms));
        const map = Object.fromEntries(
            parts.map((part) => [part.type, part.value]),
        );
        return Date.UTC(
            Number(map.year),
            Number(map.month) - 1,
            Number(map.day),
            Number(map.hour === "24" ? "0" : map.hour),
            Number(map.minute),
            Number(map.second),
        );
    };
    let utc = utcGuess;
    for (let index = 0; index < 3; index += 1) {
        const diff =
            Date.UTC(year, month - 1, day, hour, minute, 0) - asParts(utc);
        if (diff === 0) break;
        utc += diff;
    }
    const offsetMinutes = Math.round((asParts(utc) - utc) / 60000);
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteOffset = Math.abs(offsetMinutes);
    const offset = `${sign}${pad2(Math.floor(absoluteOffset / 60))}:${pad2(absoluteOffset % 60)}`;
    return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00${offset}`;
};

const createInitialForm = () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    return {
        recipientEmail: "",
        subject: "",
        message: "",
        templateId: TEMPLATE_NONE,
        frequency: "ONCE",
        timezone: "Asia/Shanghai",
        scheduledLocal: toDateTimeLocalValue(future),
        sendTime: `${pad2(future.getHours())}:${pad2(future.getMinutes())}`,
        recurrenceDay: 1,
        intervalDays: 3,
    };
};

export default function useEmailReminderForm({ onClose, onCreated, t }) {
    const toast = useToast();
    const [form, setForm] = useState(createInitialForm);
    const [isCreating, setIsCreating] = useState(false);
    const [clientRequestId] = useState(createClientRequestId);
    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

    const weekdayOptions = useMemo(
        () =>
            [1, 2, 3, 4, 5, 6, 7].map((day) => ({
                value: String(day),
                label: t(`profile.emailReminders.weekdays.${day}`),
            })),
        [t],
    );

    const monthDayOptions = useMemo(
        () =>
            Array.from({ length: 31 }, (_, index) => {
                const day = index + 1;
                return {
                    value: String(day),
                    label: t("profile.emailReminders.monthDay", { day }),
                };
            }),
        [t],
    );

    const scheduleLabel = useMemo(() => {
        const {
            frequency,
            scheduledLocal,
            sendTime,
            recurrenceDay,
            intervalDays,
        } = form;
        if (frequency === "ONCE")
            return scheduledLocal?.replace("T", " ") || "—";
        if (frequency === "DAILY") {
            return t("profile.emailReminders.scheduleDaily", {
                time: sendTime,
            });
        }
        if (frequency === "WEEKLY") {
            return t("profile.emailReminders.scheduleWeekly", {
                weekday: t(`profile.emailReminders.weekdays.${recurrenceDay}`),
                time: sendTime,
            });
        }
        if (frequency === "MONTHLY") {
            return t("profile.emailReminders.scheduleMonthly", {
                day: recurrenceDay,
                time: sendTime,
            });
        }
        return t("profile.emailReminders.scheduleCustom", {
            days: intervalDays,
            time: sendTime,
        });
    }, [form, t]);

    const previewHtml = useMemo(
        () =>
            buildReminderPreviewHtml({
                subject:
                    form.subject || t("profile.emailReminders.previewSubject"),
                message:
                    form.message || t("profile.emailReminders.previewMessage"),
                templateId: form.templateId,
                scheduledLabel: scheduleLabel,
                timezone: form.timezone,
            }),
        [
            form.message,
            form.subject,
            form.templateId,
            form.timezone,
            scheduleLabel,
            t,
        ],
    );

    const templateCards = useMemo(
        () =>
            TEMPLATE_IDS.map((templateId) => ({
                id: templateId,
                previewHtml: buildReminderPreviewHtml({
                    subject:
                        form.subject ||
                        t("profile.emailReminders.previewSubject"),
                    message: HTML_STARTERS[templateId],
                    templateId,
                    scheduledLabel: scheduleLabel,
                    timezone: form.timezone,
                }),
            })),
        [form.subject, form.timezone, scheduleLabel, t],
    );

    const usesLayoutTemplate = Boolean(
        form.templateId && form.templateId !== TEMPLATE_NONE,
    );

    const updateField = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const setFrequency = (frequency) => {
        setForm((current) => ({ ...current, frequency }));
    };

    const applyTemplate = (templateId) => {
        const starter = HTML_STARTERS[templateId];
        if (!starter) return;
        setForm((current) => ({
            ...current,
            templateId,
            message: starter,
            subject: current.subject.trim()
                ? current.subject
                : t(`profile.emailReminders.templateSubjects.${templateId}`),
        }));
        setIsTemplatePickerOpen(false);
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        const recipientEmail = form.recipientEmail.trim();
        const subject = form.subject.trim();
        const message = form.message.trim();
        const frequency = form.frequency;

        if (!recipientEmail || !subject || !message) {
            toast.warning(t("profile.emailReminders.fieldsRequired"));
            return;
        }
        if (!EMAIL_PATTERN.test(recipientEmail)) {
            toast.warning(t("profile.emailReminders.invalidEmail"));
            return;
        }

        const payload = {
            clientRequestId,
            recipientEmail,
            subject,
            message,
            contentType: resolveContentType(message, form.templateId),
            templateId: form.templateId || TEMPLATE_NONE,
            frequency,
            timezone: form.timezone,
        };

        if (frequency === "ONCE") {
            if (!form.scheduledLocal) {
                toast.warning(t("profile.emailReminders.futureTimeRequired"));
                return;
            }
            const [datePart, timePart] = form.scheduledLocal.split("T");
            payload.scheduledAt = wallTimeToOffsetDateTime(
                datePart,
                timePart,
                form.timezone,
            );
            const scheduledMs = Date.parse(payload.scheduledAt);
            if (Number.isNaN(scheduledMs) || scheduledMs <= Date.now()) {
                toast.warning(t("profile.emailReminders.futureTimeRequired"));
                return;
            }
        } else {
            if (!form.sendTime) {
                toast.warning(t("profile.emailReminders.sendTimeRequired"));
                return;
            }
            payload.sendTime = form.sendTime;
            if (frequency === "WEEKLY" || frequency === "MONTHLY") {
                payload.recurrenceDay = Number(form.recurrenceDay);
            }
            if (frequency === "CUSTOM") {
                const days = Number(form.intervalDays);
                if (!Number.isInteger(days) || days < 1 || days > 365) {
                    toast.warning(
                        t("profile.emailReminders.intervalDaysInvalid"),
                    );
                    return;
                }
                payload.intervalDays = days;
            }
        }

        setIsCreating(true);
        try {
            await emailReminderService.create(payload);
            toast.success(t("profile.emailReminders.created"));
            setForm(createInitialForm());
            onCreated?.();
            onClose();
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setIsCreating(false);
        }
    };

    return {
        form,
        isCreating,
        isTemplatePickerOpen,
        weekdayOptions,
        monthDayOptions,
        scheduleLabel,
        previewHtml,
        templateCards,
        usesLayoutTemplate,
        setForm,
        setIsTemplatePickerOpen,
        updateField,
        setFrequency,
        applyTemplate,
        handleCreate,
    };
}
