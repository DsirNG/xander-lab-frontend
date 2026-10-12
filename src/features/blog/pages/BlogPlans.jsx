import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    Ban,
    CalendarClock,
    Eye,
    Pause,
    Pencil,
    Play,
    Plus,
    Sparkles,
    Trash2,
    Zap,
    RefreshCw,
} from "lucide-react";
import DataTable from "@shared/ui/data-display/DataTable";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import { PLAN_STATUS } from "../services/blogPlanService";
import useBlogPlans from "../hooks/useBlogPlans";
import { usePlanActions } from "../hooks/usePlanActions";
import PlanStatusBadge from "../components/plans/PlanStatusBadge";
import PlanFormModal from "../components/plans/PlanFormModal";
import PlanAiGenerateModal from "../components/plans/PlanAiGenerateModal";
import Button from "@shared/ui/primitives/Button";

/**
 * 定时发文计划：分页列表 + 自定义/AI 生成双入口 + 操作；执行记录进入详情页
 */
const BlogPlans = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formOpen, setFormOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const {
        plans,
        loadError,
        total,
        loading,
        page,
        pageSize,
        setPage,
        setPageSize,
        loadPlans,
    } = useBlogPlans();

    const actions = usePlanActions({ onChanged: loadPlans, t });

    const openCreate = () => {
        setEditingPlan(null);
        setFormOpen(true);
    };
    const openEdit = (plan) => {
        setEditingPlan(plan);
        setFormOpen(true);
    };

    const columns = [
        {
            key: "topic",
            title: t("contentLibrary.topic"),
            width: "40%",
            render: (plan) => {
                const mainTag = plan.runOnce
                    ? t("blogPlans.oneShot")
                    : t(plan.scheduleType === "WEEKLY" ? "blogPlans.typeWeekly" : "blogPlans.typeDaily");
                const secondaryTag =
                    plan.autoPublish === false
                        ? t("blog.saveDraft")
                        : t("blog.publishNow");

                return (
                    <div className="flex items-start gap-4 py-1">
                        <div className="min-w-0 flex-1">
                            <div
                                className="truncate text-sm font-medium text-ink mb-1.5"
                                title={plan.topic}
                            >
                                {plan.topic}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                                <span className="px-2 py-0.5 rounded-md border border-border text-ink-muted">
                                    {mainTag}
                                </span>
                                <span className="text-ink-muted">
                                    {secondaryTag}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "trigger",
            title: t("blogPlans.triggerTimeInfo", "每日触发时间 ⓘ"),
            width: "20%",
            render: (plan) => (
                <div className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                        {plan.triggerTimes?.length > 0
                            ? plan.triggerTimes.join(" / ")
                            : plan.triggerTime}
                    </span>
                    <span className="mt-1 block truncate text-xs text-ink-muted">
                        {plan.timezone}
                    </span>
                    {plan.runOnce && (
                        <span className="mt-1.5 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
                            {t("blogPlans.oneShot", "一次性")}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "nextRun",
            title: t("blogPlans.nextRun", "下次执行"),
            width: "20%",
            render: (plan) => (
                <div className="min-w-0">
                    <span
                        className="block truncate text-sm font-medium text-ink"
                        title={plan.nextRunAt}
                    >
                        {plan.nextRunAt
                            ? new Date(plan.nextRunAt).toLocaleString(undefined, { timeZone: plan.timezone || undefined })
                            : "—"}
                    </span>
                    <span className="mt-1 block truncate text-xs text-ink-muted">
                        {plan.timezone || ""}
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            title: t("blogPlans.status", "状态"),
            width: "10%",
            render: (plan) => <PlanStatusBadge status={plan.status} />,
        },
        {
            key: "actions",
            title: t("blogPlans.actions", "操作"),
            width: "10%",
            render: (plan) => {
                const items = [];
                if (
                    plan.status === PLAN_STATUS.ACTIVE ||
                    plan.status === PLAN_STATUS.PAUSED
                ) {
                    if (!plan.runOnce) {
                        items.push({
                            key: "trigger",
                            label: t("blogPlans.triggerNow"),
                            icon: Zap,
                            disabled:
                                !!actions.busyId ||
                                plan.status === PLAN_STATUS.RUNNING,
                            loading: actions.busyId === plan.id,
                            loadingLabel: t("blogPlans.triggerNow"),
                            onClick: () => actions.trigger(plan),
                        });
                    }
                    items.push(
                        plan.status === PLAN_STATUS.ACTIVE
                            ? {
                                  key: "pause",
                                  label: t("blogPlans.pause"),
                                  icon: Pause,
                                  disabled: !!actions.busyId,
                                  onClick: () => actions.pause(plan),
                              }
                            : {
                                  key: "resume",
                                  label: t("blogPlans.resume"),
                                  icon: Play,
                                  disabled: !!actions.busyId,
                                  onClick: () => actions.resume(plan),
                              },
                    );
                    if (!plan.runOnce) {
                        items.push({
                            key: "edit",
                            label: t("blogPlans.edit"),
                            icon: Pencil,
                            disabled: !!actions.busyId,
                            onClick: () => openEdit(plan),
                        });
                    }
                }
                if (
                    plan.status !== PLAN_STATUS.RUNNING &&
                    plan.status !== PLAN_STATUS.CANCELLED &&
                    plan.status !== PLAN_STATUS.FINISHED &&
                    plan.status !== PLAN_STATUS.FAILED
                ) {
                    items.push({
                        key: "cancel",
                        label: t("blogPlans.cancel"),
                        icon: Ban,
                        disabled: !!actions.busyId,
                        onClick: () => actions.cancel(plan),
                    });
                }
                if (plan.status !== PLAN_STATUS.RUNNING) {
                    items.push({
                        key: "delete",
                        label: t("blogPlans.delete"),
                        icon: Trash2,
                        danger: true,
                        disabled: !!actions.busyId,
                        onClick: () => actions.remove(plan),
                    });
                }
                items.push({
                    key: "detail",
                    label: t("blogPlans.detail"),
                    icon: Eye,
                    onClick: () =>
                        navigate(`/app?view=plans&planId=${plan.id}`),
                });

                return <RowActionsMenu actions={items} />;
            },
        },
    ];

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-canvas">
            <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-8">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-ink">
                        {t("contentLibrary.plans")}
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        {t("blogPlans.subtitle")}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        loading={loading}
                        onClick={loadPlans}
                        aria-label={t("contentLibrary.refresh")}
                    />
                    <Button
                        variant="outline"
                        icon={Sparkles}
                        onClick={() => setAiOpen(true)}
                    >
                        {t("blogPlans.aiGenerate")}
                    </Button>
                    <Button variant="ink" icon={Plus} onClick={openCreate}>
                        {t("blogPlans.createCustom")}
                    </Button>
                </div>
            </header>
            <div className="flex shrink-0 items-center justify-between px-5 py-3 sm:px-8">
                <span className="text-caption text-ink-muted">
                    {t("contentLibrary.planHint")}
                </span>
                <span className="shrink-0 text-caption text-ink-faint">
                    {t("contentLibrary.total", { count: total })}
                </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 sm:px-8">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
                    <DataTable
                        columns={columns}
                        rows={plans}
                        loading={loading}
                        error={loadError ? t("blogPlans.loadFailed") : ""}
                        onRetry={loadPlans}
                        onRetryLabel={t("contentLibrary.refresh")}
                        emptyTitle={t("blogPlans.empty")}
                        emptyHint={t("blogPlans.emptyHint")}
                        emptyIcon={CalendarClock}
                        minWidth="840px"
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                        paginationDisabled={loading}
                    />
                </div>
            </div>
            <PlanFormModal
                isOpen={formOpen}
                plan={editingPlan}
                onClose={() => setFormOpen(false)}
                onSaved={loadPlans}
            />
            <PlanAiGenerateModal
                isOpen={aiOpen}
                onClose={() => setAiOpen(false)}
                onSaved={loadPlans}
            />
        </div>
    );
};

export default BlogPlans;
