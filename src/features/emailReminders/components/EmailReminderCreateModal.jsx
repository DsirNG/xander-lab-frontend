import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import Modal from "@shared/ui/overlays/Modal";
import Button from "@shared/ui/primitives/Button";
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
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title={t("profile.emailReminders.addTitle")}
                width="max-w-5xl"
                height={780}
                bodyScrollable={false}
            >
                <form
                    className="flex h-full min-h-0 flex-col"
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

                    <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-canvas py-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isCreating}
                        >
                            {t("profile.emailReminders.cancelDelete")}
                        </Button>
                        <Button
                            type="submit"
                            loading={isCreating}
                            icon={CalendarClock}
                        >
                            {isCreating
                                ? t("profile.emailReminders.creating")
                                : t("profile.emailReminders.createAndSave")}
                        </Button>
                    </footer>
                </form>
            </Modal>

            <EmailReminderTemplatePicker
                isOpen={isTemplatePickerOpen}
                t={t}
                templateCards={templateCards}
                selectedTemplateId={form.templateId}
                onClose={() => setIsTemplatePickerOpen(false)}
                onSelect={applyTemplate}
            />
        </>
    );
};

export default EmailReminderCreateModal;
