import React from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import { PLAN_STATUS } from "../../services/blogPlanService";

const isToday = (instant) => {
    if (!instant) return false;
    const date = new Date(instant);
    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
};

const UpcomingCard = ({ plans }) => {
    const { t } = useTranslation();
    const items = plans
        .filter(
            (plan) =>
                plan.status === PLAN_STATUS.ACTIVE && isToday(plan.nextRunAt),
        )
        .sort((a, b) => new Date(a.nextRunAt) - new Date(b.nextRunAt));

    return (
        <div className="flex min-h-[220px] flex-1 flex-col rounded-[20px] bg-white p-5 shadow-sm">
            <div className="text-title text-ink">
                {t("blogPlans.upcomingToday")}
            </div>
            {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                    <CalendarClock className="h-8 w-8 text-ink-faint" />
                    <div className="mt-3 text-caption text-ink-muted">
                        {t("blogPlans.noUpcomingToday")}
                    </div>
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                                <CalendarClock className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div
                                    className="truncate text-caption font-semibold text-ink"
                                    title={item.topic}
                                >
                                    {item.topic}
                                </div>
                                <div className="mt-1 text-micro text-ink-muted">
                                    {new Date(
                                        item.nextRunAt,
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingCard;
