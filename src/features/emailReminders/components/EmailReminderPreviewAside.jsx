const EmailReminderPreviewAside = ({
    t,
    form,
    scheduleLabel,
    usesLayoutTemplate,
    previewHtml,
    previewHeight,
    previewFrameRef,
    onPreviewLoad,
}) => (
    <aside className="space-y-4 border-t border-border bg-surface/70 p-5 lg:border-l lg:border-t-0">
        <div className="rounded-xl border border-border bg-canvas p-4">
            <div className="text-xs font-black text-ink">
                {t("profile.emailReminders.overviewTitle")}
            </div>
            <dl className="mt-3 space-y-2 text-caption">
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">
                        {t("profile.emailReminders.recipientEmail")}
                    </dt>
                    <dd className="max-w-[60%] truncate font-semibold text-ink-secondary">
                        {form.recipientEmail ||
                            t("profile.emailReminders.notSet")}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">
                        {t("profile.emailReminders.scheduledAt")}
                    </dt>
                    <dd className="max-w-[60%] text-right font-semibold text-ink-secondary">
                        {scheduleLabel}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">
                        {t("profile.emailReminders.frequency")}
                    </dt>
                    <dd className="font-semibold text-ink-secondary">
                        {t(
                            `profile.emailReminders.frequencies.${form.frequency.toLowerCase()}`,
                        )}
                    </dd>
                </div>
                {usesLayoutTemplate ? (
                    <div className="flex justify-between gap-3">
                        <dt className="text-ink-faint">
                            {t("profile.emailReminders.template")}
                        </dt>
                        <dd className="font-semibold text-ink-secondary">
                            {t(
                                `profile.emailReminders.templates.${form.templateId}`,
                            )}
                        </dd>
                    </div>
                ) : null}
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">
                        {t("profile.emailReminders.timezone")}
                    </dt>
                    <dd className="max-w-[60%] truncate text-right font-semibold text-ink-secondary">
                        {form.timezone}
                    </dd>
                </div>
            </dl>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-canvas">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-xs font-black text-ink">
                    {t("profile.emailReminders.previewTitle")}
                </span>
                <span className="text-micro font-bold text-ink-faint">
                    {usesLayoutTemplate
                        ? t(
                              `profile.emailReminders.templates.${form.templateId}`,
                          )
                        : t("profile.emailReminders.customPreviewBadge")}
                </span>
            </div>
            <div className="bg-surface-muted/80 p-2">
                <div className="max-h-[min(560px,52dvh)] overflow-y-auto rounded-lg border border-border bg-canvas">
                    <iframe
                        ref={previewFrameRef}
                        title={t("profile.emailReminders.previewTitle")}
                        srcDoc={previewHtml}
                        sandbox="allow-same-origin"
                        onLoad={onPreviewLoad}
                        className="block w-full border-0 bg-canvas"
                        style={{ height: `${previewHeight}px` }}
                    />
                </div>
            </div>
        </div>
    </aside>
);

export default EmailReminderPreviewAside;
