import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Eye, Loader2, Pencil, Trash2, Zap } from 'lucide-react';
import Pagination from '@components/common/Pagination';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { blogPlanService, PLAN_STATUS } from '../services/blogPlanService';
import { useToast } from '@/hooks/useToast';
import { usePlanActions } from '../hooks/usePlanActions';
import PlanStatusBadge from '../components/plans/PlanStatusBadge';
import PlanFormModal from '../components/plans/PlanFormModal';
import RunDetailModal from '../components/plans/RunDetailModal';

const RUN_PAGE_SIZE = 10;

/**
 * 定时发文计划详情页：计划信息 + 操作 + 执行记录（分页）
 */
const BlogPlanDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [runs, setRuns] = useState([]);
  const [runsTotal, setRunsTotal] = useState(0);
  const [runsPage, setRunsPage] = useState(1);
  const [runsLoading, setRunsLoading] = useState(true);
  const [detailRun, setDetailRun] = useState(null);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await blogPlanService.getPlan(id);
      setPlan(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRuns = useCallback(async (page) => {
    setRunsLoading(true);
    try {
      const data = await blogPlanService.listRuns(id, { page, size: RUN_PAGE_SIZE });
      setRuns(data?.records || []);
      setRunsTotal(Number(data?.total) || 0);
    } catch {
      toast.error(t('blogPlans.loadFailed'));
    } finally {
      setRunsLoading(false);
    }
  }, [id, t, toast]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  useEffect(() => { setRunsPage(1); }, [plan?.id]);

  useEffect(() => {
    if (plan) loadRuns(runsPage);
  }, [plan, runsPage, loadRuns]);

  const actions = usePlanActions({ onChanged: loadPlan, t });

  const infoRow = (label, value) => (
    <div className="flex items-start justify-between gap-6 py-2 text-sm">
      <span className="shrink-0 text-ink-faint">{label}</span>
      <span className="break-all text-right text-ink-secondary">{value || '—'}</span>
    </div>
  );

  const runError = (run) => run.errorMessage
    || (run.reviewPass === false ? run.reviewReason : '')
    || run.csdnErrorMessage;

  if (loading) return <LoadingSpinner fullScreen />;

  if (notFound || !plan) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="text-sm font-medium text-ink-faint">{t('blogPlans.notFound')}</div>
        <button onClick={() => navigate('/workspace/plans')}
          className="mt-4 rounded-xl border border-border px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted">
          {t('blogPlans.backToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/workspace/plans')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {t('blogPlans.backToList')}
      </button>

      <div className="mt-3 rounded-2xl border border-border bg-canvas/60 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xl font-bold text-ink">{plan.topic}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
              <span>{(plan.triggerTimes?.length > 0 ? plan.triggerTimes.join(' / ') : plan.triggerTime)} ({plan.timezone}) · {t('blogPlans.syncCsdn')}: {plan.syncCsdn ? t('blogPlans.yes') : t('blogPlans.no')}</span>
              {plan.runOnce && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-fg">
                  {t('blogPlans.oneShot')}
                </span>
              )}
            </div>
          </div>
          <PlanStatusBadge status={plan.status} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-8 divide-y divide-border sm:grid-cols-2 sm:gap-y-0 sm:divide-y-0">
          <div className="divide-y divide-border">
            {infoRow(t('blogPlans.nextRun'), plan.nextRunAt ? new Date(plan.nextRunAt).toLocaleString() : '—')}
            {infoRow(t('blogPlans.lastRunAt'), plan.lastRunAt ? new Date(plan.lastRunAt).toLocaleString() : '—')}
          </div>
          <div className="divide-y divide-border">
            {infoRow(t('blogPlans.audience'), plan.audience)}
            {infoRow(t('blogPlans.tone'), plan.tone)}
          </div>
        </div>
        {plan.errorMessage && (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {t('blogPlans.lastError')}: {plan.errorMessage}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(plan.status === PLAN_STATUS.ACTIVE || plan.status === PLAN_STATUS.PAUSED) && (
            <>
              {!plan.runOnce && (
                <button onClick={() => actions.trigger(plan)} disabled={!!actions.busyId || plan.status === PLAN_STATUS.RUNNING}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50">
                  {actions.busyId === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                  {t('blogPlans.triggerNow')}
                </button>
              )}
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
              {!plan.runOnce && (
                <button onClick={() => setFormOpen(true)} disabled={!!actions.busyId}
                  className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                  <Pencil className="h-3 w-3" /> {t('blogPlans.edit')}
                </button>
              )}
            </>
          )}
          {plan.status !== PLAN_STATUS.RUNNING && (
            <button onClick={() => actions.remove(plan)} disabled={!!actions.busyId}
              className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="h-3 w-3" /> {t('blogPlans.delete')}
            </button>
          )}
          {plan.status !== PLAN_STATUS.RUNNING && plan.status !== PLAN_STATUS.CANCELLED
            && plan.status !== PLAN_STATUS.FINISHED && plan.status !== PLAN_STATUS.FAILED && (
            <button onClick={() => actions.cancel(plan)} disabled={!!actions.busyId}
              className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-faint hover:bg-surface-muted disabled:opacity-50">
              {t('blogPlans.cancel')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-ink">{t('blogPlans.runHistory')}</div>
          <span className="text-xs text-ink-faint">{t('blogPlans.totalRuns', { count: runsTotal })}</span>
        </div>

        {runsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-ink-faint" /></div>
        ) : runs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <div className="text-sm text-ink-faint">{t('blogPlans.noRuns')}</div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-muted text-left text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">{t('blogPlans.time')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('blogPlans.triggerType')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('blogPlans.status')}</th>
                  <th className="px-4 py-2.5 font-medium">CSDN</th>
                  <th className="px-4 py-2.5 font-medium">{t('blogPlans.result')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('blogPlans.detail')}</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const error = runError(run);
                  return (
                    <tr key={run.id} className="border-t hover:bg-surface/40">
                      <td className="whitespace-nowrap px-4 py-2.5">{run.scheduledAt ? new Date(run.scheduledAt).toLocaleString() : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {run.triggerType === 'MANUAL' ? t('blogPlans.triggerManual') : t('blogPlans.triggerAuto')}
                      </td>
                      <td className="px-4 py-2.5">{t(`blogPlans.runStatus.${run.status}`) || run.status}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">{run.csdnStatus || '—'}</td>
                      <td className="max-w-[14rem] px-4 py-2.5">
                        {run.localPostId ? (
                          <a href={`/blog/${run.localPostId}`} className="text-accent hover:underline">#{run.localPostId}</a>
                        ) : error ? (
                          <span className="line-clamp-1 text-red-600 dark:text-red-400" title={error}>{error}</span>
                        ) : run.csdnUrl ? (
                          <a href={run.csdnUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">CSDN</a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => setDetailRun(run)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-ink-secondary hover:bg-surface-muted">
                          <Eye className="h-3 w-3" /> {t('blogPlans.viewDetail')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              page={runsPage}
              pageSize={RUN_PAGE_SIZE}
              total={runsTotal}
              onPageChange={setRunsPage}
              className="!border-x-0 !border-b-0"
            />
          </div>
        )}
      </div>

      <PlanFormModal
        isOpen={formOpen}
        plan={plan}
        onClose={() => setFormOpen(false)}
        onSaved={() => { loadPlan(); loadRuns(runsPage); }}
      />
      <RunDetailModal isOpen={!!detailRun} run={detailRun} onClose={() => setDetailRun(null)} />
    </div>
  );
};

export default BlogPlanDetail;
