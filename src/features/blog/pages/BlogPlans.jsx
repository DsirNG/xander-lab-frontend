import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ChevronRight, Eye, Loader2, Pencil, Plus, Trash2, Zap } from 'lucide-react';
import Pagination from '@components/common/Pagination';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { blogPlanService, PLAN_STATUS } from '../services/blogPlanService';
import { useToast } from '@/hooks/useToast';
import { usePlanActions } from '../hooks/usePlanActions';
import PlanStatusBadge from '../components/plans/PlanStatusBadge';
import PlanFormModal from '../components/plans/PlanFormModal';

/**
 * 定时发文计划：分页列表 + 新建/编辑弹窗 + 操作；执行记录进入详情页
 */
const BlogPlans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogPlanService.listPlans({ page, size: pageSize });
      setPlans(data?.records || []);
      setTotal(Number(data?.total) || 0);
    } catch {
      toast.error(t('blogPlans.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t, page, pageSize]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const actions = usePlanActions({ onChanged: loadPlans, t });

  const openCreate = () => { setEditingPlan(null); setFormOpen(true); };
  const openEdit = (plan) => { setEditingPlan(plan); setFormOpen(true); };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">{t('blogPlans.title')}</h1>
          <p className="mt-1 text-sm text-ink-faint">{t('blogPlans.subtitle')}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> {t('blogPlans.create')}
        </button>
      </div>

      <div className="mt-6 min-h-0 flex-1">
        {loading ? (
          <LoadingSpinner fullScreen />
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <p className="text-sm text-ink-faint">{t('blogPlans.empty')}</p>
            <p className="mt-1 text-xs text-ink-faint">{t('blogPlans.emptyHint')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-border bg-canvas/60 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-ink">{plan.topic}</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {(plan.triggerTimes?.length > 0 ? plan.triggerTimes.join(' / ') : plan.triggerTime)} ({plan.timezone})
                        </span>
                        <span>{t('blogPlans.syncCsdn')}: {plan.syncCsdn ? t('blogPlans.yes') : t('blogPlans.no')}</span>
                        {plan.topics?.length > 0 && (
                          <span>{t('blogPlans.topicsQueue')}: {plan.topics.length}{t('blogPlans.topicsQueueUnit')}</span>
                        )}
                        <span>{t('blogPlans.nextRun')}: {plan.nextRunAt ? new Date(plan.nextRunAt).toLocaleString() : '—'}</span>
                      </p>
                    </div>
                    <PlanStatusBadge status={plan.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(plan.status === PLAN_STATUS.ACTIVE || plan.status === PLAN_STATUS.PAUSED) && (
                      <>
                        <button
                          onClick={() => actions.trigger(plan)}
                          disabled={!!actions.busyId || plan.status === PLAN_STATUS.RUNNING}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {actions.busyId === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                          {t('blogPlans.triggerNow')}
                        </button>
                        {plan.status === PLAN_STATUS.ACTIVE ? (
                          <button onClick={() => actions.pause(plan)} disabled={!!actions.busyId}
                            className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                            {t('blogPlans.pause')}
                          </button>
                        ) : (
                          <button onClick={() => actions.resume(plan)} disabled={!!actions.busyId}
                            className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                            {t('blogPlans.resume')}
                          </button>
                        )}
                        <button onClick={() => openEdit(plan)} disabled={!!actions.busyId}
                          className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                          <Pencil className="h-3 w-3" /> {t('blogPlans.edit')}
                        </button>
                      </>
                    )}
                    {plan.status !== PLAN_STATUS.RUNNING && (
                      <button onClick={() => actions.remove(plan)} disabled={!!actions.busyId}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                        <Trash2 className="h-3 w-3" /> {t('blogPlans.delete')}
                      </button>
                    )}
                    {plan.status !== PLAN_STATUS.RUNNING && plan.status !== PLAN_STATUS.CANCELLED && (
                      <button onClick={() => actions.cancel(plan)} disabled={!!actions.busyId}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-faint hover:bg-surface-muted disabled:opacity-50">
                        {t('blogPlans.cancel')}
                      </button>
                    )}
                    <button onClick={() => navigate(`/workspace/plans/${plan.id}`)}
                      className="ml-auto inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted">
                      <Eye className="h-3 w-3" /> {t('blogPlans.detail')}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </>
        )}
      </div>

      <PlanFormModal
        isOpen={formOpen}
        plan={editingPlan}
        onClose={() => setFormOpen(false)}
        onSaved={loadPlans}
      />
    </div>
  );
};

export default BlogPlans;
