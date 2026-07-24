import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    CirclePause,
    Clock3,
    Loader2,
    Mail,
    Play,
    Plus,
    RefreshCw,
    Send,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import Modal from '@components/common/Modal';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useToast } from '@hooks/useToast';
import { emailReminderService } from '../services/emailReminderService';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_STYLES = {
    PENDING: {
        icon: Clock3,
        badge: 'border-sky-200 bg-sky-50 text-sky-700',
        dot: 'bg-sky-500',
    },
    PAUSED: {
        icon: CirclePause,
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
    },
    SENDING: {
        icon: Send,
        badge: 'border-violet-200 bg-violet-50 text-violet-700',
        dot: 'bg-violet-500',
    },
    SENT: {
        icon: CheckCircle2,
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
    },
    FAILED: {
        icon: AlertCircle,
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
        dot: 'bg-rose-500',
    },
};

const normalizeStatus = (status) => {
    const normalized = String(status || 'PENDING').toUpperCase();
    if (normalized === 'SCHEDULED' || normalized === 'ACTIVE') return 'PENDING';
    if (normalized === 'PROCESSING') return 'SENDING';
    return STATUS_STYLES[normalized] ? normalized : 'PENDING';
};

const createClientRequestId = () => (
    globalThis.crypto?.randomUUID?.()
    || `email-reminder-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const toDateTimeLocalValue = (date) => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60_000));
    return localDate.toISOString().slice(0, 16);
};

const toOffsetDateTimeValue = (localValue, date) => {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteOffset = Math.abs(offsetMinutes);
    const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0');
    const offsetRemainder = String(absoluteOffset % 60).padStart(2, '0');
    return `${localValue}:00${sign}${offsetHours}:${offsetRemainder}`;
};

const createInitialForm = () => ({
    recipientEmail: '',
    scheduledAt: toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)),
    subject: '',
    message: '',
});

const getReminderList = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.records)) return result.records;
    if (Array.isArray(result?.content)) return result.content;
    return [];
};

const ProfileCenterModal = ({ isOpen, onClose, userInfo }) => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [reminders, setReminders] = useState([]);
    const [form, setForm] = useState(createInitialForm);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [actionKey, setActionKey] = useState('');
    const [loadError, setLoadError] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const clientRequestIdRef = useRef(createClientRequestId());

    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }), [i18n.language]);

    const formatDate = useCallback((value) => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date);
    }, [dateFormatter]);

    const loadReminders = useCallback(async ({ signal, showLoading = true } = {}) => {
        if (showLoading) setIsLoading(true);
        setLoadError('');
        try {
            const result = await emailReminderService.list({ signal, _silent: true });
            setReminders(getReminderList(result));
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
            setLoadError(error.message || t('profile.emailReminders.loadError'));
        } finally {
            if (!signal?.aborted && showLoading) setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const controller = new AbortController();
        loadReminders({ signal: controller.signal });
        return () => controller.abort();
    }, [isOpen, loadReminders]);

    useEffect(() => {
        if (!isOpen) {
            setPendingDeleteId(null);
            setActionKey('');
        }
    }, [isOpen]);

    const updateField = (field) => (event) => {
        const { value } = event.target;
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        const recipientEmail = form.recipientEmail.trim();
        const subject = form.subject.trim();
        const message = form.message.trim();
        const scheduledDate = new Date(form.scheduledAt);

        if (!recipientEmail || !subject || !message || !form.scheduledAt) {
            toast.warning(t('profile.emailReminders.fieldsRequired'));
            return;
        }
        if (!EMAIL_PATTERN.test(recipientEmail)) {
            toast.warning(t('profile.emailReminders.invalidEmail'));
            return;
        }
        if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
            toast.warning(t('profile.emailReminders.futureTimeRequired'));
            return;
        }

        setIsCreating(true);
        try {
            await emailReminderService.create({
                clientRequestId: clientRequestIdRef.current,
                recipientEmail,
                scheduledAt: toOffsetDateTimeValue(form.scheduledAt, scheduledDate),
                subject,
                message,
            });
            setForm(createInitialForm());
            clientRequestIdRef.current = createClientRequestId();
            await loadReminders({ showLoading: false });
            toast.success(t('profile.emailReminders.created'));
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setIsCreating(false);
        }
    };

    const handleStatusChange = async (reminder) => {
        const status = normalizeStatus(reminder.status);
        const nextStatus = status === 'PAUSED' ? 'PENDING' : 'PAUSED';
        const key = `status-${reminder.id}`;
        setActionKey(key);
        try {
            await emailReminderService.updateStatus(reminder.id, nextStatus);
            setReminders((current) => current.map((item) => (
                item.id === reminder.id ? { ...item, status: nextStatus } : item
            )));
            toast.success(t('profile.emailReminders.statusUpdated'));
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setActionKey('');
        }
    };

    const handleDelete = async (id) => {
        const key = `delete-${id}`;
        setActionKey(key);
        try {
            await emailReminderService.remove(id);
            setReminders((current) => current.filter((item) => item.id !== id));
            setPendingDeleteId(null);
            toast.success(t('profile.emailReminders.deleted'));
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setActionKey('');
        }
    };

    const displayName = userInfo?.nickname || userInfo?.username || t('profile.account');
    const accountEmail = userInfo?.email || userInfo?.account || '';
    const minScheduleTime = toDateTimeLocalValue(new Date(Date.now() + 60_000));

    const title = (
        <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
            </span>
            <div>
                <h2 id="modal-title" className="text-lg font-black tracking-tight text-slate-800">
                    {t('profile.title')}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                    {t('profile.subtitle')}
                </p>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            width="max-w-6xl"
            className="h-[min(840px,90vh)]"
        >
            <div className="flex min-h-full flex-col gap-5">
                <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-black uppercase text-white shadow-lg shadow-slate-900/15">
                            {displayName.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">{displayName}</p>
                            <p className="truncate text-xs font-medium text-slate-400">
                                {accountEmail || userInfo?.role || t('profile.account')}
                            </p>
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-bold text-primary sm:self-auto">
                        <Mail className="h-4 w-4" />
                        {t('profile.emailReminders.title')}
                    </div>
                </section>

                <div className="grid flex-1 gap-5 lg:min-h-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                    <section className="flex min-h-[360px] min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">
                                    {t('profile.emailReminders.taskList')}
                                </h3>
                                <p className="mt-1 text-xs font-medium text-slate-400">
                                    {t('profile.emailReminders.taskCount', { count: reminders.length })}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => loadReminders()}
                                disabled={isLoading}
                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:cursor-wait disabled:opacity-60"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                {t('profile.emailReminders.refresh')}
                            </button>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                            {isLoading ? (
                                <div className="flex min-h-[300px] items-center justify-center">
                                    <LoadingSpinner
                                        fullScreen={false}
                                        text={t('profile.emailReminders.loading')}
                                    />
                                </div>
                            ) : loadError ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-6 text-center">
                                    <AlertCircle className="mb-3 h-9 w-9 text-rose-400" />
                                    <p className="text-sm font-black text-rose-700">
                                        {t('profile.emailReminders.loadError')}
                                    </p>
                                    <p className="mt-1 max-w-sm text-xs font-medium text-rose-500">{loadError}</p>
                                    <button
                                        type="button"
                                        onClick={() => loadReminders()}
                                        className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
                                    >
                                        {t('profile.emailReminders.retry')}
                                    </button>
                                </div>
                            ) : reminders.length === 0 ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                                    <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-300 shadow-sm">
                                        <CalendarClock className="h-7 w-7" />
                                    </span>
                                    <p className="text-sm font-black text-slate-700">
                                        {t('profile.emailReminders.emptyTitle')}
                                    </p>
                                    <p className="mt-1 max-w-xs text-xs font-medium leading-5 text-slate-400">
                                        {t('profile.emailReminders.emptyHint')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {reminders.map((reminder) => {
                                        const status = normalizeStatus(reminder.status);
                                        const statusStyle = STATUS_STYLES[status];
                                        const StatusIcon = statusStyle.icon;
                                        const canToggle = status === 'PENDING' || status === 'PAUSED';
                                        const canDelete = status !== 'SENDING';
                                        const isStatusLoading = actionKey === `status-${reminder.id}`;
                                        const isDeleting = actionKey === `delete-${reminder.id}`;
                                        const errorMessage = reminder.errorMessage || reminder.lastError;

                                        return (
                                            <article
                                                key={reminder.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/40"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h4 className="truncate text-sm font-black text-slate-800">
                                                            {reminder.subject}
                                                        </h4>
                                                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-slate-500">
                                                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                            {reminder.recipientEmail}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${statusStyle.badge}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                                                        {t(`profile.emailReminders.status.${status.toLowerCase()}`)}
                                                    </span>
                                                </div>

                                                <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">
                                                    {reminder.message}
                                                </p>

                                                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                                                    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    <time dateTime={reminder.scheduledAt}>
                                                        {formatDate(reminder.scheduledAt)}
                                                    </time>
                                                </div>

                                                {status === 'FAILED' && errorMessage ? (
                                                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium leading-5 text-rose-600">
                                                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                        <span>
                                                            <strong>{t('profile.emailReminders.errorLabel')}: </strong>
                                                            {errorMessage}
                                                        </span>
                                                    </div>
                                                ) : null}

                                                {canToggle || canDelete ? (
                                                    <footer className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                                                        {canToggle ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(reminder)}
                                                                disabled={Boolean(actionKey)}
                                                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-[11px] font-bold text-slate-600 transition hover:bg-primary/10 hover:text-primary disabled:cursor-wait disabled:opacity-50"
                                                            >
                                                                {isStatusLoading ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : status === 'PAUSED' ? (
                                                                    <Play className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                                )}
                                                                {status === 'PAUSED'
                                                                    ? t('profile.emailReminders.resume')
                                                                    : t('profile.emailReminders.pause')}
                                                            </button>
                                                        ) : null}

                                                        {canDelete && pendingDeleteId === reminder.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPendingDeleteId(null)}
                                                                    disabled={isDeleting}
                                                                    className="h-8 rounded-lg px-3 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100"
                                                                >
                                                                    {t('profile.emailReminders.cancelDelete')}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(reminder.id)}
                                                                    disabled={isDeleting}
                                                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-[11px] font-bold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
                                                                >
                                                                    {isDeleting
                                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                        : <Trash2 className="h-3.5 w-3.5" />}
                                                                    {t('profile.emailReminders.confirmDelete')}
                                                                </button>
                                                            </>
                                                        ) : canDelete ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPendingDeleteId(reminder.id)}
                                                                disabled={Boolean(actionKey)}
                                                                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                {t('profile.emailReminders.delete')}
                                                            </button>
                                                        ) : null}
                                                    </footer>
                                                ) : null}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 lg:overflow-y-auto">
                        <div className="mb-4 flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">
                                    {t('profile.emailReminders.addTitle')}
                                </h3>
                                <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                                    {t('profile.emailReminders.senderHint')}
                                </p>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleCreate}>
                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.recipientEmail')}
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={form.recipientEmail}
                                    onChange={updateField('recipientEmail')}
                                    placeholder={t('profile.emailReminders.recipientPlaceholder')}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.scheduledAt')}
                                </span>
                                <input
                                    type="datetime-local"
                                    required
                                    min={minScheduleTime}
                                    value={form.scheduledAt}
                                    onChange={updateField('scheduledAt')}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.subject')}
                                </span>
                                <input
                                    type="text"
                                    required
                                    maxLength={160}
                                    value={form.subject}
                                    onChange={updateField('subject')}
                                    placeholder={t('profile.emailReminders.subjectPlaceholder')}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.message')}
                                </span>
                                <textarea
                                    required
                                    rows={4}
                                    maxLength={5000}
                                    value={form.message}
                                    onChange={updateField('message')}
                                    placeholder={t('profile.emailReminders.messagePlaceholder')}
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </label>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        {t('profile.emailReminders.previewTitle')}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                        <ShieldCheck className="h-3 w-3" />
                                        {t('profile.emailReminders.safePreview')}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-br from-primary/5 via-white to-sky-50 p-4">
                                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                                        <div className="mb-3 flex items-center gap-2 text-primary">
                                            <Send className="h-4 w-4" />
                                            <span className="text-xs font-black">Xander Lab</span>
                                        </div>
                                        <p className="break-words text-sm font-black text-slate-800">
                                            {form.subject || t('profile.emailReminders.previewSubject')}
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">
                                            {form.message || t('profile.emailReminders.previewMessage')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="flex items-start gap-2 text-[10px] font-medium leading-4 text-slate-400">
                                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                {t('profile.emailReminders.htmlSafetyHint')}
                            </p>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                            >
                                {isCreating
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <CalendarClock className="h-4 w-4" />}
                                {isCreating
                                    ? t('profile.emailReminders.creating')
                                    : t('profile.emailReminders.create')}
                            </button>
                        </form>
                    </aside>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileCenterModal;
