import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@shared/hooks/useToast";
import { emailReminderService } from "../services/emailReminderService";
import {
    normalizeFrequency,
    normalizeStatus,
} from "../utils/emailReminderStatus";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_STATS = { total: 0, active: 0, sent: 0, pending: 0 };

const getReminderList = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.records)) return result.records;
    if (Array.isArray(result?.content)) return result.content;
    return [];
};

const getListStats = (result) => {
    const stats = result?.stats;
    if (!stats || typeof stats !== "object") return EMPTY_STATS;
    return {
        total: Number(stats.total) || 0,
        active: Number(stats.active) || 0,
        sent: Number(stats.sent) || 0,
        pending: Number(stats.pending) || 0,
    };
};

export default function useEmailReminders({ i18n, t }) {
    const toast = useToast();
    const [reminders, setReminders] = useState([]);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [actionKey, setActionKey] = useState("");
    const [loadError, setLoadError] = useState("");
    const [pendingDelete, setPendingDelete] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const listRequestSeqRef = useRef(0);
    const listAbortRef = useRef(null);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(i18n.language, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [i18n.language],
    );

    const formatDate = useCallback(
        (value) => {
            if (!value) return "—";
            const date = new Date(value);
            return Number.isNaN(date.getTime())
                ? String(value)
                : dateFormatter.format(date);
        },
        [dateFormatter],
    );

    const formatSchedule = useCallback(
        (reminder) => {
            const frequency = normalizeFrequency(reminder.frequency);
            const time = reminder.sendTime || "—";
            if (frequency === "ONCE") return formatDate(reminder.scheduledAt);
            if (frequency === "DAILY") {
                return t("profile.emailReminders.scheduleDaily", { time });
            }
            if (frequency === "WEEKLY") {
                return t("profile.emailReminders.scheduleWeekly", {
                    weekday: t(
                        `profile.emailReminders.weekdays.${reminder.recurrenceDay || 1}`,
                    ),
                    time,
                });
            }
            if (frequency === "MONTHLY") {
                return t("profile.emailReminders.scheduleMonthly", {
                    day: reminder.recurrenceDay || 1,
                    time,
                });
            }
            return t("profile.emailReminders.scheduleCustom", {
                days: reminder.intervalDays || 1,
                time,
            });
        },
        [formatDate, t],
    );

    useEffect(() => {
        const timer = window.setTimeout(
            () => setDebouncedSearch(searchQuery.trim()),
            SEARCH_DEBOUNCE_MS,
        );
        return () => window.clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, pageSize]);

    const loadReminders = useCallback(
        async ({ showLoading = true } = {}) => {
            listAbortRef.current?.abort();
            const controller = new AbortController();
            listAbortRef.current = controller;
            const requestSeq = ++listRequestSeqRef.current;
            if (showLoading) setIsLoading(true);
            setLoadError("");

            try {
                const result = await emailReminderService.list(
                    {
                        page,
                        size: pageSize,
                        status:
                            statusFilter === "ALL" ? undefined : statusFilter,
                        search: debouncedSearch || undefined,
                    },
                    { signal: controller.signal, _silent: true },
                );
                if (
                    requestSeq !== listRequestSeqRef.current ||
                    controller.signal.aborted
                ) {
                    return;
                }

                const records = getReminderList(result);
                const nextTotal = Number(result?.total) || records.length;
                const nextPages = Math.max(
                    1,
                    Number(result?.pages) ||
                        Math.ceil(nextTotal / pageSize) ||
                        1,
                );
                setReminders(records);
                setTotal(nextTotal);
                setStats(getListStats(result));
                if (page > nextPages) setPage(nextPages);
            } catch (error) {
                if (
                    error.name === "CanceledError" ||
                    error.code === "ERR_CANCELED"
                ) {
                    return;
                }
                if (requestSeq !== listRequestSeqRef.current) return;
                setLoadError(
                    error.message || t("profile.emailReminders.loadError"),
                );
            } finally {
                if (
                    requestSeq === listRequestSeqRef.current &&
                    showLoading &&
                    !controller.signal.aborted
                ) {
                    setIsLoading(false);
                }
            }
        },
        [debouncedSearch, page, pageSize, statusFilter, t],
    );

    useEffect(() => {
        loadReminders();
        return () => listAbortRef.current?.abort();
    }, [loadReminders]);

    const handleStatusChange = useCallback(
        async (reminder) => {
            const status = normalizeStatus(reminder.status);
            const nextStatus = status === "PAUSED" ? "PENDING" : "PAUSED";
            const key = `status-${reminder.id}`;
            setActionKey(key);
            try {
                await emailReminderService.updateStatus(
                    reminder.id,
                    nextStatus,
                );
                toast.success(t("profile.emailReminders.statusUpdated"));
                await loadReminders({ showLoading: false });
            } catch {
                // Shared HTTP handling presents the server error.
            } finally {
                setActionKey("");
            }
        },
        [loadReminders, t, toast],
    );

    const handleDelete = useCallback(async () => {
        if (!pendingDelete?.id) return;
        const id = pendingDelete.id;
        const key = `delete-${id}`;
        setActionKey(key);
        try {
            await emailReminderService.remove(id);
            setPendingDelete(null);
            toast.success(t("profile.emailReminders.deleted"));
            if (reminders.length <= 1 && page > 1) {
                setPage((current) => Math.max(1, current - 1));
            } else {
                await loadReminders({ showLoading: false });
            }
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setActionKey("");
        }
    }, [loadReminders, page, pendingDelete, reminders.length, t, toast]);

    return {
        reminders,
        stats,
        total,
        isLoading,
        actionKey,
        loadError,
        pendingDelete,
        statusFilter,
        searchQuery,
        page,
        pageSize,
        formatDate,
        formatSchedule,
        loadReminders,
        handleStatusChange,
        handleDelete,
        setPendingDelete,
        setStatusFilter,
        setSearchQuery,
        setPage,
        setPageSize,
    };
}
