import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CalendarClock,
    LayoutTemplate,
    Loader2,
    Mail,
    X,
} from 'lucide-react';
import CustomSelect from '@components/common/CustomSelect';
import { useToast } from '@hooks/useToast';
import { emailReminderService } from '../services/emailReminderService';
import {
    HTML_STARTERS,
    TEMPLATE_IDS,
    TEMPLATE_NONE,
    TEMPLATE_SWATCH,
    buildReminderPreviewHtml,
    resolveContentType,
} from '../utils/emailReminderTemplates';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREVIEW_MIN_HEIGHT = 240;
const PREVIEW_MAX_HEIGHT = 720;

const measureIframeDocumentHeight = (iframe) => {
    try {
        const doc = iframe?.contentDocument;
        if (!doc) return PREVIEW_MIN_HEIGHT;
        const body = doc.body;
        const html = doc.documentElement;
        const height = Math.max(
            body?.scrollHeight || 0,
            body?.offsetHeight || 0,
            html?.scrollHeight || 0,
            html?.offsetHeight || 0,
        );
        return Math.min(Math.max(height + 4, PREVIEW_MIN_HEIGHT), PREVIEW_MAX_HEIGHT * 3);
    } catch {
        return PREVIEW_MIN_HEIGHT;
    }
};

export const TIMEZONE_OPTIONS = [
    { value: 'Asia/Shanghai', label: '(GMT+08:00) 北京, 上海, 香港', offset: '+08:00' },
    { value: 'Asia/Tokyo', label: '(GMT+09:00) 东京', offset: '+09:00' },
    { value: 'Asia/Singapore', label: '(GMT+08:00) 新加坡', offset: '+08:00' },
    { value: 'Asia/Seoul', label: '(GMT+09:00) 首尔', offset: '+09:00' },
    { value: 'UTC', label: '(GMT+00:00) UTC', offset: '+00:00' },
    { value: 'Europe/London', label: '(GMT+00:00) 伦敦', offset: '+00:00' },
    { value: 'Europe/Paris', label: '(GMT+01:00) 巴黎', offset: '+01:00' },
    { value: 'America/New_York', label: '(GMT-05:00) 纽约', offset: '-05:00' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) 洛杉矶', offset: '-08:00' },
    { value: 'Australia/Sydney', label: '(GMT+10:00) 悉尼', offset: '+10:00' },
];

const FREQUENCIES = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'];

const createClientRequestId = () => (
    globalThis.crypto?.randomUUID?.()
    || `email-reminder-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const toDateTimeLocalValue = (date) => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60_000));
    return localDate.toISOString().slice(0, 16);
};

const pad2 = (value) => String(value).padStart(2, '0');

const getZoneOffsetLabel = (timeZone, date = new Date()) => {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            timeZoneName: 'shortOffset',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).formatToParts(date);
        const offset = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT';
        return offset.replace('GMT', 'GMT');
    } catch {
        return 'GMT';
    }
};

const wallTimeToOffsetDateTime = (dateValue, timeValue, timeZone) => {
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hour, minute] = timeValue.split(':').map(Number);
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    const asParts = (ms) => {
        const parts = formatter.formatToParts(new Date(ms));
        const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        return Date.UTC(
            Number(map.year),
            Number(map.month) - 1,
            Number(map.day),
            Number(map.hour === '24' ? '0' : map.hour),
            Number(map.minute),
            Number(map.second),
        );
    };
    let utc = utcGuess;
    for (let i = 0; i < 3; i += 1) {
        const localAsUtc = asParts(utc);
        const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
        const diff = desired - localAsUtc;
        if (diff === 0) break;
        utc += diff;
    }
    const offsetMinutes = Math.round((asParts(utc) - utc) / 60000);
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const offset = `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
    return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00${offset}`;
};

const openDateTimePicker = (event) => {
    const input = event.currentTarget;
    if (typeof input.showPicker !== 'function') return;
    try {
        input.showPicker();
    } catch {
        // Some browsers only allow showPicker from direct user gestures.
    }
};

const createInitialForm = () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    return {
        recipientEmail: '',
        subject: '',
        message: '',
        templateId: TEMPLATE_NONE,
        frequency: 'ONCE',
        timezone: 'Asia/Shanghai',
        scheduledLocal: toDateTimeLocalValue(future),
        sendTime: `${pad2(future.getHours())}:${pad2(future.getMinutes())}`,
        recurrenceDay: 1,
        intervalDays: 3,
    };
};

const EmailReminderCreateModal = ({ isOpen, onClose, onCreated }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [form, setForm] = useState(createInitialForm);
    const [isCreating, setIsCreating] = useState(false);
    const [clientRequestId] = useState(createClientRequestId);
    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
    const [previewHeight, setPreviewHeight] = useState(PREVIEW_MIN_HEIGHT);
    const previewFrameRef = useRef(null);


    const weekdayOptions = useMemo(() => (
        [1, 2, 3, 4, 5, 6, 7].map((day) => ({
            value: String(day),
            label: t(`profile.emailReminders.weekdays.${day}`),
        }))
    ), [t]);

    const monthDayOptions = useMemo(() => (
        Array.from({ length: 31 }, (_, index) => {
            const day = index + 1;
            return { value: String(day), label: t('profile.emailReminders.monthDay', { day }) };
        })
    ), [t]);

    const timezoneOptions = useMemo(() => (
        TIMEZONE_OPTIONS.map((item) => ({
            value: item.value,
            label: item.label.includes('GMT')
                ? item.label
                : `(${getZoneOffsetLabel(item.value)}) ${item.label}`,
        }))
    ), []);

    const scheduleLabel = useMemo(() => {
        const { frequency, scheduledLocal, sendTime, recurrenceDay, intervalDays } = form;
        if (frequency === 'ONCE') {
            return scheduledLocal?.replace('T', ' ') || '—';
        }
        if (frequency === 'DAILY') {
            return t('profile.emailReminders.scheduleDaily', { time: sendTime });
        }
        if (frequency === 'WEEKLY') {
            return t('profile.emailReminders.scheduleWeekly', {
                weekday: t(`profile.emailReminders.weekdays.${recurrenceDay}`),
                time: sendTime,
            });
        }
        if (frequency === 'MONTHLY') {
            return t('profile.emailReminders.scheduleMonthly', {
                day: recurrenceDay,
                time: sendTime,
            });
        }
        return t('profile.emailReminders.scheduleCustom', {
            days: intervalDays,
            time: sendTime,
        });
    }, [form, t]);

    const previewHtml = useMemo(() => buildReminderPreviewHtml({
        subject: form.subject || t('profile.emailReminders.previewSubject'),
        message: form.message || t('profile.emailReminders.previewMessage'),
        templateId: form.templateId,
        scheduledLabel: scheduleLabel,
        timezone: form.timezone,
    }), [form.message, form.subject, form.templateId, form.timezone, scheduleLabel, t]);

    const usesLayoutTemplate = form.templateId && form.templateId !== TEMPLATE_NONE;

    const syncPreviewHeight = () => {
        const nextHeight = measureIframeDocumentHeight(previewFrameRef.current);
        setPreviewHeight(nextHeight);
    };

    useEffect(() => {
        setPreviewHeight(PREVIEW_MIN_HEIGHT);
        const timer = window.setTimeout(syncPreviewHeight, 60);
        return () => window.clearTimeout(timer);
    }, [previewHtml]);

    const templateCards = useMemo(() => (
        TEMPLATE_IDS.map((templateId) => ({
            id: templateId,
            previewHtml: buildReminderPreviewHtml({
                subject: form.subject || t('profile.emailReminders.previewSubject'),
                message: HTML_STARTERS[templateId],
                templateId,
                scheduledLabel: scheduleLabel,
                timezone: form.timezone,
            }),
        }))
    ), [form.subject, form.timezone, scheduleLabel, t]);

    if (!isOpen) return null;

    const updateField = (field) => (event) => {
        const { value } = event.target;
        setForm((current) => ({ ...current, [field]: value }));
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

    const handleClose = () => {
        if (isCreating) return;
        setIsTemplatePickerOpen(false);
        onClose();
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        const recipientEmail = form.recipientEmail.trim();
        const subject = form.subject.trim();
        const message = form.message.trim();
        const frequency = form.frequency;

        if (!recipientEmail || !subject || !message) {
            toast.warning(t('profile.emailReminders.fieldsRequired'));
            return;
        }
        if (!EMAIL_PATTERN.test(recipientEmail)) {
            toast.warning(t('profile.emailReminders.invalidEmail'));
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

        if (frequency === 'ONCE') {
            if (!form.scheduledLocal) {
                toast.warning(t('profile.emailReminders.futureTimeRequired'));
                return;
            }
            const [datePart, timePart] = form.scheduledLocal.split('T');
            payload.scheduledAt = wallTimeToOffsetDateTime(datePart, timePart, form.timezone);
            const scheduledMs = Date.parse(payload.scheduledAt);
            if (Number.isNaN(scheduledMs) || scheduledMs <= Date.now()) {
                toast.warning(t('profile.emailReminders.futureTimeRequired'));
                return;
            }
        } else {
            if (!form.sendTime) {
                toast.warning(t('profile.emailReminders.sendTimeRequired'));
                return;
            }
            payload.sendTime = form.sendTime;
            if (frequency === 'WEEKLY' || frequency === 'MONTHLY') {
                payload.recurrenceDay = Number(form.recurrenceDay);
            }
            if (frequency === 'CUSTOM') {
                const days = Number(form.intervalDays);
                if (!Number.isInteger(days) || days < 1 || days > 365) {
                    toast.warning(t('profile.emailReminders.intervalDaysInvalid'));
                    return;
                }
                payload.intervalDays = days;
            }
        }

        setIsCreating(true);
        try {
            await emailReminderService.create(payload);
            toast.success(t('profile.emailReminders.created'));
            setForm(createInitialForm());
            onCreated?.();
            onClose();
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/45 p-3 backdrop-blur-[1px] sm:p-6">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="email-reminder-create-title"
                className="flex max-h-[min(900px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                            <CalendarClock className="h-4 w-4" />
                        </span>
                        <h2 id="email-reminder-create-title" className="text-sm font-black text-slate-800">
                            {t('profile.emailReminders.addTitle')}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label={t('common.aria.close', 'Close')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleCreate}>
                    <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.75fr)]">
                        <div className="space-y-5 p-5">
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-slate-700">
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">1</span>
                                    {t('profile.emailReminders.sectionRecipient')}
                                </h3>
                                <label className="block">
                                    <span className="mb-1 block text-[10px] font-bold text-slate-500">
                                        {t('profile.emailReminders.recipientEmail')}
                                    </span>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={form.recipientEmail}
                                            onChange={updateField('recipientEmail')}
                                            placeholder={t('profile.emailReminders.recipientPlaceholder')}
                                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                        <Mail className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </label>
                            </section>

                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-slate-700">
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">2</span>
                                    {t('profile.emailReminders.sectionContent')}
                                </h3>
                                <div className="space-y-3">
                                    <label className="block">
                                        <span className="mb-1 block text-[10px] font-bold text-slate-500">
                                            {t('profile.emailReminders.subject')}
                                            <span className="ml-0.5 text-rose-500">*</span>
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            maxLength={160}
                                            value={form.subject}
                                            onChange={updateField('subject')}
                                            placeholder={t('profile.emailReminders.subjectPlaceholder')}
                                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </label>

                                    <div>
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-bold text-slate-500">
                                                {t('profile.emailReminders.message')}
                                                <span className="ml-0.5 text-rose-500">*</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsTemplatePickerOpen(true)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-primary/40 hover:text-primary"
                                                >
                                                    <LayoutTemplate className="h-3 w-3" />
                                                    {t('profile.emailReminders.selectTemplate')}
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            required
                                            rows={7}
                                            maxLength={10000}
                                            value={form.message}
                                            onChange={updateField('message')}
                                            placeholder={t('profile.emailReminders.messagePlaceholder')}
                                            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-medium leading-5 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                        <p className="mt-1.5 text-[10px] font-medium leading-4 text-slate-400">
                                            {usesLayoutTemplate
                                                ? t('profile.emailReminders.htmlContentHint', {
                                                    template: t(`profile.emailReminders.templates.${form.templateId}`),
                                                })
                                                : t('profile.emailReminders.messageInputHint')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-slate-700">
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">3</span>
                                    {t('profile.emailReminders.sectionSchedule')}
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                        {(form.frequency === 'WEEKLY' || form.frequency === 'MONTHLY') ? (
                                            <label className="block w-full shrink-0 sm:w-[7.5rem]">
                                                <span className="mb-1 block text-[10px] font-bold text-slate-500">
                                                    {form.frequency === 'WEEKLY'
                                                        ? t('profile.emailReminders.weekday')
                                                        : t('profile.emailReminders.monthDayLabel')}
                                                </span>
                                                <CustomSelect
                                                    size="sm"
                                                    options={form.frequency === 'WEEKLY' ? weekdayOptions : monthDayOptions}
                                                    value={String(form.recurrenceDay)}
                                                    onChange={(value) => setForm((current) => ({
                                                        ...current,
                                                        recurrenceDay: Number(value),
                                                    }))}
                                                />
                                            </label>
                                        ) : null}

                                        {form.frequency === 'CUSTOM' ? (
                                            <label className="block w-full shrink-0 sm:w-[7.5rem]">
                                                <span className="mb-1 block text-[10px] font-bold text-slate-500">
                                                    {t('profile.emailReminders.intervalDays')}
                                                </span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={365}
                                                    value={form.intervalDays}
                                                    onChange={updateField('intervalDays')}
                                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                />
                                            </label>
                                        ) : null}

                                        <label className={`block w-full shrink-0 ${form.frequency === 'ONCE' ? 'sm:w-[14.5rem]' : 'sm:w-[8.5rem]'}`}>
                                            <span className="mb-1 block text-[10px] font-bold text-slate-500">
                                                {form.frequency === 'ONCE'
                                                    ? t('profile.emailReminders.scheduledAt')
                                                    : t('profile.emailReminders.sendTime')}
                                            </span>
                                            {form.frequency === 'ONCE' ? (
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={form.scheduledLocal}
                                                    onChange={updateField('scheduledLocal')}
                                                    onClick={openDateTimePicker}
                                                    className="relative h-9 w-full min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                                />
                                            ) : (
                                                <input
                                                    type="time"
                                                    required
                                                    value={form.sendTime}
                                                    onChange={updateField('sendTime')}
                                                    onClick={openDateTimePicker}
                                                    className="relative h-9 w-full min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                                />
                                            )}
                                        </label>

                                        <label className="block min-w-0 flex-1">
                                            <span className="mb-1 block text-[10px] font-bold text-slate-500">
                                                {t('profile.emailReminders.timezone')}
                                            </span>
                                            <CustomSelect
                                                size="sm"
                                                options={timezoneOptions}
                                                value={form.timezone}
                                                onChange={(value) => setForm((current) => ({ ...current, timezone: value }))}
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                                            {t('profile.emailReminders.frequency')}
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {FREQUENCIES.map((item) => {
                                                const active = form.frequency === item;
                                                return (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => setFrequency(item)}
                                                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                                                            active
                                                                ? 'border-primary bg-primary text-white'
                                                                : 'border-slate-200 bg-white text-slate-500 hover:border-primary/30 hover:text-primary'
                                                        }`}
                                                    >
                                                        {t(`profile.emailReminders.frequencies.${item.toLowerCase()}`)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-4 border-t border-slate-100 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <h4 className="text-xs font-black text-slate-800">
                                    {t('profile.emailReminders.overviewTitle')}
                                </h4>
                                <dl className="mt-3 space-y-2 text-[11px]">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-400">{t('profile.emailReminders.recipientEmail')}</dt>
                                        <dd className="max-w-[60%] truncate font-semibold text-slate-700">
                                            {form.recipientEmail || t('profile.emailReminders.notSet')}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-400">{t('profile.emailReminders.scheduledAt')}</dt>
                                        <dd className="max-w-[60%] text-right font-semibold text-slate-700">
                                            {scheduleLabel}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-400">{t('profile.emailReminders.frequency')}</dt>
                                        <dd className="font-semibold text-slate-700">
                                            {t(`profile.emailReminders.frequencies.${form.frequency.toLowerCase()}`)}
                                        </dd>
                                    </div>
                                    {usesLayoutTemplate ? (
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-slate-400">{t('profile.emailReminders.template')}</dt>
                                            <dd className="font-semibold text-slate-700">
                                                {t(`profile.emailReminders.templates.${form.templateId}`)}
                                            </dd>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-slate-400">{t('profile.emailReminders.timezone')}</dt>
                                        <dd className="max-w-[60%] truncate text-right font-semibold text-slate-700">
                                            {form.timezone}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                                    <span className="text-xs font-black text-slate-800">
                                        {t('profile.emailReminders.previewTitle')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {usesLayoutTemplate
                                            ? t(`profile.emailReminders.templates.${form.templateId}`)
                                            : t('profile.emailReminders.customPreviewBadge')}
                                    </span>
                                </div>
                                <div className="bg-slate-100/80 p-2">
                                    <div className="max-h-[min(560px,52vh)] overflow-y-auto rounded-lg border border-slate-200 bg-white">
                                        <iframe
                                            ref={previewFrameRef}
                                            title={t('profile.emailReminders.previewTitle')}
                                            srcDoc={previewHtml}
                                            sandbox="allow-same-origin"
                                            onLoad={syncPreviewHeight}
                                            className="block w-full border-0 bg-white"
                                            style={{ height: `${previewHeight}px` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isCreating}
                            className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            {t('profile.emailReminders.cancelDelete')}
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-white shadow-sm shadow-primary/20 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isCreating
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <CalendarClock className="h-3.5 w-3.5" />}
                            {isCreating
                                ? t('profile.emailReminders.creating')
                                : t('profile.emailReminders.createAndSave')}
                        </button>
                    </footer>
                </form>
            </div>

            {isTemplatePickerOpen ? (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/45 p-3 sm:p-6">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="email-template-picker-title"
                        className="flex max-h-[min(640px,88vh)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <div>
                                <h3 id="email-template-picker-title" className="text-sm font-black text-slate-800">
                                    {t('profile.emailReminders.templatePickerTitle')}
                                </h3>
                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                    {t('profile.emailReminders.templatePickerHint')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsTemplatePickerOpen(false)}
                                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label={t('common.aria.close', 'Close')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </header>
                        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-4">
                            <div className="flex min-w-max gap-3 lg:min-w-0 lg:w-full">
                                {templateCards.map((card) => (
                                    <button
                                        key={card.id}
                                        type="button"
                                        onClick={() => applyTemplate(card.id)}
                                        className={`w-[220px] shrink-0 overflow-hidden rounded-xl border text-left transition hover:border-primary/40 hover:shadow-md lg:w-0 lg:min-w-0 lg:flex-1 ${
                                            form.templateId === card.id
                                                ? 'border-primary ring-1 ring-primary/20'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span className={`h-2 w-8 shrink-0 rounded-full bg-gradient-to-r ${TEMPLATE_SWATCH[card.id]}`} />
                                                <span className="truncate text-[11px] font-black text-slate-700">
                                                    {t(`profile.emailReminders.templates.${card.id}`)}
                                                </span>
                                            </div>
                                            <span className="shrink-0 text-[10px] font-bold text-primary">
                                                {t('profile.emailReminders.useThisTemplate')}
                                            </span>
                                        </div>
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                            <iframe
                                                title={t(`profile.emailReminders.templates.${card.id}`)}
                                                srcDoc={card.previewHtml}
                                                sandbox=""
                                                scrolling="no"
                                                tabIndex={-1}
                                                className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                                                style={{
                                                    width: '250%',
                                                    height: '250%',
                                                    transform: 'scale(0.4)',
                                                }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default EmailReminderCreateModal;
