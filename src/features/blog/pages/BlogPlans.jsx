import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ChevronRight, Eye, Loader2, Pencil, Plus, Sparkles, Trash2, Zap } from 'lucide-react';
import DataTable from '@components/common/DataTable';
import { blogPlanService, PLAN_STATUS } from '../services/blogPlanService';
import { useToast } from '@/hooks/useToast';
import { usePlanActions } from '../hooks/usePlanActions';
import PlanStatusBadge from '../components/plans/PlanStatusBadge';
import PlanFormModal from '../components/plans/PlanFormModal';
import PlanAiGenerateModal from '../components/plans/PlanAiGenerateModal';

/**
 * 定时发文计划：分页列表 + 自定义/AI 生成双入口 + 操作；执行记录进入详情页
 */
const BlogPlans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
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

  const columns = [
    {
      key: 'topic',
      title: t('blogPlans.topic'),
      width: '26%',
      render: (plan) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-xs font-bold text-ink" title={plan.topic}>{plan.topic}</div>
            {plan.runOnce && (
              <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-micro font-medium text-accent-fg">
                {t('blogPlans.oneShot')}
              </span>
            )}
            {plan.topics?.length > 0 && (
              <span className="shrink-0 text-micro font-medium text-ink-faint">
                {t('blogPlans.topicsQueue')}: {plan.topics.length}{t('blogPlans.topicsQueueUnit')}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'trigger',
      title: t('blogPlans.triggerTime'),
      width: '22%',
      render: (plan) => (
        <div className="min-w-0">
          <span className="block truncate text-xs font-medium text-ink-muted">
            {(plan.triggerTimes?.length > 0 ? plan.triggerTimes.join(' / ') : plan.triggerTime)} ({plan.timezone})
          </span>
          <span className="mt-0.5 block truncate text-micro text-ink-faint">
            {t('blogPlans.syncCsdn')}: {plan.syncCsdn ? t('blogPlans.yes') : t('blogPlans.no')}
          </span>
        </div>
      ),
    },
    {
      key: 'nextRun',
      title: t('blogPlans.nextRun'),
      width: '18%',
      render: (plan) => (
        <span className="block truncate text-xs font-medium text-ink-muted" title={plan.nextRunAt}>
          {plan.nextRunAt ? new Date(plan.nextRunAt).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      title: t('blogPlans.status'),
      width: '12%',
      render: (plan) => <PlanStatusBadge status={plan.status} />,
    },
    {
      key: 'actions',
      title: t('blogPlans.actions'),
      width: '22%',
      align: 'right',
      render: (plan) => (
        <div className="flex flex-wrap items-center justify-end gap-1">
          {(plan.status === PLAN_STATUS.ACTIVE || plan.status === PLAN_STATUS.PAUSED) && (
            <>
              {!plan.runOnce && (
                <button
                  onClick={() => actions.trigger(plan)}
                  disabled={!!actions.busyId || plan.status === PLAN_STATUS.RUNNING}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-micro font-bold text-white hover:opacity-90 disabled:opacity-50"
                  title={t('blogPlans.triggerNow')}
                >
                  {actions.busyId === plan.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                </button>
              )}
              {plan.status === PLAN_STATUS.ACTIVE ? (
                <button onClick={() => actions.pause(plan)} disabled={!!actions.busyId}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-micro text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                  {t('blogPlans.pause')}
                </button>
              ) : (
                <button onClick={() => actions.resume(plan)} disabled={!!actions.busyId}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-micro text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                  {t('blogPlans.resume')}
                </button>
              )}
              {!plan.runOnce && (
                <button onClick={() => openEdit(plan)} disabled={!!actions.busyId}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-micro text-ink-secondary hover:bg-surface-muted disabled:opacity-50"
                  title={t('blogPlans.edit')}>
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </>
          )}
          {plan.status !== PLAN_STATUS.RUNNING && (
            <button onClick={() => actions.remove(plan)} disabled={!!actions.busyId}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-micro text-danger hover:bg-danger-soft disabled:opacity-50"
              title={t('blogPlans.delete')}>
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {plan.status !== PLAN_STATUS.RUNNING && plan.status !== PLAN_STATUS.CANCELLED
            && plan.status !== PLAN_STATUS.FINISHED && plan.status !== PLAN_STATUS.FAILED && (
            <button onClick={() => actions.cancel(plan)} disabled={!!actions.busyId}
              className="rounded-lg border border-border px-2.5 py-1.5 text-micro text-ink-faint hover:bg-surface-muted disabled:opacity-50">
              {t('blogPlans.cancel')}
            </button>
          )}
          <button onClick={() => navigate(`/workspace/plans/${plan.id}`)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-micro text-ink-secondary hover:bg-surface-muted"
            title={t('blogPlans.detail')}>
            <Eye className="h-3 w-3" />
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-ink">{t('blogPlans.title')}</div>
          <div className="mt-1 text-sm text-ink-faint">{t('blogPlans.subtitle')}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-bold text-ink-secondary hover:bg-surface-muted"
          >
            <Sparkles className="w-4 h-4 text-accent" /> {t('blogPlans.aiGenerate')}
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> {t('blogPlans.createCustom')}
          </button>
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1">
        <DataTable
          columns={columns}
          rows={plans}
          loading={loading}
          emptyTitle={t('blogPlans.empty')}
          emptyHint={t('blogPlans.emptyHint')}
          emptyIcon={CalendarClock}
          minWidth="900px"
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          paginationDisabled={loading}
        />
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
