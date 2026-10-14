import { useState } from "react";
import { Pause, Play, X, Pencil, RotateCcw } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import PlanStatusBadge from "./PlanStatusBadge";
import { blogPlanService } from "../../services/blogPlanService";
import { useToast } from "@shared/hooks/useToast";

const PlanSeriesList = ({ t, series, onEdit, onChanged }) => {
    const toast = useToast();
    const [busyId, setBusyId] = useState(null);
    const act = async (item, action) => {
        if (
            action === "CANCEL" &&
            !window.confirm(t("blogPlans.seriesCancelConfirm"))
        ) {
            return;
        }
        if (
            action === "RETRY_FAILED" &&
            !window.confirm(t("blogPlans.seriesRetryConfirm"))
        ) {
            return;
        }
        setBusyId(item.id);
        try {
            await blogPlanService.updateSeriesStatus(item.id, action);
            await onChanged?.();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || t("blogPlans.actionFailed"),
            );
        } finally {
            setBusyId(null);
        }
    };
    if (!series.length) return null;
    return (
        <section className="shrink-0 border-b border-border px-5 py-4 sm:px-8">
            <h2 className="mb-3 text-sm font-semibold text-ink">
                {t("blogPlans.seriesDrafts")}
            </h2>
            <div className="grid max-h-56 grid-cols-1 gap-3 overflow-y-auto xl:grid-cols-2">
                {series.map((item) => (
                    <article
                        key={item.id}
                        className="rounded-xl border border-border bg-surface p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-ink">
                                    {item.title}
                                </h3>
                                <p className="mt-1 truncate text-xs text-ink-muted">
                                    {item.topic}
                                </p>
                            </div>
                            <PlanStatusBadge status={item.status} />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-muted">
                            <span>
                                {t("blogPlans.seriesProgress", {
                                    done: item.finishedItems || 0,
                                    total: item.topics.length,
                                })}
                            </span>
                            <span>
                                {item.startDate} · {item.triggerTime} ·{" "}
                                {item.timezone}
                            </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {item.failedItems > 0 &&
                                ["ACTIVE", "FAILED"].includes(item.status) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        icon={RotateCcw}
                                        disabled={busyId === item.id}
                                        onClick={() =>
                                            act(item, "RETRY_FAILED")
                                        }
                                    >
                                        {t("blogPlans.seriesRetryFailed", {
                                            count: item.failedItems,
                                        })}
                                    </Button>
                                )}
                            {item.status === "DRAFT" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    icon={Pencil}
                                    onClick={() => onEdit(item)}
                                >
                                    {t("blogPlans.edit")}
                                </Button>
                            )}
                            {item.status === "ACTIVE" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    icon={Pause}
                                    disabled={busyId === item.id}
                                    onClick={() => act(item, "PAUSE")}
                                >
                                    {t("blogPlans.pause")}
                                </Button>
                            )}
                            {item.status === "PAUSED" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    icon={Play}
                                    disabled={busyId === item.id}
                                    onClick={() => act(item, "RESUME")}
                                >
                                    {t("blogPlans.resume")}
                                </Button>
                            )}
                            {["ACTIVE", "PAUSED", "FAILED"].includes(
                                item.status,
                            ) && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    icon={X}
                                    disabled={busyId === item.id}
                                    onClick={() => act(item, "CANCEL")}
                                >
                                    {t("blogPlans.cancel")}
                                </Button>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default PlanSeriesList;
