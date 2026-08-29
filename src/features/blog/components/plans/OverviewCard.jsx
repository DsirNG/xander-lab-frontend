import React from 'react';
import { useTranslation } from 'react-i18next';
import { PLAN_STATUS } from '../../services/blogPlanService';
import { ChevronDown } from 'lucide-react';

const OverviewCard = ({ plans, total }) => {
  const { t } = useTranslation();
  const activeCount = plans.filter(p => p.status === PLAN_STATUS.ACTIVE || p.status === PLAN_STATUS.RUNNING).length;
  const pausedCount = plans.filter(p => p.status === PLAN_STATUS.PAUSED).length;
  const finishedCount = plans.filter(p => p.status === PLAN_STATUS.FINISHED).length;

  return (
    <div className="flex flex-col shrink-0 rounded-[20px] bg-white p-5 shadow-sm min-h-[220px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-ink">{t('blogPlans.overview', '计划概览')}</h3>
        <button className="flex items-center gap-1 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors">
          {t('blogPlans.recentDays', '最近 7 天')} <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-[14px] bg-surface-muted p-3.5 flex flex-col justify-center">
          <div className="text-2xl font-bold text-ink tracking-tight mb-1">{total || 8}</div>
          <div className="text-[11px] text-ink-muted font-medium">{t('blogPlans.totalPlans', '计划总数')}</div>
        </div>
        <div className="rounded-[14px] bg-blue-50/50 p-3.5 flex flex-col justify-center">
          <div className="text-2xl font-bold text-blue-600 tracking-tight mb-1">{activeCount || 5}</div>
          <div className="text-[11px] text-blue-600 font-medium">{t('blogPlans.statusActive', '运行中')}</div>
        </div>
        <div className="rounded-[14px] bg-orange-50/50 p-3.5 flex flex-col justify-center">
          <div className="text-2xl font-bold text-orange-500 tracking-tight mb-1">{pausedCount || 2}</div>
          <div className="text-[11px] text-orange-500 font-medium">{t('blogPlans.statusPaused', '已暂停')}</div>
        </div>
        <div className="rounded-[14px] bg-green-50/50 p-3.5 flex flex-col justify-center">
          <div className="text-2xl font-bold text-green-500 tracking-tight mb-1">{finishedCount || 1}</div>
          <div className="text-[11px] text-green-500 font-medium">{t('blogPlans.statusFinished', '已完成')}</div>
        </div>
      </div>

      <div className="mt-auto pt-1 flex items-center justify-between">
        <div className="min-w-0 mr-2">
          <div className="text-xs font-medium text-ink-muted mb-1 truncate" title={t('blogPlans.autoPublished', '自动发布文章')}>{t('blogPlans.autoPublished', '自动发布文章')}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-ink">23<span className="text-xs font-normal text-ink-muted ml-0.5">{t('blogPlans.unitPosts', '篇')}</span></span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1 rounded">+18.4%</span>
          </div>
        </div>
        <div className="h-8 w-[72px] shrink-0">
          <svg viewBox="0 0 100 40" className="w-full h-full stroke-indigo-500 fill-indigo-50 stroke-[2.5]">
             <path d="M0 35 Q 15 15, 30 25 T 60 15 T 100 20 L 100 40 L 0 40 Z" stroke="none" />
             <path d="M0 35 Q 15 15, 30 25 T 60 15 T 100 20" fill="none" />
             <circle cx="100" cy="20" r="2.5" fill="white" className="stroke-indigo-500" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
