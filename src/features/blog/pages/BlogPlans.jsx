import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Ban, CalendarClock, Eye, Pause, Pencil, Play, Plus, Sparkles, Trash2, Zap, Code, Globe, LayoutTemplate, Calendar, Star, Lightbulb, Link2 } from 'lucide-react';
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

const getTopicStyle = (topic = '') => {
  if (topic.includes('设计') || topic.includes('API')) return { icon: Link2, color: 'text-blue-500', bg: 'bg-blue-50' };
  if (topic.includes('Websocket') || topic.includes('网络') || topic.includes('区别')) return { icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' };
  if (topic.includes('CSS') || topic.includes('样式') || topic.includes('盒模型')) return { icon: LayoutTemplate, color: 'text-green-500', bg: 'bg-green-50' };
  if (topic.includes('中级') || topic.includes('开发')) return { icon: Code, color: 'text-orange-500', bg: 'bg-orange-50' };
  if (topic.includes('闭包') || topic.includes('JS') || topic.includes('JavaScript')) return { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' };
  if (topic.includes('资讯') || topic.includes('精选')) return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-50' };
  if (topic.includes('面试') || topic.includes('解析')) return { icon: Lightbulb, color: 'text-red-500', bg: 'bg-red-50' };
  return { icon: Link2, color: 'text-accent', bg: 'bg-accent-soft' };
};

const getTagStyle = (tag = '') => {
  if (tag.includes('前端入门')) return 'text-green-600 bg-green-50';
  if (tag.includes('技术实践')) return 'text-blue-600 bg-blue-50';
  if (tag.includes('成长笔记')) return 'text-blue-600 bg-blue-50';
  if (tag.includes('资讯精选')) return 'text-blue-600 bg-blue-50';
  if (tag.includes('面试提升')) return 'text-purple-600 bg-purple-50';
  if (tag === '一次性') return 'text-blue-600 bg-blue-50';
  return 'text-ink-muted bg-transparent'; // 自动生成 / 手动编写 usually just grey text no bg in mockup
};

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
      setLoading(false);
    } catch (error) {
      if (error?.isCancelled) {
        return;
      }
      console.error('loadPlans error:', error);
      toast.error(t('blogPlans.loadFailed'));
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
      title: '文章主题',
      width: '40%',
      render: (plan) => {
        const style = getTopicStyle(plan.topic);
        const Icon = style.icon;
        const mainTag = plan.topics?.[0]?.topic || (plan.topic.includes(t('blogPlans.keys.design', '设计')) ? t('blogPlans.tags.techPractice', '技术实践') : t('blogPlans.tags.contentGen', '内容生成'));
        const secondaryTag = plan.runOnce ? t('blogPlans.tags.manualWrite', '手动编写') : t('blogPlans.tags.autoGenerate', '自动生成');

        return (
          <div className="flex items-start gap-4 py-1">
            {/*<div className={`mt-0.5 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}>*/}
            {/*   <Icon className={`w-5 h-5 ${style.color}`} />*/}
            {/*</div>*/}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-ink mb-1.5" title={plan.topic}>{plan.topic}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className={`px-2 py-0.5 rounded-full ${getTagStyle(mainTag)}`}>{mainTag}</span>
                <span className={`text-ink-muted ${getTagStyle(secondaryTag)}`}>{secondaryTag}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'trigger',
      title: t('blogPlans.triggerTimeInfo', '每日触发时间 ⓘ'),
      width: '20%',
      render: (plan) => (
        <div className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">
            {(plan.triggerTimes?.length > 0 ? plan.triggerTimes.join(' / ') : plan.triggerTime)}
          </span>
          <span className="mt-1 block truncate text-xs text-ink-muted">
            {plan.timezone}
          </span>
          {plan.runOnce && (
             <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
               {t('blogPlans.oneShot', '一次性')}
             </span>
          )}
        </div>
      ),
    },
    {
      key: 'nextRun',
      title: t('blogPlans.nextRun', '下次执行'),
      width: '20%',
      render: (plan) => (
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink" title={plan.nextRunAt}>
            {plan.nextRunAt ? new Date(plan.nextRunAt).toLocaleDateString() : '—'}
          </span>
          <span className="mt-1 block truncate text-xs text-ink-muted">
            {plan.nextRunAt ? t('blogPlans.tomorrow', '(明天)') : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('blogPlans.status', '状态'),
      width: '10%',
      render: (plan) => <PlanStatusBadge status={plan.status} />,
    },
    {
      key: 'actions',
      title: t('blogPlans.actions', '操作'),
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
    <div className="flex h-full min-h-0 min-w-0 bg-surface flex-row gap-6 p-4 sm:p-6 overflow-hidden">
      {/* Left Column: Main area */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Banner */}
        <div className="relative flex shrink-0 flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#F4F6FE] to-[#F8F4FD] p-6 sm:px-8 sm:py-7">
          <div className="relative z-10 min-w-0">
            <h1 className="text-[22px] font-bold text-ink">{t('blogPlans.title', '发布计划')}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              {t('blogPlans.subtitle', '设置主题与发布时间，自动生成并定时发布文章，让内容创作持续发生。')}
            </p>
          </div>
          <div className="relative z-10 flex shrink-0 items-center gap-3">
            <button
              onClick={() => setAiOpen(true)}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-accent shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:bg-surface-light transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('blogPlans.aiGenerate', 'AI 生成计划')}</span>
            </button>
            <button
              onClick={openCreate}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-indigo-500 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('blogPlans.createCustom', '新建计划')}
            </button>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute right-32 top-1/2 -translate-y-1/2 w-48 h-48 opacity-20 pointer-events-none hidden sm:block">
             <div className="absolute inset-0 rounded-full border-[16px] border-purple-400 blur-[2px]"></div>
          </div>
          <div className="absolute right-52 -bottom-10 w-24 h-24 opacity-20 pointer-events-none hidden sm:block">
             <div className="absolute inset-0 rounded-full border-[12px] border-indigo-300 blur-[1px]"></div>
          </div>
        </div>

        {/* List */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-[20px] bg-white shadow-sm">
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
      <div className="hidden w-[320px] shrink-0 xl:flex flex-col gap-5 overflow-y-auto pb-2 pr-1">
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

