import { useTranslation } from "react-i18next";
import { PLAN_STATUS } from "../../services/blogPlanService";

const STYLE = {
    DRAFT: "bg-surface-muted text-ink-muted",
    [PLAN_STATUS.ACTIVE]: "bg-surface-muted text-ink",
    [PLAN_STATUS.RUNNING]: "bg-surface-muted text-ink",
    [PLAN_STATUS.PAUSED]: "bg-surface-muted text-ink-muted",
    [PLAN_STATUS.CANCELLED]: "bg-surface text-ink-muted ring-1 ring-border",
    [PLAN_STATUS.FINISHED]: "bg-surface-muted text-ink",
    [PLAN_STATUS.FAILED]: "bg-danger-soft text-danger",
};

const LABEL_KEY = {
    DRAFT: "blogPlans.seriesStatusDraft",
    [PLAN_STATUS.ACTIVE]: "blogPlans.statusActive",
    [PLAN_STATUS.RUNNING]: "blogPlans.statusRunning",
    [PLAN_STATUS.PAUSED]: "blogPlans.statusPaused",
    [PLAN_STATUS.CANCELLED]: "blogPlans.statusCancelled",
    [PLAN_STATUS.FINISHED]: "blogPlans.statusFinished",
    [PLAN_STATUS.FAILED]: "blogPlans.statusFailed",
};

/**
 * 计划状态徽标
 */
const PlanStatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const labelKey = LABEL_KEY[status];
    return (
        <span
            className={`inline-flex shrink-0 whitespace-nowrap items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[status] || "bg-surface text-ink-muted ring-1 ring-border"}`}
        >
            {labelKey ? t(labelKey) : status}
        </span>
    );
};

export default PlanStatusBadge;
