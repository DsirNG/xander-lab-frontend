import { useTranslation } from 'react-i18next';
import { PLAN_STATUS } from '../../services/blogPlanService';

const STYLE = {
  [PLAN_STATUS.ACTIVE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  [PLAN_STATUS.RUNNING]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [PLAN_STATUS.PAUSED]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  [PLAN_STATUS.CANCELLED]: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const LABEL_KEY = {
  [PLAN_STATUS.ACTIVE]: 'blogPlans.statusActive',
  [PLAN_STATUS.RUNNING]: 'blogPlans.statusRunning',
  [PLAN_STATUS.PAUSED]: 'blogPlans.statusPaused',
  [PLAN_STATUS.CANCELLED]: 'blogPlans.statusCancelled',
};

/**
 * 计划状态徽标
 */
const PlanStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const labelKey = LABEL_KEY[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
      {labelKey ? t(labelKey) : status}
    </span>
  );
};

export default PlanStatusBadge;
