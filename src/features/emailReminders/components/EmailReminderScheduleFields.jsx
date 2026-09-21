import CustomSelect from "@shared/ui/forms/CustomSelect";
import TimezoneSelect from "@shared/ui/forms/TimezoneSelect";
import TimeInput from "@shared/ui/forms/TimeInput";

const FREQUENCIES = ["ONCE", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"];

const EmailReminderScheduleFields = ({
    t,
    form,
    weekdayOptions,
    monthDayOptions,
    onFieldChange,
    onFrequencyChange,
    onRecurrenceDayChange,
    onTimezoneChange,
    onDateTimeClick,
}) => (
    <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-black text-ink-secondary">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-muted text-micro font-black text-accent-fg">
                3
            </span>
            {t("profile.emailReminders.sectionSchedule")}
        </div>

        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {form.frequency === "WEEKLY" || form.frequency === "MONTHLY" ? (
                    <label className="block w-full shrink-0 sm:w-[7.5rem]">
                        <span className="mb-1 block text-micro font-bold text-ink-muted">
                            {form.frequency === "WEEKLY"
                                ? t("profile.emailReminders.weekday")
                                : t("profile.emailReminders.monthDayLabel")}
                        </span>
                        <CustomSelect
                            size="sm"
                            options={
                                form.frequency === "WEEKLY"
                                    ? weekdayOptions
                                    : monthDayOptions
                            }
                            value={String(form.recurrenceDay)}
                            onChange={onRecurrenceDayChange}
                        />
                    </label>
                ) : null}

                {form.frequency === "CUSTOM" ? (
                    <label className="block w-full shrink-0 sm:w-[7.5rem]">
                        <span className="mb-1 block text-micro font-bold text-ink-muted">
                            {t("profile.emailReminders.intervalDays")}
                        </span>
                        <input
                            type="number"
                            min={1}
                            max={365}
                            value={form.intervalDays}
                            onChange={onFieldChange("intervalDays")}
                            className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs font-medium text-ink-secondary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                        />
                    </label>
                ) : null}

                <label
                    className={`block w-full shrink-0 ${form.frequency === "ONCE" ? "sm:w-[14.5rem]" : "sm:w-[8.5rem]"}`}
                >
                    <span className="mb-1 block text-micro font-bold text-ink-muted">
                        {form.frequency === "ONCE"
                            ? t("profile.emailReminders.scheduledAt")
                            : t("profile.emailReminders.sendTime")}
                    </span>
                    {form.frequency === "ONCE" ? (
                        <input
                            type="datetime-local"
                            required
                            value={form.scheduledLocal}
                            onChange={onFieldChange("scheduledLocal")}
                            onClick={onDateTimeClick}
                            className="relative h-9 w-full min-w-0 cursor-pointer rounded-lg border border-border bg-canvas px-2.5 text-xs font-medium text-ink-secondary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                    ) : (
                        <TimeInput
                            size="sm"
                            required
                            openOnClick
                            value={form.sendTime}
                            onChange={onFieldChange("sendTime")}
                        />
                    )}
                </label>

                <label className="block min-w-0 flex-1">
                    <span className="mb-1 block text-micro font-bold text-ink-muted">
                        {t("profile.emailReminders.timezone")}
                    </span>
                    <TimezoneSelect
                        size="sm"
                        value={form.timezone}
                        onChange={onTimezoneChange}
                    />
                </label>
            </div>

            <div>
                <span className="mb-1.5 block text-micro font-bold text-ink-muted">
                    {t("profile.emailReminders.frequency")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                    {FREQUENCIES.map((item) => {
                        const active = form.frequency === item;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onFrequencyChange(item)}
                                className={`flex min-h-11 items-center rounded-lg border px-3 py-2 text-caption font-bold transition ${
                                    active
                                        ? "border-accent bg-accent text-white"
                                        : "border-border bg-canvas text-ink-muted hover:border-accent/30 hover:text-accent"
                                }`}
                            >
                                {t(
                                    `profile.emailReminders.frequencies.${item.toLowerCase()}`,
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    </section>
);

export default EmailReminderScheduleFields;
