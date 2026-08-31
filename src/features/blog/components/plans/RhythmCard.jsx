import React from "react";
import { useTranslation } from "react-i18next";

const parseLocalDate = (value) => {
    const [year, month, day] = String(value || "")
        .split("-")
        .map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
};

const RhythmCard = ({ rhythm }) => {
    const { t, i18n } = useTranslation();
    const days = rhythm?.days || [];
    const maxCount = Math.max(...days.map((day) => Number(day.count) || 0), 1);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const weekday = new Intl.DateTimeFormat(i18n?.resolvedLanguage || "zh-CN", {
        weekday: "narrow",
    });

    return (
        <div className="shrink-0 rounded-[20px] bg-white p-5 shadow-sm">
            <div className="text-title text-ink">
                {t("blogPlans.publishRhythm")}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5">
                <div className="text-caption text-ink-muted">
                    {t("blogPlans.localDailyPublish")}
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-[24px] font-semibold leading-tight text-ink">
                        {Number(rhythm?.dailyAverage || 0).toFixed(1)}
                    </span>
                    <span className="text-caption text-ink-muted">
                        {t("blogPlans.postsPerDay")}
                    </span>
                </div>
                <div className="mt-4 grid h-[58px] grid-cols-7 items-end gap-3">
                    {days.map((day) => {
                        const date = parseLocalDate(day.date);
                        const isToday = day.date === todayKey;
                        const height = Math.max(
                            5,
                            Math.round(
                                ((Number(day.count) || 0) / maxCount) * 32,
                            ),
                        );
                        return (
                            <div
                                key={day.date}
                                className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                            >
                                <div
                                    data-testid="rhythm-bar"
                                    aria-label={`${day.date}: ${day.count}`}
                                    className={`w-2 rounded-full ${isToday ? "bg-accent" : "bg-[#E9ECF7]"}`}
                                    style={{ height: `${height}px` }}
                                />
                                <span
                                    className={`text-[10px] leading-none ${isToday ? "font-semibold text-accent" : "text-ink-muted"}`}
                                >
                                    {date ? weekday.format(date) : "—"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RhythmCard;
