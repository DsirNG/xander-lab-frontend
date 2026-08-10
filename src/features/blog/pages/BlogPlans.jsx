import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock, ChevronDown, Loader2, Pencil, Plus, RefreshCcw, Trash2, Zap, X } from 'lucide-react';
import { blogPlanService, PLAN_STATUS, RUN_STATUS } from '../services/blogPlanService';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@components/common/LoadingSpinner';

/**
 * 定时发文计划管理页
 * 列表 / 新建 / 编辑 / 暂停恢复取消 / 手动执行 / 运行历史
 */
const BlogPlans = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [busyPlanId, setBusyPlanId] = useState(null);
  const [expandedRuns, setExpandedRuns] = useState(null);

  const [form, setForm] = useState({ topic: '', timezone: 'Asia/Shanghai', triggerTime: '09:00', syncCsdn: false, audience: '', tone: '' });
  const [formError, setFormError] = useState('');

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogPlanService.listPlans();
      setPlans(data || []);
    } catch {
      toast.error(t('blogPlans.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const resetForm = () => {
    setForm({ topic: '', timezone: 'Asia/Shanghai', triggerTime: '09:00', syncCsdn: false, audience: '', tone: '' });
    setFormError('');
    setEditingPlan(null);
  };

  const openCreate = () => { resetForm(); setCreating(true); };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      topic: plan.topic,
      timezone: plan.timezone,
      triggerTime: plan.triggerTime,
      syncCsdn: !!plan.syncCsdn,
      audience: plan.audience || '',
      tone: plan.tone || '',
    });
    setFormError('');
    setCreating(true);
  };

  const submitForm = async () => {
    if (!form.topic.trim()) {
      setFormError(t('blogPlans.topicRequired'));
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.triggerTime)) {
      setFormError(t('blogPlans.timeInvalid'));
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        topic: form.topic.trim(),
        timezone: form.timezone,
        triggerTime: form.triggerTime,
        syncCsdn: form.syncCsdn,
        audience: form.audience.trim(),
        tone: form.tone.trim(),
      };
      if (editingPlan?.id) {
        await blogPlanService.updatePlan(editingPlan.id, payload);
        toast.success(t('blogPlans.updated'));
      } else {
        await blogPlanService.createPlan(payload);
        toast.success(t('blogPlans.created'));
      }
      setCreating(false);
      resetForm();
      await loadPlans();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (plan, action, okKey) => {
    setBusyPlanId(plan.id);
    try {
      await blogPlanService.updatePlanStatus(plan.id, action);
      toast.success(t(okKey));
      await loadPlans();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.actionFailed'));
    } finally {
      setBusyPlanId(null);
    }
  };

  const triggerNow = async (plan) => {
    setBusyPlanId(plan.id);
    try {
      await blogPlanService.triggerPlan(plan.id);
      toast.success(t('blogPlans.triggered'));
      await loadPlans();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.triggerFailed'));
    } finally {
      setBusyPlanId(null);
    }
  };

  const deletePlan = async (plan) => {
    if (!window.confirm(t('blogPlans.deleteConfirm').replace('{{topic}}', plan.topic))) return;
    setBusyPlanId(plan.id);
    try {
      await blogPlanService.deletePlan(plan.id);
      toast.success(t('blogPlans.deleted'));
      await loadPlans();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.deleteFailed'));
    } finally {
      setBusyPlanId(null);
    }
  };

  const toggleRuns = async (plan) => {
    setExpandedRuns(expandedRuns === plan.id ? null : plan.id);
  };

  const inputCls = 'w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';
  const labelCls = 'block text-xs font-medium text-ink-secondary mb-1';

  const planBadge = (status) => {
    const map = {
      [PLAN_STATUS.ACTIVE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      [PLAN_STATUS.RUNNING]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      [PLAN_STATUS.PAUSED]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      [PLAN_STATUS.CANCELLED]: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    const label = {
      [PLAN_STATUS.ACTIVE]: t('blogPlans.statusActive'),
      [PLAN_STATUS.RUNNING]: t('blogPlans.statusRunning'),
      [PLAN_STATUS.PAUSED]: t('blogPlans.statusPaused'),
      [PLAN_STATUS.CANCELLED]: t('blogPlans.statusCancelled'),
    };
    return (
      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {label[status] || status}
      </span>
    );
  };

  const renderForm = () => (
    <div className="mt-6 rounded-2xl border border-border bg-canvas/60 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{editingPlan?.id ? t('blogPlans.editTitle') : t('blogPlans.createTitle')}</h2>
        <button onClick={() => { setCreating(false); resetForm(); }} className="p-1 text-ink-faint hover:text-ink" aria-label={t('common.closeNotification')}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className={labelCls}>{t('blogPlans.topic')}</label>
          <input className={inputCls} value={form.topic} maxLength={500}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder={t('blogPlans.topicPlaceholder')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('blogPlans.triggerTime')}</label>
            <input type="time" step="60" className={inputCls} value={form.triggerTime}
              onChange={(e) => setForm({ ...form, triggerTime: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t('blogPlans.timezone')}</label>
            <input className={inputCls} value={form.timezone} maxLength={64}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="Asia/Shanghai" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('blogPlans.audience')}</label>
            <input className={inputCls} value={form.audience} maxLength={120}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              placeholder={t('blogPlans.audiencePlaceholder')} />
          </div>
          <div>
            <label className={labelCls}>{t('blogPlans.tone')}</label>
            <input className={inputCls} value={form.tone} maxLength={60}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              placeholder={t('blogPlans.tonePlaceholder')} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <input type="checkbox" checked={form.syncCsdn}
            onChange={(e) => setForm({ ...form, syncCsdn: e.target.checked })}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
          {t('blogPlans.syncCsdn')}
        </label>

        {formError && <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={() => { setCreating(false); resetForm(); }} disabled={saving}
            className="rounded-xl border border-border px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
            {t('common.cancel')}
          </button>
          <button onClick={submitForm} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );

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

      {creating && renderForm()}

      <div className="mt-6 space-y-4">
        {loading ? (
          <LoadingSpinner fullScreen />
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <p className="text-sm text-ink-faint">{t('blogPlans.empty')}</p>
            <p className="mt-1 text-xs text-ink-faint">{t('blogPlans.emptyHint')}</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-border bg-canvas/60 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-ink">{plan.topic}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {plan.triggerTime} ({plan.timezone})
                    </span>
                    <span>{t('blogPlans.syncCsdn')}: {plan.syncCsdn ? t('blogPlans.yes') : t('blogPlans.no')}</span>
                    <span>{t('blogPlans.nextRun')}: {plan.nextRunAt ? new Date(plan.nextRunAt).toLocaleString() : '—'}</span>
                  </p>
                </div>
                {planBadge(plan.status)}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(plan.status === PLAN_STATUS.ACTIVE || plan.status === PLAN_STATUS.PAUSED) && (
                  <>
                    <button
                      onClick={() => triggerNow(plan)}
                      disabled={!!busyPlanId || plan.status === PLAN_STATUS.RUNNING}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {busyPlanId === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                      {t('blogPlans.triggerNow')}
                    </button>
                    {plan.status === PLAN_STATUS.ACTIVE ? (
                      <button onClick={() => runAction(plan, 'PAUSED', 'blogPlans.paused')} disabled={!!busyPlanId}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                        {t('blogPlans.pause')}
                      </button>
                    ) : (
                      <button onClick={() => runAction(plan, 'RESUME', 'blogPlans.resumed')} disabled={!!busyPlanId}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                        {t('blogPlans.resume')}
                      </button>
                    )}
                    <button onClick={() => openEdit(plan)} disabled={!!busyPlanId}
                      className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
                      <Pencil className="h-3 w-3" /> {t('blogPlans.edit')}
                    </button>
                  </>
                )}
                {plan.status !== PLAN_STATUS.RUNNING && (
                  <button onClick={() => deletePlan(plan)} disabled={!!busyPlanId}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 className="h-3 w-3" /> {t('blogPlans.delete')}
                  </button>
                )}
                {plan.status !== PLAN_STATUS.RUNNING && plan.status !== PLAN_STATUS.CANCELLED && (
                  <button onClick={() => runAction(plan, 'CANCELLED', 'blogPlans.cancelled')} disabled={!!busyPlanId}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs text-ink-faint hover:bg-surface-muted disabled:opacity-50">
                    {t('blogPlans.cancel')}
                  </button>
                )}
                <button onClick={() => toggleRuns(plan)}
                  className="ml-auto inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-muted">
                  <RefreshCcw className="h-3 w-3" /> {t('blogPlans.runHistory')}
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedRuns === plan.id ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedRuns === plan.id && <PlanRuns planId={plan.id} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function PlanRuns({ planId }) {
  const { t } = useTranslation();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    blogPlanService.listRuns(planId, { page: 1, size: 20 })
      .then((data) => { if (alive) setRuns(data?.records || []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [planId]);

  if (loading) {
    return <div className="mt-4 flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-ink-faint" /></div>;
  }
  if (runs.length === 0) {
    return <p className="mt-4 py-3 text-center text-xs text-ink-faint">{t('blogPlans.noRuns')}</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-muted text-left text-ink-faint">
            <th className="px-3 py-2 font-medium">{t('blogPlans.time')}</th>
            <th className="px-3 py-2 font-medium">{t('blogPlans.status')}</th>
            <th className="px-3 py-2 font-medium">CSDN</th>
            <th className="px-3 py-2 font-medium">{t('blogPlans.result')}</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const error = run.errorMessage
              || (run.reviewPass === false ? run.reviewReason : '')
              || run.csdnErrorMessage;
            return (
              <tr key={run.id} className="border-t">
                <td className="whitespace-nowrap px-3 py-2">{run.scheduledAt ? new Date(run.scheduledAt).toLocaleString() : '—'}</td>
                <td className="px-3 py-2">{t(`blogPlans.runStatus.${run.status}`) || run.status}</td>
                <td className="whitespace-nowrap px-3 py-2">{run.csdnStatus || '—'}</td>
                <td className="max-w-[16rem] px-3 py-2">
                  {run.localPostId ? (
                    <a href={`/blog/${run.localPostId}`} className="text-accent hover:underline">#{run.localPostId}</a>
                  ) : error ? (
                    <span className="line-clamp-1 text-red-600 dark:text-red-400" title={error}>{error}</span>
                  ) : run.csdnUrl ? (
                    <a href={run.csdnUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">CSDN</a>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BlogPlans;