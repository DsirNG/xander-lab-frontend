import PropTypes from "prop-types";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";

const PlanFormSummary = ({ t, form, nextRun, planTypes }) => (
    <aside className="flex flex-col rounded-2xl border border-border bg-surface-muted p-5 text-ink-secondary">
        <div className="text-title text-ink">{t("blogPlans.title")}</div>
        <div className="mt-5 text-caption font-semibold text-ink">
            {t("blogPlans.nextRun")}
        </div>
        <div className="mt-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-title text-ink">{nextRun.date}</span>
            <span className="text-caption text-ink-muted">
                {nextRun.weekday}
            </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-body text-ink">
            <Clock3 className="h-4 w-4 text-ink-faint" /> {form.triggerTime}
        </div>

        <div className="my-5 h-px bg-border" />
        <div className="space-y-4">
            <div>
                <div className="text-micro text-ink-faint">
                    {t("blogPlans.topic")}
                </div>
                <div className="mt-1 break-words text-body font-semibold text-ink">
                    {form.topic.trim() || t("blogPlans.topicPlaceholder")}
                </div>
            </div>
            <div>
                <div className="text-micro text-ink-faint">
                    {t("blogPlans.timezone")}
                </div>
                <div className="mt-1 text-body font-semibold text-ink">
                    {form.timezone}
                </div>
            </div>
            <div>
                <div className="text-micro text-ink-faint">
                    {t("blogPlans.scheduleType")}
                </div>
                <div className="mt-1 text-body font-semibold text-ink">
                    {t(
                        `blogPlans.${planTypes.find(([value]) => value === form.scheduleType)?.[1]}`,
                    )}
                </div>
            </div>
            <div>
                <div className="text-micro text-ink-faint">
                    {t("blogPlans.publishPlatforms")}
                </div>
                <div className="mt-1 text-body font-semibold text-ink">
                    {[
                        t("blogPlans.localPlatform"),
                        form.syncCsdn && "CSDN",
                        form.syncJuejin && "掘金",
                    ]
                        .filter(Boolean)
                        .join(" · ")}
                </div>
            </div>
            {form.audience.trim() ? (
                <div>
                    <div className="text-micro text-ink-faint">
                        {t("blogPlans.audience")}
                    </div>
                    <div className="mt-1 text-body font-semibold text-ink">
                        {form.audience.trim()}
                    </div>
                </div>
            ) : null}
            {form.tone.trim() ? (
                <div>
                    <div className="text-micro text-ink-faint">
                        {t("blogPlans.tone")}
                    </div>
                    <div className="mt-1 text-body font-semibold text-ink">
                        {form.tone.trim()}
                    </div>
                </div>
            ) : null}
        </div>

        <div className="mt-auto pt-5">
            <div className="flex gap-3 rounded-xl bg-accent-soft p-4 text-caption text-accent-fg">
                <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                <span>{t("blogPlans.customDailyHint")}</span>
            </div>
        </div>
    </aside>
);

PlanFormSummary.propTypes = {
    t: PropTypes.func.isRequired,
    form: PropTypes.shape({
        triggerTime: PropTypes.string.isRequired,
        topic: PropTypes.string.isRequired,
        timezone: PropTypes.string.isRequired,
        scheduleType: PropTypes.string.isRequired,
        syncCsdn: PropTypes.bool.isRequired,
        syncJuejin: PropTypes.bool.isRequired,
        audience: PropTypes.string.isRequired,
        tone: PropTypes.string.isRequired,
    }).isRequired,
    nextRun: PropTypes.shape({
        date: PropTypes.string.isRequired,
        weekday: PropTypes.string.isRequired,
    }).isRequired,
    planTypes: PropTypes.arrayOf(PropTypes.array).isRequired,
};

export default PlanFormSummary;
