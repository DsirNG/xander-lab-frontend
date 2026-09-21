import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    CalendarClock,
    CheckCircle2,
    CirclePause,
    Clock3,
    Plus,
    Send,
    ShieldCheck,
} from "lucide-react";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import useEmailReminders from "../hooks/useEmailReminders";
import EmailReminderCreateModal from "./EmailReminderCreateModal";
import EmailReminderTable from "./EmailReminderTable";

const EmailRemindersPanel = () => {
    const { t, i18n } = useTranslation();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const {
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
    } = useEmailReminders({ i18n, t });

    const statusOptions = useMemo(
        () => [
            { value: "ALL", label: t("profile.emailReminders.filterAll") },
            {
                value: "PENDING",
                label: t("profile.emailReminders.status.pending"),
            },
            {
                value: "PAUSED",
                label: t("profile.emailReminders.status.paused"),
            },
            {
                value: "SENDING",
                label: t("profile.emailReminders.status.sending"),
            },
            { value: "SENT", label: t("profile.emailReminders.status.sent") },
            {
                value: "FAILED",
                label: t("profile.emailReminders.status.failed"),
            },
        ],
        [t],
    );

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
    };

    const statCards = [
        {
            key: "total",
            value: stats.total,
            label: t("profile.emailReminders.stats.total"),
            hint: t("profile.emailReminders.stats.totalHint"),
            icon: Send,
            iconClass: "bg-accent-soft text-accent",
        },
        {
            key: "active",
            value: stats.active,
            label: t("profile.emailReminders.stats.active"),
            hint: t("profile.emailReminders.stats.activeHint"),
            icon: Clock3,
            iconClass: "bg-success-soft text-success",
        },
        {
            key: "sent",
            value: stats.sent,
            label: t("profile.emailReminders.stats.sent"),
            hint: t("profile.emailReminders.stats.sentHint"),
            icon: CheckCircle2,
            iconClass: "bg-info-soft text-info",
        },
        {
            key: "pending",
            value: stats.pending,
            label: t("profile.emailReminders.stats.pending"),
            hint: t("profile.emailReminders.stats.pendingHint"),
            icon: CirclePause,
            iconClass: "bg-warning-soft text-warning",
        },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 flex-col gap-3 px-4 py-4 px-ultra-tight sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                        <CalendarClock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <div className="text-base font-bold text-ink">
                            {t("profile.emailReminders.title")}
                        </div>
                        <div className="mt-0.5 text-caption font-medium text-ink-faint">
                            {t("profile.emailReminders.description")}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-accent/90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t("profile.emailReminders.createNew")}
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
                                        <div className="mt-0.5 truncate text-micro font-medium text-ink-faint">
                                            {card.hint}
                                        </div>
                                    </div>
                                    <span
                                        className={`hidden h-8 w-8 shrink-0 place-items-center rounded-lg sm:grid ${card.iconClass}`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-3 px-ultra-tight sm:px-6">
                <EmailReminderTable
                    reminders={reminders}
                    isLoading={isLoading}
                    loadError={loadError}
                    loadReminders={loadReminders}
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    statusOptions={statusOptions}
                    statusFilter={statusFilter}
                    onStatusFilterChange={handleStatusFilterChange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    actionKey={actionKey}
                    formatDate={formatDate}
                    formatSchedule={formatSchedule}
                    handleStatusChange={handleStatusChange}
                    onDeleteRequest={setPendingDelete}
                    t={t}
                />

                <div className="mt-3 flex shrink-0 items-start gap-2 rounded-xl bg-accent-soft/80 px-3 py-2.5">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <div className="min-w-0">
                        <div className="text-caption font-bold text-accent-fg">
                            {t("profile.emailReminders.tipTitle")}
                        </div>
                        <div className="mt-0.5 text-micro font-medium leading-4 text-accent-800/80">
                            {t("profile.emailReminders.tipBody")}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={Boolean(pendingDelete)}
                onClose={() => {
                    if (actionKey.startsWith("delete-")) return;
                    setPendingDelete(null);
                }}
                onConfirm={handleDelete}
                confirming={
                    Boolean(pendingDelete) &&
                    actionKey === `delete-${pendingDelete?.id}`
                }
                title={t("profile.emailReminders.confirmDeleteTitle")}
                message={t("profile.emailReminders.confirmDeleteMessage", {
                    name:
                        pendingDelete?.subject ||
                        pendingDelete?.taskName ||
                        pendingDelete?.recipientEmail ||
                        "",
                })}
                confirmText={t("profile.emailReminders.delete")}
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
