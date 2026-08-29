import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Ban, CalendarClock, Eye, Pause, Pencil, Play, Plus, Sparkles, Trash2, Zap } from 'lucide-react';
import DataTable from '@components/common/DataTable';
import RowActionsMenu from '@components/common/RowActionsMenu';
import { blogPlanService, PLAN_STATUS } from '../services/blogPlanService';
import { useToast } from '@/hooks/useToast';
import { usePlanActions } from '../hooks/usePlanActions';
import PlanStatusBadge from '../components/plans/PlanStatusBadge';
import PlanFormModal from '../components/plans/PlanFormModal';
import PlanAiGenerateModal from '../components/plans/PlanAiGenerateModal';
import OverviewCard from '../components/plans/OverviewCard';
import RhythmCard from '../components/plans/RhythmCard';
import UpcomingCard from '../components/plans/UpcomingCard';

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
      width: '38%',
      render: (plan) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-ink" title={plan.topic}>{plan.topic}</div>
            {plan.runOnce && (
              <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-fg">
                {t('blogPlans.oneShot')}
              </span>
            )}
          </div>
          {plan.topics?.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-muted">
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5">{plan.topics[0]?.topic || '内容生成'}</span>
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5">{plan.runOnce ? '一次性' : '自动生成'}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'trigger',
      title: t('blogPlans.triggerTime'),
      width: '20%',
      render: (plan) => (
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink">
            {(plan.triggerTimes?.length > 0 ? plan.triggerTimes.join(' / ') : plan.triggerTime)}
          </span>
          <span className="mt-1 block truncate text-xs text-ink-muted">
            {plan.timezone}
          </span>
        </div>
      ),
    },
    {
      key: 'nextRun',
      title: t('blogPlans.nextRun'),
      width: '18%',
      render: (plan) => (
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink" title={plan.nextRunAt}>
            {plan.nextRunAt ? new Date(plan.nextRunAt).toLocaleString() : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('blogPlans.status'),
      width: '14%',
      render: (plan) => <PlanStatusBadge status={plan.status} />,
    },
    {
      key: 'actions',
      title: t('blogPlans.actions'),
      width: '10%',
      render: (plan) => {
        const items = [];
        if (plan.status === PLAN_STATUS.ACTIVE || plan.status === PLAN_STATUS.PAUSED) {
          if (!plan.runOnce) {
            items.push({
              key: 'trigger',
              label: t('blogPlans.triggerNow'),
              icon: Zap,
              disabled: !!actions.busyId || plan.status === PLAN_STATUS.RUNNING,
              loading: actions.busyId === plan.id,
              loadingLabel: t('blogPlans.triggerNow'),
              onClick: () => actions.trigger(plan),
            });
          }
          items.push(plan.status === PLAN_STATUS.ACTIVE ? {
            key: 'pause',
            label: t('blogPlans.pause'),
            icon: Pause,
            disabled: !!actions.busyId,
            onClick: () => actions.pause(plan),
          } : {
            key: 'resume',
            label: t('blogPlans.resume'),
            icon: Play,
            disabled: !!actions.busyId,
            onClick: () => actions.resume(plan),
          });
          if (!plan.runOnce) {
            items.push({
              key: 'edit',
              label: t('blogPlans.edit'),
              icon: Pencil,
              disabled: !!actions.busyId,
              onClick: () => openEdit(plan),
            });
          }
        }
        if (plan.status !== PLAN_STATUS.RUNNING && plan.status !== PLAN_STATUS.CANCELLED
          && plan.status !== PLAN_STATUS.FINISHED && plan.status !== PLAN_STATUS.FAILED) {
          items.push({
            key: 'cancel',
            label: t('blogPlans.cancel'),
            icon: Ban,
            disabled: !!actions.busyId,
            onClick: () => actions.cancel(plan),
          });
        }
        if (plan.status !== PLAN_STATUS.RUNNING) {
          items.push({
            key: 'delete',
            label: t('blogPlans.delete'),
            icon: Trash2,
            danger: true,
            disabled: !!actions.busyId,
            onClick: () => actions.remove(plan),
          });
        }
        items.push({
          key: 'detail',
          label: t('blogPlans.detail'),
          icon: Eye,
          onClick: () => navigate(`/workspace/plans/${plan.id}`),
        });
        return <RowActionsMenu actions={items} />;
      },
    },
  ];

  return (
    <div className="flex h-full min-h-0 bg-surface flex-row gap-6 p-4 sm:p-6 overflow-hidden">
      {/* Left Column: Main area */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Banner */}
        <div className="relative flex shrink-0 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#F2F5FE] to-[#F7F2FE] p-6 sm:p-8">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl font-bold text-ink">{t('blogPlans.title', '发布计划')}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {t('blogPlans.subtitle', '设置主题与发布时间，自动生成并定时发布文章，让内容创作持续发生。')}
            </p>
          </div>
          <div className="relative z-10 ml-4 flex shrink-0 items-center gap-3">
            <button
              onClick={() => setAiOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-accent shadow-sm hover:bg-surface-muted transition-colors"
            >
              <Sparkles className="w-4 h-4" /> {t('blogPlans.aiGenerate', 'AI 生成计划')}
            </button>
            <button
              onClick={openCreate}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> {t('blogPlans.createCustom', '新建计划')}
            </button>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl"></div>
          <div className="absolute right-40 -bottom-20 h-48 w-48 rounded-full bg-purple-500/5 blur-2xl"></div>
        </div>

        {/* List */}
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white shadow-sm border border-border p-4 sm:p-5">
          <DataTable
            columns={columns}
            rows={plans}
            loading={loading}
            emptyTitle={t('blogPlans.empty')}
            emptyHint={t('blogPlans.emptyHint')}
            emptyIcon={CalendarClock}
            minWidth="840px"
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            paginationDisabled={loading}
          />
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="hidden w-[340px] shrink-0 xl:flex flex-col gap-6 overflow-y-auto pb-2 pr-1">
        <OverviewCard plans={plans} total={total} />
        <RhythmCard />
        <UpcomingCard plans={plans} />
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

