import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, Loader2, X } from "lucide-react";
import EmailReminderTemplatePicker from "./EmailReminderTemplatePicker";
import EmailReminderPreviewAside from "./EmailReminderPreviewAside";
import EmailReminderFormFields from "./EmailReminderFormFields";
import useEmailReminderForm from "../hooks/useEmailReminderForm";

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
        return Math.min(
            Math.max(height + 4, PREVIEW_MIN_HEIGHT),
            PREVIEW_MAX_HEIGHT * 3,
        );
    } catch {
        return PREVIEW_MIN_HEIGHT;
    }
};

const openDateTimePicker = (event) => {
    const input = event.currentTarget;
    if (typeof input.showPicker !== "function") return;
    try {
        input.showPicker();
    } catch {
        // Some browsers only allow showPicker from direct user gestures.
    }
};

const EmailReminderCreateModal = ({ isOpen, onClose, onCreated }) => {
    const { t } = useTranslation();
    const {
        form,
        isCreating,
        isTemplatePickerOpen,
        weekdayOptions,
        monthDayOptions,
        scheduleLabel,
        previewHtml,
        templateCards,
        usesLayoutTemplate,
        setForm,
        setIsTemplatePickerOpen,
        updateField,
        setFrequency,
        applyTemplate,
        handleCreate,
    } = useEmailReminderForm({ onClose, onCreated, t });

    const [previewHeight, setPreviewHeight] = useState(PREVIEW_MIN_HEIGHT);
    const previewFrameRef = useRef(null);

    const syncPreviewHeight = () => {
        const nextHeight = measureIframeDocumentHeight(previewFrameRef.current);
        setPreviewHeight(nextHeight);
    };

    useEffect(() => {
        setPreviewHeight(PREVIEW_MIN_HEIGHT);
        const timer = window.setTimeout(syncPreviewHeight, 60);
        return () => window.clearTimeout(timer);
    }, [previewHtml]);

    const handleClose = () => {
        if (isCreating) return;
        setIsTemplatePickerOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-ink/45 p-3 backdrop-blur-[1px] sm:p-6"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="email-reminder-create-title"
                className="flex max-h-[min(900px,92dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-canvas shadow-2xl shadow-ink/20"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent-soft text-accent">
                            <CalendarClock className="h-4 w-4" />
                        </span>
                        <div
                            id="email-reminder-create-title"
                            className="text-sm font-black text-ink"
                        >
                            {t("profile.emailReminders.addTitle")}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-surface-muted hover:text-ink-muted"
                        aria-label={t("common.aria.close", "Close")}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={handleCreate}
                >
                    <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.75fr)]">
                        <EmailReminderFormFields
                            t={t}
                            form={form}
                            weekdayOptions={weekdayOptions}
                            monthDayOptions={monthDayOptions}
                            usesLayoutTemplate={usesLayoutTemplate}
                            onFieldChange={updateField}
                            onOpenTemplatePicker={() =>
                                setIsTemplatePickerOpen(true)
                            }
                            onFrequencyChange={setFrequency}
                            onRecurrenceDayChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    recurrenceDay: Number(value),
                                }))
                            }
                            onTimezoneChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    timezone: value,
                                }))
                            }
                            onDateTimeClick={openDateTimePicker}
                        />

                        <EmailReminderPreviewAside
                            t={t}
                            form={form}
                            scheduleLabel={scheduleLabel}
                            usesLayoutTemplate={usesLayoutTemplate}
                            previewHtml={previewHtml}
                            previewHeight={previewHeight}
                            previewFrameRef={previewFrameRef}
                            onPreviewLoad={syncPreviewHeight}
                        />
                    </div>

                    <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-canvas px-5 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isCreating}
                            className="min-h-11 rounded-lg border border-border px-4 text-xs font-bold text-ink-muted transition hover:bg-surface disabled:opacity-60"
                        >
                            {t("profile.emailReminders.cancelDelete")}
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white shadow-sm shadow-accent/20 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isCreating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <CalendarClock className="h-3.5 w-3.5" />
                            )}
                            {isCreating
                                ? t("profile.emailReminders.creating")
                                : t("profile.emailReminders.createAndSave")}
                        </button>
                    </footer>
                </form>
            </div>

            <EmailReminderTemplatePicker
                isOpen={isTemplatePickerOpen}
                t={t}
                templateCards={templateCards}
                selectedTemplateId={form.templateId}
                onClose={() => setIsTemplatePickerOpen(false)}
                onSelect={applyTemplate}
            />
        </div>
    );
};

export default EmailReminderCreateModal;
