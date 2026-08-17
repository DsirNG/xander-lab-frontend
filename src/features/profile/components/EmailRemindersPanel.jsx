import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CalendarClock,
    CheckCircle2,
    CirclePause,
    Clock3,
    Mail,
    Pause,
    Play,
    Plus,
    Search,
    Send,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import ConfirmModal from '@components/common/ConfirmModal';
import CustomSelect from '@components/common/CustomSelect';
import DataTable from '@components/common/DataTable';
import RowActionsMenu from '@components/common/RowActionsMenu';
import { useToast } from '@hooks/useToast';
import { emailReminderService } from '../services/emailReminderService';
import EmailReminderCreateModal from './EmailReminderCreateModal';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_STATS = {
    total: 0,
    active: 0,
    sent: 0,
    pending: 0,
};

const STATUS_STYLES = {
    PENDING: {
        badge: 'bg-success-soft text-success-fg',
        rowIcon: 'bg-success-soft text-success',
    },
    PAUSED: {
        badge: 'bg-warning-soft text-warning-fg',
        rowIcon: 'bg-warning-soft text-warning',
    },
    SENDING: {
        badge: 'bg-info-soft text-info-fg',
        rowIcon: 'bg-accent-soft text-accent',
    },
    SENT: {
        badge: 'bg-surface text-ink-muted',
        rowIcon: 'bg-surface text-ink-muted',
    },
    FAILED: {
        badge: 'bg-danger-soft text-danger-fg',
        rowIcon: 'bg-danger-soft text-danger',
    },
};

const normalizeStatus = (status) => {
    const normalized = String(status || 'PENDING').toUpperCase();
    if (normalized === 'SCHEDULED' || normalized === 'ACTIVE') return 'PENDING';
    if (normalized === 'PROCESSING') return 'SENDING';
    return STATUS_STYLES[normalized] ? normalized : 'PENDING';
};

const normalizeFrequency = (frequency) => {
    const value = String(frequency || 'ONCE').toUpperCase();
    return ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'].includes(value) ? value : 'ONCE';
};

const getReminderList = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.records)) return result.records;
    if (Array.isArray(result?.content)) return result.content;
    return [];
};

const getListStats = (result) => {
    const stats = result?.stats;
    if (!stats || typeof stats !== 'object') return EMPTY_STATS;
    return {
        total: Number(stats.total) || 0,
        active: Number(stats.active) || 0,
        sent: Number(stats.sent) || 0,
        pending: Number(stats.pending) || 0,
    };
};

const EmailRemindersPanel = () => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [reminders, setReminders] = useState([]);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [actionKey, setActionKey] = useState('');
    const [loadError, setLoadError] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const listRequestSeqRef = useRef(0);
    const listAbortRef = useRef(null);

    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }), [i18n.language]);

    const formatDate = useCallback((value) => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date);
    }, [dateFormatter]);

    const formatSchedule = useCallback((reminder) => {
        const frequency = normalizeFrequency(reminder.frequency);
        const time = reminder.sendTime || '—';
        if (frequency === 'ONCE') return formatDate(reminder.scheduledAt);
        if (frequency === 'DAILY') return t('profile.emailReminders.scheduleDaily', { time });
        if (frequency === 'WEEKLY') {
            return t('profile.emailReminders.scheduleWeekly', {
                weekday: t(`profile.emailReminders.weekdays.${reminder.recurrenceDay || 1}`),
                time,
            });
        }
        if (frequency === 'MONTHLY') {
            return t('profile.emailReminders.scheduleMonthly', {
                day: reminder.recurrenceDay || 1,
                time,
            });
        }
        return t('profile.emailReminders.scheduleCustom', {
            days: reminder.intervalDays || 1,
            time,
        });
    }, [formatDate, t]);

    // Trailing debounce: only commit search after typing settles.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, pageSize]);

    const loadReminders = useCallback(async ({ showLoading = true } = {}) => {
        listAbortRef.current?.abort();
        const controller = new AbortController();
        listAbortRef.current = controller;
        const requestSeq = ++listRequestSeqRef.current;

        if (showLoading) setIsLoading(true);
        setLoadError('');
        try {
            const result = await emailReminderService.list({
                page,
                size: pageSize,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                search: debouncedSearch || undefined,
            }, { signal: controller.signal, _silent: true });

            // Drop stale responses; only the latest (tail) request may update UI.
            if (requestSeq !== listRequestSeqRef.current || controller.signal.aborted) {
                return;
            }

            const records = getReminderList(result);
            const nextTotal = Number(result?.total) || records.length;
            const nextPages = Math.max(
                1,
                Number(result?.pages) || Math.ceil(nextTotal / pageSize) || 1
            );
            setReminders(records);
            setTotal(nextTotal);

            setStats(getListStats(result));
            if (page > nextPages) {
                setPage(nextPages);
            }
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
            if (requestSeq !== listRequestSeqRef.current) return;
            setLoadError(error.message || t('profile.emailReminders.loadError'));
        } finally {
            if (requestSeq === listRequestSeqRef.current && showLoading && !controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [debouncedSearch, page, pageSize, statusFilter, t]);

    useEffect(() => {
        loadReminders();
        return () => {
            listAbortRef.current?.abort();
        };
    }, [loadReminders]);

    const statusOptions = useMemo(() => ([
        { value: 'ALL', label: t('profile.emailReminders.filterAll') },
        { value: 'PENDING', label: t('profile.emailReminders.status.pending') },
        { value: 'PAUSED', label: t('profile.emailReminders.status.paused') },
        { value: 'SENDING', label: t('profile.emailReminders.status.sending') },
        { value: 'SENT', label: t('profile.emailReminders.status.sent') },
        { value: 'FAILED', label: t('profile.emailReminders.status.failed') },
    ]), [t]);

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
    };


    const handleStatusChange = async (reminder) => {
        const status = normalizeStatus(reminder.status);
        const nextStatus = status === 'PAUSED' ? 'PENDING' : 'PAUSED';
        const key = `status-${reminder.id}`;
        setActionKey(key);
        try {
            await emailReminderService.updateStatus(reminder.id, nextStatus);
            toast.success(t('profile.emailReminders.statusUpdated'));
            await loadReminders({ showLoading: false });
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setActionKey('');
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete?.id) return;
        const id = pendingDelete.id;
        const key = `delete-${id}`;
        setActionKey(key);
        try {
            await emailReminderService.remove(id);
            setPendingDelete(null);
            toast.success(t('profile.emailReminders.deleted'));
            if (reminders.length <= 1 && page > 1) {
                setPage((current) => Math.max(1, current - 1));
            } else {
                await loadReminders({ showLoading: false });
            }
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setActionKey('');
        }
    };

    const statCards = [
        {
            key: 'total',
            value: stats.total,
            label: t('profile.emailReminders.stats.total'),
            hint: t('profile.emailReminders.stats.totalHint'),
            icon: Send,
            iconClass: 'bg-accent-soft text-accent',
        },
        {
            key: 'active',
            value: stats.active,
            label: t('profile.emailReminders.stats.active'),
            hint: t('profile.emailReminders.stats.activeHint'),
            icon: Clock3,
            iconClass: 'bg-success-soft text-success',
        },
        {
            key: 'sent',
            value: stats.sent,
            label: t('profile.emailReminders.stats.sent'),
            hint: t('profile.emailReminders.stats.sentHint'),
            icon: CheckCircle2,
            iconClass: 'bg-info-soft text-info',
        },
        {
            key: 'pending',
            value: stats.pending,
            label: t('profile.emailReminders.stats.pending'),
            hint: t('profile.emailReminders.stats.pendingHint'),
            icon: CirclePause,
            iconClass: 'bg-warning-soft text-warning',
        },
    ];

    const columns = useMemo(() => [
        {
            key: 'subject',
            title: t('profile.emailReminders.taskName'),
            width: '28%',
            render: (reminder) => {
                const status = normalizeStatus(reminder.status);
                const statusStyle = STATUS_STYLES[status];
                const frequency = normalizeFrequency(reminder.frequency);
                return (
                    <div className="flex min-w-0 items-center gap-2">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${statusStyle.rowIcon}`}>
                            <Mail className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-ink" title={reminder.subject}>
                                {reminder.subject}
                            </div>
                            <div className="mt-0.5 truncate text-caption font-medium text-ink-faint">
                                {t(`profile.emailReminders.frequencies.${frequency.toLowerCase()}`)}
                                {reminder.timezone ? ` · ${reminder.timezone}` : ''}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'recipientEmail',
            title: t('profile.emailReminders.recipientEmail'),
            width: '22%',
            render: (reminder) => (
                <span className="block truncate text-sm font-medium text-ink-muted" title={reminder.recipientEmail}>
                    {reminder.recipientEmail}
                </span>
            ),
        },
        {
            key: 'schedule',
            title: t('profile.emailReminders.scheduleColumn'),
            width: '24%',
            render: (reminder) => {
                const frequency = normalizeFrequency(reminder.frequency);
                const scheduleText = formatSchedule(reminder);
                return (
                    <>
                        <span className="block truncate text-sm font-medium text-ink-muted" title={scheduleText}>
                            {scheduleText}
                        </span>
                        {frequency !== 'ONCE' ? (
                            <span className="mt-1 block truncate text-caption font-medium text-ink-faint" title={formatDate(reminder.scheduledAt)}>
                                {t('profile.emailReminders.nextRun', { time: formatDate(reminder.scheduledAt) })}
                            </span>
                        ) : null}
                    </>
                );
            },
        },
        {
            key: 'status',
            title: t('profile.emailReminders.statusLabel'),
            width: '14%',
            render: (reminder) => {
                const status = normalizeStatus(reminder.status);
                return (
                    <span className={`inline-flex max-w-full truncate items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status].badge}`}>
                        {t(`profile.emailReminders.status.${status.toLowerCase()}`)}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            title: t('profile.emailReminders.actions'),
            width: '8%',

            render: (reminder) => {
                const status = normalizeStatus(reminder.status);
                const canToggle = status === 'PENDING' || status === 'PAUSED';
                const canDelete = status !== 'SENDING';
                const isStatusLoading = actionKey === `status-${reminder.id}`;
                const items = [];
                if (canToggle) {
                    items.push({
                        key: 'toggle',
                        label: status === 'PAUSED'
                            ? t('profile.emailReminders.resume')
                            : t('profile.emailReminders.pause'),
                        icon: status === 'PAUSED' ? Play : Pause,
                        disabled: Boolean(actionKey),
                        loading: isStatusLoading,
                        onClick: () => handleStatusChange(reminder),
                    });
                }
                if (canDelete) {
                    items.push({
                        key: 'delete',
                        label: t('profile.emailReminders.delete'),
                        icon: Trash2,
                        danger: true,
                        disabled: Boolean(actionKey),
                        onClick: () => setPendingDelete(reminder),
                    });
                }
                return <RowActionsMenu actions={items} size="sm" />;
            },
        },
    ], [actionKey, formatDate, formatSchedule, handleStatusChange, setPendingDelete, t]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 flex-col gap-3 px-4 py-4 px-ultra-tight sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                        <CalendarClock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <div className="text-base font-bold text-ink">
                            {t('profile.emailReminders.title')}
                        </div>
                        <div className="mt-0.5 text-caption font-medium text-ink-faint">
                            {t('profile.emailReminders.description')}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-accent/90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t('profile.emailReminders.createNew')}
                </button>
            </div>

            <div className="flex shrink-0 flex-col px-4 pb-3 px-ultra-tight sm:px-6">
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.key}
                                className="min-w-0 rounded-xl bg-surface px-2 py-2.5 sm:px-3"
                            >
                                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate text-base font-black tracking-tight text-ink sm:text-lg">
                                            {card.value}
                                            <span className="ml-1 text-micro font-bold text-ink-muted sm:text-caption">
                                                {card.label}
                                            </span>
                                        </div>
                                        <div className="mt-0.5 truncate text-micro font-medium text-ink-faint">{card.hint}</div>
                                    </div>
                                    <span className={`hidden h-8 w-8 shrink-0 place-items-center rounded-lg sm:grid ${card.iconClass}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-3 px-ultra-tight sm:px-6">
                <DataTable
                    columns={columns}
                    rows={reminders}
                    loading={isLoading}
                    loadingText={t('profile.emailReminders.loading')}
                    error={loadError}
                    errorTitle={t('profile.emailReminders.loadError')}
                    onRetry={loadReminders}
                    onRetryLabel={t('profile.emailReminders.retry')}
                    emptyTitle={t('profile.emailReminders.emptyTitle')}
                    emptyHint={t('profile.emailReminders.emptyHint')}
                    emptyIcon={CalendarClock}
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    paginationDisabled={isLoading}
                    header={(
                        <div className="flex shrink-0 flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                            <div className="text-xs font-black text-ink">
                                {t('profile.emailReminders.taskList')}
                            </div>
                            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="w-full sm:w-32">
                                    <CustomSelect
                                        size="sm"
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={handleStatusFilterChange}
                                    />
                                </div>
                                <label className="relative block w-full min-w-0 sm:w-52">
                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder={t('profile.emailReminders.searchPlaceholder')}
                                        className="h-8 w-full rounded-lg bg-surface pl-8 pr-2.5 text-xs font-medium text-ink-secondary outline-none transition placeholder:text-ink-faint focus:bg-canvas focus:ring-2 focus:ring-accent/15"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                />

                <div className="mt-3 flex shrink-0 items-start gap-2 rounded-xl bg-accent-soft/80 px-3 py-2.5">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <div className="min-w-0">
                        <div className="text-caption font-bold text-accent-fg">
                            {t('profile.emailReminders.tipTitle')}
                        </div>
                        <div className="mt-0.5 text-micro font-medium leading-4 text-accent-800/80">
                            {t('profile.emailReminders.tipBody')}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={Boolean(pendingDelete)}
                onClose={() => {
                    if (actionKey.startsWith('delete-')) return;
                    setPendingDelete(null);
                }}
                onConfirm={handleDelete}
                confirming={Boolean(pendingDelete) && actionKey === `delete-${pendingDelete?.id}`}
                title={t('profile.emailReminders.confirmDeleteTitle')}
                message={t('profile.emailReminders.confirmDeleteMessage', {
                    name: pendingDelete?.subject || pendingDelete?.taskName || pendingDelete?.recipientEmail || '',
                })}
                confirmText={t('profile.emailReminders.delete')}
            />

            <EmailReminderCreateModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => {
                    if (page !== 1) {
                        setPage(1);
                        return;
                    }
                    loadReminders({ showLoading: false });
                }}
            />
        </div>
    );
};

export default EmailRemindersPanel;
