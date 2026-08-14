import { useTranslation } from 'react-i18next';
import { PLAN_STATUS } from '../../services/blogPlanService';

const STYLE = {
  [PLAN_STATUS.ACTIVE]: 'bg-success-soft text-success-fg',
  [PLAN_STATUS.RUNNING]: 'bg-info-soft text-info-fg',
  [PLAN_STATUS.PAUSED]: 'bg-warning-soft text-warning-fg',
  [PLAN_STATUS.CANCELLED]: 'bg-surface text-ink-muted ring-1 ring-border',
  [PLAN_STATUS.FINISHED]: 'bg-accent-soft text-accent-fg',
  [PLAN_STATUS.FAILED]: 'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const LABEL_KEY = {
  [PLAN_STATUS.ACTIVE]: 'blogPlans.statusActive',
  [PLAN_STATUS.RUNNING]: 'blogPlans.statusRunning',
  [PLAN_STATUS.PAUSED]: 'blogPlans.statusPaused',
  [PLAN_STATUS.CANCELLED]: 'blogPlans.statusCancelled',
  [PLAN_STATUS.FINISHED]: 'blogPlans.statusFinished',
  [PLAN_STATUS.FAILED]: 'blogPlans.statusFailed',
};

/**
 * 计划状态徽标
 */
const PlanStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const labelKey = LABEL_KEY[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[status] || 'bg-surface text-ink-muted ring-1 ring-border'}`}>
      {labelKey ? t(labelKey) : status}
    </span>
  );
};

export default PlanStatusBadge;
