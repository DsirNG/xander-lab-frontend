import React from 'react';
import { PLAN_STATUS } from '../../services/blogPlanService';
import { ChevronDown } from 'lucide-react';

const OverviewCard = ({ plans, total }) => {
  const activeCount = plans.filter(p => p.status === PLAN_STATUS.ACTIVE || p.status === PLAN_STATUS.RUNNING).length;
  const pausedCount = plans.filter(p => p.status === PLAN_STATUS.PAUSED).length;
  const finishedCount = plans.filter(p => p.status === PLAN_STATUS.FINISHED).length;

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm border border-border h-full min-h-[220px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-ink">计划概览</h3>
        <button className="flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink transition-colors">
          最近 7 天 <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl bg-surface p-3 flex flex-col justify-center border border-border/50">
          <div className="text-2xl font-bold text-ink">{total || 8}</div>
          <div className="text-xs text-ink-muted mt-1">计划总数</div>
        </div>
        <div className="rounded-xl bg-accent-soft p-3 flex flex-col justify-center border border-accent/10">
          <div className="text-2xl font-bold text-accent-fg">{activeCount || 5}</div>
          <div className="text-xs text-accent mt-1">运行中</div>
        </div>
        <div className="rounded-xl bg-warning-soft p-3 flex flex-col justify-center border border-warning/10">
          <div className="text-2xl font-bold text-warning-fg">{pausedCount || 2}</div>
          <div className="text-xs text-warning-fg mt-1">已暂停</div>
        </div>
        <div className="rounded-xl bg-success-soft p-3 flex flex-col justify-center border border-success/10">
          <div className="text-2xl font-bold text-success-fg">{finishedCount || 1}</div>
          <div className="text-xs text-success-fg mt-1">已完成</div>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-muted">自动发布文章</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-ink">23<span className="text-sm font-normal text-ink-muted ml-0.5">篇</span></span>
            <span className="text-xs font-bold text-success">+18.4%</span>
          </div>
        </div>
        <div className="h-8 w-16">
          <svg viewBox="0 0 100 40" className="w-full h-full stroke-accent fill-accent-soft stroke-2">
             <path d="M0 30 Q 15 10, 30 25 T 60 15 T 100 20 L 100 40 L 0 40 Z" stroke="none" />
             <path d="M0 30 Q 15 10, 30 25 T 60 15 T 100 20" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
