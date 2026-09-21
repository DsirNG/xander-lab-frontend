import PropTypes from "prop-types";
import { LayoutTemplate, Mail } from "lucide-react";
import EmailReminderScheduleFields from "./EmailReminderScheduleFields";

const EmailReminderFormFields = ({
    t,
    form,
    weekdayOptions,
    monthDayOptions,
    usesLayoutTemplate,
    onFieldChange,
    onOpenTemplatePicker,
    onFrequencyChange,
    onRecurrenceDayChange,
    onTimezoneChange,
    onDateTimeClick,
}) => (
    <div className="space-y-5 p-5">
        <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-black text-ink-secondary">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-muted text-micro font-black text-accent-fg">
                    1
                </span>
                {t("profile.emailReminders.sectionRecipient")}
            </div>
            <label className="block">
                <span className="mb-1 block text-micro font-bold text-ink-muted">
                    {t("profile.emailReminders.recipientEmail")}
                </span>
                <div className="relative">
                    <input
                        type="email"
                        required
                        value={form.recipientEmail}
                        onChange={onFieldChange("recipientEmail")}
                        placeholder={t(
                            "profile.emailReminders.recipientPlaceholder",
                        )}
                        className="h-9 w-full rounded-lg border border-border bg-canvas px-3 pr-9 text-xs font-medium text-ink-secondary outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                </div>
            </label>
        </section>

        <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-black text-ink-secondary">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-muted text-micro font-black text-accent-fg">
                    2
                </span>
                {t("profile.emailReminders.sectionContent")}
            </div>
            <div className="space-y-3">
                <label className="block">
                    <span className="mb-1 block text-micro font-bold text-ink-muted">
                        {t("profile.emailReminders.subject")}
                        <span className="ml-0.5 text-danger">*</span>
                    </span>
                    <input
                        type="text"
                        required
                        maxLength={160}
                        value={form.subject}
                        onChange={onFieldChange("subject")}
                        placeholder={t(
                            "profile.emailReminders.subjectPlaceholder",
                        )}
                        className="h-9 w-full rounded-lg border border-border bg-canvas px-3 text-xs font-medium text-ink-secondary outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                </label>

                <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-micro font-bold text-ink-muted">
                            {t("profile.emailReminders.message")}
                            <span className="ml-0.5 text-danger">*</span>
                        </span>
                        <button
                            type="button"
                            onClick={onOpenTemplatePicker}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-canvas px-2 py-1 text-micro font-bold text-ink-muted transition hover:border-accent/40 hover:text-accent"
                        >
                            <LayoutTemplate className="h-3 w-3" />
                            {t("profile.emailReminders.selectTemplate")}
                        </button>
                    </div>
                    <textarea
                        required
                        rows={7}
                        maxLength={10000}
                        value={form.message}
                        onChange={onFieldChange("message")}
                        placeholder={t(
                            "profile.emailReminders.messagePlaceholder",
                        )}
                        className="w-full resize-y rounded-lg border border-border bg-canvas px-3 py-2 font-mono text-xs font-medium leading-5 text-ink-secondary outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                    <div className="mt-1.5 text-micro font-medium leading-4 text-ink-faint">
                        {usesLayoutTemplate
                            ? t("profile.emailReminders.htmlContentHint", {
                                  template: t(
                                      `profile.emailReminders.templates.${form.templateId}`,
                                  ),
                              })
                            : t("profile.emailReminders.messageInputHint")}
                    </div>
                </div>
            </div>
        </section>

        <EmailReminderScheduleFields
            t={t}
            form={form}
            weekdayOptions={weekdayOptions}
            monthDayOptions={monthDayOptions}
            onFieldChange={onFieldChange}
            onFrequencyChange={onFrequencyChange}
            onRecurrenceDayChange={onRecurrenceDayChange}
            onTimezoneChange={onTimezoneChange}
            onDateTimeClick={onDateTimeClick}
        />
    </div>
);

EmailReminderFormFields.propTypes = {
    t: PropTypes.func.isRequired,
    form: PropTypes.shape({
        recipientEmail: PropTypes.string.isRequired,
        subject: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        templateId: PropTypes.string,
    }).isRequired,
    weekdayOptions: PropTypes.array.isRequired,
    monthDayOptions: PropTypes.array.isRequired,
    usesLayoutTemplate: PropTypes.bool.isRequired,
    onFieldChange: PropTypes.func.isRequired,
    onOpenTemplatePicker: PropTypes.func.isRequired,
    onFrequencyChange: PropTypes.func.isRequired,
    onRecurrenceDayChange: PropTypes.func.isRequired,
    onTimezoneChange: PropTypes.func.isRequired,
    onDateTimeClick: PropTypes.func.isRequired,
};

export default EmailReminderFormFields;
