import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarClock,
    Eye,
    Loader2,
    Pencil,
    Trash2,
    Zap,
} from "lucide-react";
import Pagination from "@components/common/Pagination";
import LoadingSpinner from "@components/common/LoadingSpinner";
import Button from "@components/common/Button";
import { blogPlanService, PLAN_STATUS } from "../services/blogPlanService";
import { useToast } from "@/hooks/useToast";
import { usePlanActions } from "../hooks/usePlanActions";
import PlanStatusBadge from "../components/plans/PlanStatusBadge";
import PlanFormModal from "../components/plans/PlanFormModal";
import RunDetailModal from "../components/plans/RunDetailModal";

const RUN_PAGE_SIZE = 10;

/**
 * 定时发文计划详情页：计划信息 + 操作 + 执行记录（分页）
 */
const BlogPlanDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [formOpen, setFormOpen] = useState(false);

    const [runs, setRuns] = useState([]);
    const [runsTotal, setRunsTotal] = useState(0);
    const [runsPage, setRunsPage] = useState(1);
    const [runsLoading, setRunsLoading] = useState(true);
    const [detailRun, setDetailRun] = useState(null);

    const loadPlan = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const data = await blogPlanService.getPlan(id);
            setPlan(data);
            setLoading(false);
        } catch (error) {
            if (error?.isCancelled) return;
            setNotFound(true);
            setLoading(false);
        }
    }, [id]);

    const loadRuns = useCallback(
        async (page) => {
            setRunsLoading(true);
            try {
                const data = await blogPlanService.listRuns(id, {
                    page,
                    size: RUN_PAGE_SIZE,
                });
                setRuns(data?.records || []);
                setRunsTotal(Number(data?.total) || 0);
                setRunsLoading(false);
            } catch (error) {
                if (error?.isCancelled) return;
                toast.error(t("blogPlans.loadFailed"));
                setRunsLoading(false);
            }
        },
        [id, t, toast],
    );

    useEffect(() => {
        loadPlan();
    }, [loadPlan]);

    useEffect(() => {
        setRunsPage(1);
    }, [plan?.id]);

    useEffect(() => {
        if (plan) loadRuns(runsPage);
    }, [plan, runsPage, loadRuns]);

    const actions = usePlanActions({ onChanged: loadPlan, t });

    const infoRow = (label, value) => (
        <div className="flex items-start justify-between gap-6 py-2 text-sm">
            <span className="shrink-0 text-ink-faint">{label}</span>
            <span className="break-all text-right text-ink-secondary">
                {value || "—"}
            </span>
        </div>
    );

    const runError = (run) =>
        run.errorMessage ||
        (run.reviewPass === false ? run.reviewReason : "") ||
        run.csdnErrorMessage ||
        run.juejinErrorMessage;

    if (loading) return <LoadingSpinner fullScreen />;

    if (notFound || !plan) {
        return (
            <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
                <div className="text-sm font-medium text-ink-faint">
                    {t("blogPlans.notFound")}
                </div>
                <Button
                    onClick={() => navigate("/workspace/plans")}
                    variant="outline"
                    size="md"
                >
                    {t("blogPlans.backToList")}
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <Button
                onClick={() => navigate("/workspace/plans")}
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
            >
                {t("blogPlans.backToList")}
            </Button>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
                <div className="mt-3 rounded-2xl border border-border bg-canvas/60 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="truncate text-xl font-bold text-ink">
                                {plan.topic}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                                <span>
                                    {plan.triggerTimes?.length > 0
                                        ? plan.triggerTimes.join(" / ")
                                        : plan.triggerTime}{" "}
                                    ({plan.timezone}) ·{" "}
                                    {t("blogPlans.syncCsdn")}:{" "}
                                    {plan.syncCsdn
                                        ? t("blogPlans.yes")
                                        : t("blogPlans.no")}{" "}
                                    · {t("blogPlans.syncJuejin")}:{" "}
                                    {plan.syncJuejin
                                        ? t("blogPlans.yes")
                                        : t("blogPlans.no")}
                                </span>
                                {plan.runOnce && (
                                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-fg">
                                        {t("blogPlans.oneShot")}
                                    </span>
                                )}
                            </div>
                        </div>
                        <PlanStatusBadge status={plan.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-x-8 divide-y divide-border sm:grid-cols-2 sm:gap-y-0 sm:divide-y-0">
                        <div className="divide-y divide-border">
                            {infoRow(
                                t("blogPlans.nextRun"),
                                plan.nextRunAt
                                    ? new Date(
                                          plan.nextRunAt,
                                      ).toLocaleDateString()
                                    : "—",
                            )}
                            {infoRow(
                                t("blogPlans.lastRunAt"),
                                plan.lastRunAt
                                    ? new Date(plan.lastRunAt).toLocaleString()
                                    : "—",
                            )}
                        </div>
                        <div className="divide-y divide-border">
                            {infoRow(t("blogPlans.audience"), plan.audience)}
                            {infoRow(t("blogPlans.tone"), plan.tone)}
                        </div>
                    </div>
                    {plan.errorMessage && (
                        <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {t("blogPlans.lastError")}: {plan.errorMessage}
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {(plan.status === PLAN_STATUS.ACTIVE ||
                            plan.status === PLAN_STATUS.PAUSED) && (
                            <>
                                {!plan.runOnce && (
                                    <Button
                                        onClick={() => actions.trigger(plan)}
                                        disabled={
                                            !!actions.busyId ||
                                            plan.status === PLAN_STATUS.RUNNING
                                        }
                                        loading={actions.busyId === plan.id}
                                        variant="primary"
                                        size="lg"
                                        icon={Zap}
                                    >
                                        {t("blogPlans.triggerNow")}
                                    </Button>
                                )}
                                {plan.status === PLAN_STATUS.ACTIVE ? (
                                    <Button
                                        onClick={() => actions.pause(plan)}
                                        disabled={!!actions.busyId}
                                        variant="outline"
                                        size="lg"
                                    >
                                        {t("blogPlans.pause")}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => actions.resume(plan)}
                                        disabled={!!actions.busyId}
                                        variant="outline"
                                        size="lg"
                                    >
                                        {t("blogPlans.resume")}
                                    </Button>
                                )}
                                {!plan.runOnce && (
                                    <Button
                                        onClick={() => setFormOpen(true)}
                                        disabled={!!actions.busyId}
                                        variant="outline"
                                        size="lg"
                                        icon={Pencil}
                                    >
                                        {t("blogPlans.edit")}
                                    </Button>
                                )}
                            </>
                        )}
                        {plan.status !== PLAN_STATUS.RUNNING && (
                            <Button
                                onClick={() => actions.remove(plan)}
                                disabled={!!actions.busyId}
                                variant="dangerOutline"
                                size="lg"
                                icon={Trash2}
                            >
                                {t("blogPlans.delete")}
                            </Button>
                        )}
                        {plan.status !== PLAN_STATUS.RUNNING &&
                            plan.status !== PLAN_STATUS.CANCELLED &&
                            plan.status !== PLAN_STATUS.FINISHED &&
                            plan.status !== PLAN_STATUS.FAILED && (
                                <Button
                                    onClick={() => actions.cancel(plan)}
                                    disabled={!!actions.busyId}
                                    variant="outline"
                                    size="lg"
                                >
                                    {t("blogPlans.cancel")}
                                </Button>
                            )}
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-ink">
                            {t("blogPlans.runHistory")}
                        </div>
                        <span className="text-xs text-ink-faint">
                            {t("blogPlans.totalRuns", { count: runsTotal })}
                        </span>
                    </div>

                    {runsLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
                        </div>
                    ) : runs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                            <div className="text-sm text-ink-faint">
                                {t("blogPlans.noRuns")}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-surface-muted text-left text-ink-faint">
                                            <th className="px-4 py-2.5 font-medium">
                                                {t("blogPlans.time")}
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                {t("blogPlans.triggerType")}
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                {t("blogPlans.status")}
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                CSDN
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                {t("blogPlans.juejin")}
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                {t("blogPlans.result")}
                                            </th>
                                            <th className="px-4 py-2.5 text-right font-medium">
                                                {t("blogPlans.detail")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runs.map((run) => {
                                            const error = runError(run);
                                            return (
                                                <tr
                                                    key={run.id}
                                                    className="border-t hover:bg-surface/40"
                                                >
                                                    <td className="whitespace-nowrap px-4 py-2.5">
                                                        {run.scheduledAt
                                                            ? new Date(
                                                                  run.scheduledAt,
                                                              ).toLocaleString()
                                                            : "—"}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2.5">
                                                        {run.triggerType ===
                                                        "MANUAL"
                                                            ? t(
                                                                  "blogPlans.triggerManual",
                                                              )
                                                            : t(
                                                                  "blogPlans.triggerAuto",
                                                              )}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        {t(
                                                            `blogPlans.runStatus.${run.status}`,
                                                        ) || run.status}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2.5">
                                                        {run.csdnStatus || "—"}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2.5">
                                                        {run.juejinStatus ||
                                                            "—"}
                                                    </td>
                                                    <td className="max-w-[14rem] px-4 py-2.5">
                                                        {run.localPostId ? (
                                                            <a
                                                                href={`/blog/${run.localPostId}`}
                                                                className="text-accent hover:underline"
                                                            >
                                                                #
                                                                {
                                                                    run.localPostId
                                                                }
                                                            </a>
                                                        ) : error ? (
                                                            <span
                                                                className="line-clamp-1 text-red-600 dark:text-red-400"
                                                                title={error}
                                                            >
                                                                {error}
                                                            </span>
                                                        ) : run.csdnUrl ? (
                                                            <a
                                                                href={
                                                                    run.csdnUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-accent hover:underline"
                                                            >
                                                                CSDN
                                                            </a>
                                                        ) : run.juejinUrl ? (
                                                            <a
                                                                href={
                                                                    run.juejinUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-accent hover:underline"
                                                            >
                                                                {t(
                                                                    "blogPlans.juejin",
                                                                )}
                                                            </a>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <Button
                                                            onClick={() =>
                                                                setDetailRun(
                                                                    run,
                                                                )
                                                            }
                                                            variant="outline"
                                                            size="xs"
                                                            icon={Eye}
                                                        >
                                                            {t(
                                                                "blogPlans.viewDetail",
                                                            )}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                page={runsPage}
                                pageSize={RUN_PAGE_SIZE}
                                total={runsTotal}
                                onPageChange={setRunsPage}
                                className="!border-x-0 !border-b-0"
                            />
                        </div>
                    )}
                </div>
            </div>

            <PlanFormModal
                isOpen={formOpen}
                plan={plan}
                onClose={() => setFormOpen(false)}
                onSaved={() => {
                    loadPlan();
                    loadRuns(runsPage);
                }}
            />
            <RunDetailModal
                isOpen={!!detailRun}
                run={detailRun}
                onClose={() => setDetailRun(null)}
            />
        </div>
    );
};

export default BlogPlanDetail;
