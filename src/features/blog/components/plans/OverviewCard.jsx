import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CirclePause, Clock3, Layers3 } from 'lucide-react';
import { PLAN_STATUS } from '../../services/blogPlanService';

const OverviewCard = ({ plans, total }) => {
  const { t } = useTranslation();
  const counts = plans.reduce((result, plan) => {
    if (plan.status === PLAN_STATUS.ACTIVE || plan.status === PLAN_STATUS.RUNNING) result.active += 1;
    if (plan.status === PLAN_STATUS.PAUSED) result.paused += 1;
    if (plan.status === PLAN_STATUS.FINISHED) result.finished += 1;
    return result;
  }, { active: 0, paused: 0, finished: 0 });

  const items = [
    [Layers3, total, 'totalPlans', 'bg-surface-muted text-ink'],
    [Clock3, counts.active, 'activePlans', 'bg-accent-soft text-accent'],
    [CirclePause, counts.paused, 'pausedPlans', 'bg-warning-soft text-warning-fg'],
    [CheckCircle2, counts.finished, 'completedPlans', 'bg-success-soft text-success-fg'],
  ];

  return (
    <div className="shrink-0 rounded-[20px] bg-white p-5 shadow-sm">
      <div className="mb-4 text-title text-ink">{t('blogPlans.overview')}</div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(([Icon, value, key, colors]) => (
          <div key={key} className={`rounded-[14px] p-3.5 ${colors}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-heading tracking-tight">{Number(value) || 0}</span>
              <Icon className="h-4 w-4 opacity-70" />
            </div>
            <div className="mt-1 text-micro opacity-80">{t(`blogPlans.${key}`)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewCard;
