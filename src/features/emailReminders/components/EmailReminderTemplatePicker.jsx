import { X } from "lucide-react";
import { TEMPLATE_SWATCH } from "../utils/emailReminderTemplates";

const EmailReminderTemplatePicker = ({
    isOpen,
    t,
    templateCards,
    selectedTemplateId,
    onClose,
    onSelect,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink/45 p-3 sm:p-6"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="email-template-picker-title"
                className="flex max-h-[min(640px,88dvh)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-canvas shadow-2xl"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5">
                    <div>
                        <div
                            id="email-template-picker-title"
                            className="text-sm font-black text-ink"
                        >
                            {t("profile.emailReminders.templatePickerTitle")}
                        </div>
                        <div className="mt-0.5 text-micro font-medium text-ink-faint">
                            {t("profile.emailReminders.templatePickerHint")}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-surface-muted hover:text-ink-muted"
                        aria-label={t("common.aria.close", "Close")}
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
                                onClick={() => onSelect(card.id)}
                                className={`w-[220px] shrink-0 overflow-hidden rounded-xl text-left transition hover:bg-surface-muted hover:shadow-md lg:w-0 lg:min-w-0 lg:flex-1 ${
                                    selectedTemplateId === card.id
                                        ? "bg-accent-soft text-ink"
                                        : "bg-surface"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className={`h-2 w-8 shrink-0 rounded-full bg-gradient-to-r ${TEMPLATE_SWATCH[card.id]}`}
                                        />
                                        <span className="truncate text-caption font-black text-ink-secondary">
                                            {t(
                                                `profile.emailReminders.templates.${card.id}`,
                                            )}
                                        </span>
                                    </div>
                                    <span className="shrink-0 text-micro font-bold text-accent">
                                        {t(
                                            "profile.emailReminders.useThisTemplate",
                                        )}
                                    </span>
                                </div>
                                <div className="relative h-48 w-full overflow-hidden bg-surface-muted">
                                    <iframe
                                        title={t(
                                            `profile.emailReminders.templates.${card.id}`,
                                        )}
                                        srcDoc={card.previewHtml}
                                        sandbox=""
                                        scrolling="no"
                                        tabIndex={-1}
                                        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                                        style={{
                                            width: "250%",
                                            height: "250%",
                                            transform: "scale(0.4)",
                                        }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailReminderTemplatePicker;
