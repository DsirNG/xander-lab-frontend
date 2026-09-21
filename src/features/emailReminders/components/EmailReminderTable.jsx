import { useMemo } from "react";
import { CalendarClock, Mail, Pause, Play, Search, Trash2 } from "lucide-react";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import DataTable from "@shared/ui/data-display/DataTable";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import {
    normalizeFrequency,
    normalizeStatus,
    STATUS_STYLES,
} from "../utils/emailReminderStatus";

const EmailReminderTable = ({
    reminders,
    isLoading,
    loadError,
    loadReminders,
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    statusOptions,
    statusFilter,
    onStatusFilterChange,
    searchQuery,
    onSearchChange,
    actionKey,
    formatDate,
    formatSchedule,
    handleStatusChange,
    onDeleteRequest,
    t,
}) => {
    const columns = useMemo(
        () => [
            {
                key: "subject",
                title: t("profile.emailReminders.taskName"),
                width: "28%",
                render: (reminder) => {
                    const status = normalizeStatus(reminder.status);
                    const statusStyle = STATUS_STYLES[status];
                    const frequency = normalizeFrequency(reminder.frequency);
                    return (
                        <div className="flex min-w-0 items-center gap-2">
                            <span
                                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${statusStyle.rowIcon}`}
                            >
                                <Mail className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div
                                    className="truncate text-sm font-semibold text-ink"
                                    title={reminder.subject}
                                >
                                    {reminder.subject}
                                </div>
                                <div className="mt-0.5 truncate text-caption font-medium text-ink-faint">
                                    {t(
                                        `profile.emailReminders.frequencies.${frequency.toLowerCase()}`,
                                    )}
                                    {reminder.timezone
                                        ? ` · ${reminder.timezone}`
                                        : ""}
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "recipientEmail",
                title: t("profile.emailReminders.recipientEmail"),
                width: "22%",
                render: (reminder) => (
                    <span
                        className="block truncate text-sm font-medium text-ink-muted"
                        title={reminder.recipientEmail}
                    >
                        {reminder.recipientEmail}
                    </span>
                ),
            },
            {
                key: "schedule",
                title: t("profile.emailReminders.scheduleColumn"),
                width: "24%",
                render: (reminder) => {
                    const frequency = normalizeFrequency(reminder.frequency);
                    const scheduleText = formatSchedule(reminder);
                    return (
                        <>
                            <span
                                className="block truncate text-sm font-medium text-ink-muted"
                                title={scheduleText}
                            >
                                {scheduleText}
                            </span>
                            {frequency !== "ONCE" ? (
                                <span
                                    className="mt-1 block truncate text-caption font-medium text-ink-faint"
                                    title={formatDate(reminder.scheduledAt)}
                                >
                                    {t("profile.emailReminders.nextRun", {
                                        time: formatDate(reminder.scheduledAt),
                                    })}
                                </span>
                            ) : null}
                        </>
                    );
                },
            },
            {
                key: "status",
                title: t("profile.emailReminders.statusLabel"),
                width: "14%",
                render: (reminder) => {
                    const status = normalizeStatus(reminder.status);
                    return (
                        <span
                            className={`inline-flex max-w-full truncate items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status].badge}`}
                        >
                            {t(
                                `profile.emailReminders.status.${status.toLowerCase()}`,
                            )}
                        </span>
                    );
                },
            },
            {
                key: "actions",
                title: t("profile.emailReminders.actions"),
                width: "8%",
                render: (reminder) => {
                    const status = normalizeStatus(reminder.status);
                    const canToggle =
                        status === "PENDING" || status === "PAUSED";
                    const canDelete = status !== "SENDING";
                    const isStatusLoading =
                        actionKey === `status-${reminder.id}`;
                    const items = [];
                    if (canToggle) {
                        items.push({
                            key: "toggle",
                            label:
                                status === "PAUSED"
                                    ? t("profile.emailReminders.resume")
                                    : t("profile.emailReminders.pause"),
                            icon: status === "PAUSED" ? Play : Pause,
                            disabled: Boolean(actionKey),
                            loading: isStatusLoading,
                            onClick: () => handleStatusChange(reminder),
                        });
                    }
                    if (canDelete) {
                        items.push({
                            key: "delete",
                            label: t("profile.emailReminders.delete"),
                            icon: Trash2,
                            danger: true,
                            disabled: Boolean(actionKey),
                            onClick: () => onDeleteRequest(reminder),
                        });
                    }
                    return <RowActionsMenu actions={items} size="sm" />;
                },
            },
        ],
        [
            actionKey,
            formatDate,
            formatSchedule,
            handleStatusChange,
            onDeleteRequest,
            t,
        ],
    );

    return (
        <DataTable
            columns={columns}
            rows={reminders}
            loading={isLoading}
            loadingText={t("profile.emailReminders.loading")}
            error={loadError}
            errorTitle={t("profile.emailReminders.loadError")}
            onRetry={loadReminders}
            onRetryLabel={t("profile.emailReminders.retry")}
            emptyTitle={t("profile.emailReminders.emptyTitle")}
            emptyHint={t("profile.emailReminders.emptyHint")}
            emptyIcon={CalendarClock}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            paginationDisabled={isLoading}
            header={
                <div className="flex shrink-0 flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="text-xs font-black text-ink">
                        {t("profile.emailReminders.taskList")}
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="w-full sm:w-32">
                            <CustomSelect
                                size="sm"
                                options={statusOptions}
                                value={statusFilter}
                                onChange={onStatusFilterChange}
                            />
                        </div>
                        <label className="relative block w-full min-w-0 sm:w-52">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) =>
                                    onSearchChange(event.target.value)
                                }
                                placeholder={t(
                                    "profile.emailReminders.searchPlaceholder",
                                )}
                                className="h-8 w-full rounded-lg bg-surface pl-8 pr-2.5 text-xs font-medium text-ink-secondary outline-none transition placeholder:text-ink-faint focus:bg-canvas focus:ring-2 focus:ring-accent/15"
                            />
                        </label>
                    </div>
                </div>
            }
        />
    );
};

export default EmailReminderTable;
