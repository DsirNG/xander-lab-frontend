import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CirclePause,
    Clock3,
    Loader2,
    Mail,
    Pause,
    Play,
    Plus,
    Search,
    Send,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react';
import CustomSelect from '@components/common/CustomSelect';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useToast } from '@hooks/useToast';
import { emailReminderService } from '../services/emailReminderService';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_SIZE = 10;

const STATUS_STYLES = {
    PENDING: {
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
        rowIcon: 'bg-sky-50 text-sky-600',
    },
    PAUSED: {
        badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
        rowIcon: 'bg-amber-50 text-amber-600',
    },
    SENDING: {
        badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
        rowIcon: 'bg-violet-50 text-violet-600',
    },
    SENT: {
        badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
        rowIcon: 'bg-slate-50 text-slate-500',
    },
    FAILED: {
        badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
        rowIcon: 'bg-rose-50 text-rose-600',
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

const EmailRemindersPanel = () => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [reminders, setReminders] = useState([]);
    const [form, setForm] = useState(createInitialForm);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [actionKey, setActionKey] = useState('');
    const [loadError, setLoadError] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
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
        const controller = new AbortController();
        loadReminders({ signal: controller.signal });
        return () => controller.abort();
    }, [loadReminders]);

    const stats = useMemo(() => {
        let active = 0;
        let sent = 0;
        let pending = 0;
        reminders.forEach((item) => {
            const status = normalizeStatus(item.status);
            if (status === 'PENDING' || status === 'SENDING') active += 1;
            if (status === 'SENT') sent += 1;
            if (status === 'PENDING') pending += 1;
        });
        return {
            total: reminders.length,
            active,
            sent,
            pending,
        };
    }, [reminders]);

    const statusOptions = useMemo(() => ([
        { value: 'ALL', label: t('profile.emailReminders.filterAll') },
        { value: 'PENDING', label: t('profile.emailReminders.status.pending') },
        { value: 'PAUSED', label: t('profile.emailReminders.status.paused') },
        { value: 'SENDING', label: t('profile.emailReminders.status.sending') },
        { value: 'SENT', label: t('profile.emailReminders.status.sent') },
        { value: 'FAILED', label: t('profile.emailReminders.status.failed') },
    ]), [t]);

    const filteredReminders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return reminders.filter((item) => {
            const status = normalizeStatus(item.status);
            if (statusFilter !== 'ALL' && status !== statusFilter) return false;
            if (!query) return true;
            const subject = String(item.subject || '').toLowerCase();
            const email = String(item.recipientEmail || '').toLowerCase();
            return subject.includes(query) || email.includes(query);
        });
    }, [reminders, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredReminders.length / PAGE_SIZE));

    useEffect(() => {
        setPage(1);
    }, [statusFilter, searchQuery]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pagedReminders = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredReminders.slice(start, start + PAGE_SIZE);
    }, [filteredReminders, page]);

    const updateField = (field) => (event) => {
        const { value } = event.target;
        setForm((current) => ({ ...current, [field]: value }));
    };

    const openCreate = () => {
        setForm(createInitialForm());
        clientRequestIdRef.current = createClientRequestId();
        setIsCreateOpen(true);
    };

    const closeCreate = () => {
        if (isCreating) return;
        setIsCreateOpen(false);
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
            setIsCreateOpen(false);
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

    const minScheduleTime = toDateTimeLocalValue(new Date(Date.now() + 60_000));

    const statCards = [
        {
            key: 'total',
            value: stats.total,
            label: t('profile.emailReminders.stats.total'),
            hint: t('profile.emailReminders.stats.totalHint'),
            icon: Send,
            iconClass: 'bg-sky-50 text-sky-600',
        },
        {
            key: 'active',
            value: stats.active,
            label: t('profile.emailReminders.stats.active'),
            hint: t('profile.emailReminders.stats.activeHint'),
            icon: Clock3,
            iconClass: 'bg-emerald-50 text-emerald-600',
        },
        {
            key: 'sent',
            value: stats.sent,
            label: t('profile.emailReminders.stats.sent'),
            hint: t('profile.emailReminders.stats.sentHint'),
            icon: CheckCircle2,
            iconClass: 'bg-blue-50 text-blue-600',
        },
        {
            key: 'pending',
            value: stats.pending,
            label: t('profile.emailReminders.stats.pending'),
            hint: t('profile.emailReminders.stats.pendingHint'),
            icon: CirclePause,
            iconClass: 'bg-amber-50 text-amber-600',
        },
    ];

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5">
                <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-2.5">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
                            <CalendarClock className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-sm font-black tracking-tight text-slate-800">
                                {t('profile.emailReminders.title')}
                            </h2>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                {t('profile.emailReminders.description')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white shadow-sm shadow-primary/20 transition hover:brightness-105"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t('profile.emailReminders.createNew')}
                    </button>
                </header>

                <div className="grid shrink-0 grid-cols-4 gap-2">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.key}
                                className="min-w-0 rounded-xl border border-slate-200 bg-white px-2 py-2.5 sm:px-3"
                            >
                                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-base font-black tracking-tight text-slate-800 sm:text-lg">
                                            {card.value}
                                            <span className="ml-1 text-[10px] font-bold text-slate-500 sm:text-[11px]">
                                                {card.label}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400 sm:text-[10px]">{card.hint}</p>
                                    </div>
                                    <span className={`hidden h-8 w-8 shrink-0 place-items-center rounded-lg sm:grid ${card.iconClass}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <section className="flex min-h-[320px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex shrink-0 flex-col gap-2 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <h3 className="text-xs font-black text-slate-800">
                            {t('profile.emailReminders.taskList')}
                        </h3>
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="w-full sm:w-32">
                                <CustomSelect
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                />
                            </div>
                            <label className="relative block w-full min-w-0 sm:w-52">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={t('profile.emailReminders.searchPlaceholder')}
                                    className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="min-h-[240px] min-w-0 flex-1 overflow-auto">
                        {isLoading ? (
                            <div className="flex min-h-[220px] items-center justify-center">
                                <LoadingSpinner
                                    fullScreen={false}
                                    text={t('profile.emailReminders.loading')}
                                />
                            </div>
                        ) : loadError ? (
                            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                                <AlertCircle className="mb-2 h-7 w-7 text-rose-400" />
                                <p className="text-xs font-bold text-rose-700">
                                    {t('profile.emailReminders.loadError')}
                                </p>
                                <p className="mt-1 max-w-sm text-[11px] font-medium text-rose-500">{loadError}</p>
                                <button
                                    type="button"
                                    onClick={() => loadReminders()}
                                    className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-700"
                                >
                                    {t('profile.emailReminders.retry')}
                                </button>
                            </div>
                        ) : filteredReminders.length === 0 ? (
                            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                                <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-slate-50 text-slate-300">
                                    <CalendarClock className="h-5 w-5" />
                                </span>
                                <p className="text-xs font-bold text-slate-700">
                                    {t('profile.emailReminders.emptyTitle')}
                                </p>
                                <p className="mt-1 max-w-xs text-[11px] font-medium leading-5 text-slate-400">
                                    {t('profile.emailReminders.emptyHint')}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full min-w-[640px] table-fixed text-left">
                                <colgroup>
                                    <col className="w-[32%]" />
                                    <col className="w-[24%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[12%]" />
                                </colgroup>
                                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
                                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                        <th className="px-3 py-2 sm:px-4">{t('profile.emailReminders.taskName')}</th>
                                        <th className="px-2 py-2">{t('profile.emailReminders.recipientEmail')}</th>
                                        <th className="px-2 py-2">{t('profile.emailReminders.scheduledAt')}</th>
                                        <th className="px-2 py-2">{t('profile.emailReminders.statusLabel')}</th>
                                        <th className="px-3 py-2 text-right sm:px-4">{t('profile.emailReminders.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pagedReminders.map((reminder) => {
                                        const status = normalizeStatus(reminder.status);
                                        const statusStyle = STATUS_STYLES[status];
                                        const canToggle = status === 'PENDING' || status === 'PAUSED';
                                        const canDelete = status !== 'SENDING';
                                        const isStatusLoading = actionKey === `status-${reminder.id}`;
                                        const isDeleting = actionKey === `delete-${reminder.id}`;

                                        return (
                                            <tr key={reminder.id} className="hover:bg-slate-50/70">
                                                <td className="px-3 py-2.5 sm:px-4">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${statusStyle.rowIcon}`}>
                                                            <Mail className="h-3.5 w-3.5" />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-bold text-slate-800" title={reminder.subject}>
                                                                {reminder.subject}
                                                            </p>
                                                            {status === 'FAILED' && (reminder.errorMessage || reminder.lastError) ? (
                                                                <p className="mt-0.5 truncate text-[10px] font-medium text-rose-500" title={reminder.errorMessage || reminder.lastError}>
                                                                    {reminder.errorMessage || reminder.lastError}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <span className="block truncate text-xs font-medium text-slate-500" title={reminder.recipientEmail}>
                                                        {reminder.recipientEmail}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <span className="block truncate text-xs font-medium text-slate-500" title={formatDate(reminder.scheduledAt)}>
                                                        {formatDate(reminder.scheduledAt)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <span className={`inline-flex max-w-full truncate items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle.badge}`}>
                                                        {t(`profile.emailReminders.status.${status.toLowerCase()}`)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 sm:px-4">
                                                    <div className="flex items-center justify-end gap-0.5">
                                                        {canToggle ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(reminder)}
                                                                disabled={Boolean(actionKey)}
                                                                title={status === 'PAUSED'
                                                                    ? t('profile.emailReminders.resume')
                                                                    : t('profile.emailReminders.pause')}
                                                                aria-label={status === 'PAUSED'
                                                                    ? t('profile.emailReminders.resume')
                                                                    : t('profile.emailReminders.pause')}
                                                                className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50"
                                                            >
                                                                {isStatusLoading ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : status === 'PAUSED' ? (
                                                                    <Play className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <Pause className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        ) : null}

                                                        {canDelete && pendingDeleteId === reminder.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPendingDeleteId(null)}
                                                                    disabled={isDeleting}
                                                                    className="h-7 rounded-md px-1.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100"
                                                                >
                                                                    {t('profile.emailReminders.cancelDelete')}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(reminder.id)}
                                                                    disabled={isDeleting}
                                                                    className="inline-flex h-7 items-center gap-1 rounded-md bg-rose-600 px-2 text-[10px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                                                                >
                                                                    {isDeleting
                                                                        ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                        : <Trash2 className="h-3 w-3" />}
                                                                    {t('profile.emailReminders.confirmDelete')}
                                                                </button>
                                                            </>
                                                        ) : canDelete ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPendingDeleteId(reminder.id)}
                                                                disabled={Boolean(actionKey)}
                                                                title={t('profile.emailReminders.delete')}
                                                                aria-label={t('profile.emailReminders.delete')}
                                                                className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {filteredReminders.length > 0 ? (
                        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                            <p className="text-[10px] font-medium text-slate-400">
                                {t('profile.emailReminders.pageInfo', {
                                    from: (page - 1) * PAGE_SIZE + 1,
                                    to: Math.min(page * PAGE_SIZE, filteredReminders.length),
                                    total: filteredReminders.length,
                                })}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page <= 1}
                                    className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={t('profile.emailReminders.prevPage')}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1)
                                    .filter((pageNumber) => (
                                        totalPages <= 5
                                        || pageNumber === 1
                                        || pageNumber === totalPages
                                        || Math.abs(pageNumber - page) <= 1
                                    ))
                                    .reduce((acc, pageNumber, index, list) => {
                                        if (index > 0 && pageNumber - list[index - 1] > 1) {
                                            acc.push('ellipsis');
                                        }
                                        acc.push(pageNumber);
                                        return acc;
                                    }, [])
                                    .map((item, index) => (
                                        item === 'ellipsis' ? (
                                            <span key={`ellipsis-${index}`} className="px-1 text-[10px] text-slate-300">…</span>
                                        ) : (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setPage(item)}
                                                className={`grid h-7 w-7 place-items-center rounded-md text-[10px] font-bold transition ${
                                                    page === item
                                                        ? 'bg-primary text-white'
                                                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    ))}
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page >= totalPages}
                                    className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={t('profile.emailReminders.nextPage')}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : null}
                </section>

                <div className="flex shrink-0 items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2.5">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-sky-800">
                            {t('profile.emailReminders.tipTitle')}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium leading-4 text-sky-700/80">
                            {t('profile.emailReminders.tipBody')}
                        </p>
                    </div>
                </div>
            </div>

            {isCreateOpen ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
                    <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/20 sm:p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">
                                    {t('profile.emailReminders.addTitle')}
                                </h3>
                                <p className="mt-1 text-[11px] font-medium leading-5 text-slate-400">
                                    {t('profile.emailReminders.senderHint')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label={t('common.aria.close', 'Close')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form className="space-y-3" onSubmit={handleCreate}>
                            <label className="block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.recipientEmail')}
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={form.recipientEmail}
                                    onChange={updateField('recipientEmail')}
                                    placeholder={t('profile.emailReminders.recipientPlaceholder')}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.scheduledAt')}
                                </span>
                                <input
                                    type="datetime-local"
                                    required
                                    min={minScheduleTime}
                                    value={form.scheduledAt}
                                    onChange={updateField('scheduledAt')}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.subject')}
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

                            <label className="block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {t('profile.emailReminders.message')}
                                </span>
                                <textarea
                                    required
                                    rows={4}
                                    maxLength={5000}
                                    value={form.message}
                                    onChange={updateField('message')}
                                    placeholder={t('profile.emailReminders.messagePlaceholder')}
                                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium leading-5 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </label>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {t('profile.emailReminders.previewTitle')}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                        <ShieldCheck className="h-3 w-3" />
                                        {t('profile.emailReminders.safePreview')}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-br from-primary/5 via-white to-sky-50 p-3">
                                    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                                        <div className="mb-2 flex items-center gap-1.5 text-primary">
                                            <Send className="h-3.5 w-3.5" />
                                            <span className="text-[11px] font-black">Xander Lab</span>
                                        </div>
                                        <p className="break-words text-xs font-bold text-slate-800">
                                            {form.subject || t('profile.emailReminders.previewSubject')}
                                        </p>
                                        <p className="mt-1.5 whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-500">
                                            {form.message || t('profile.emailReminders.previewMessage')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="flex items-start gap-1.5 text-[10px] font-medium leading-4 text-slate-400">
                                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                                {t('profile.emailReminders.htmlSafetyHint')}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeCreate}
                                    disabled={isCreating}
                                    className="h-9 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                                >
                                    {t('profile.emailReminders.cancelDelete')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="inline-flex h-9 flex-[1.4] items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-white shadow-sm shadow-primary/20 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {isCreating
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <CalendarClock className="h-3.5 w-3.5" />}
                                    {isCreating
                                        ? t('profile.emailReminders.creating')
                                        : t('profile.emailReminders.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default EmailRemindersPanel;
