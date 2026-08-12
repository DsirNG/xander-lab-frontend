import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Loader2, Sparkles } from 'lucide-react';
import Modal from '@components/common/Modal';
import { blogPlanService } from '../../services/blogPlanService';
import { useToast } from '@/hooks/useToast';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_DAYS = 30;

const initialForm = () => ({
  topic: '',
  days: 7,
  time: '09:00',
  timezone: 'Asia/Shanghai',
  syncCsdn: false,
  audience: '',
  tone: '',
});

const inputCls = 'w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';
const labelCls = 'block text-xs font-medium text-ink-secondary mb-1';

/**
 * AI 生成计划：按主题方向 + 天数，生成 N 个一次性计划，
 * 从明天起每天同一时刻各发布一篇，执行完自动完结
 */
const PlanAiGenerateModal = ({ isOpen, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState(initialForm());
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [createdPlans, setCreatedPlans] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm());
      setError('');
      setCreatedPlans([]);
    }
  }, [isOpen]);

  const formatFireTime = (plan) => {
    if (!plan?.nextRunAt) return '—';
    try {
      return new Date(plan.nextRunAt).toLocaleString(undefined, {
        timeZone: plan.timezone || 'Asia/Shanghai',
      });
    } catch {
      return new Date(plan.nextRunAt).toLocaleString();
    }
  };

  const submit = async () => {
    if (!form.topic.trim()) {
      setError(t('blogPlans.topicRequired'));
      return;
    }
    if (!TIME_RE.test(form.time)) {
      setError(t('blogPlans.timeInvalid'));
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const plans = await blogPlanService.aiGenerate({
        topic: form.topic.trim(),
        days: form.days,
        time: form.time,
        timezone: form.timezone,
        syncCsdn: form.syncCsdn,
        audience: form.audience.trim(),
        tone: form.tone.trim(),
      });
      const created = plans || [];
      setCreatedPlans(created);
      toast.success(t('blogPlans.generatedPlans', { count: created.length }));
      await onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.generateFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const footer = (
    <>
      <button onClick={onClose} disabled={generating}
        className="rounded-xl border border-border px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
        {t('common.close')}
      </button>
      <button onClick={submit} disabled={generating}
        className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {t('blogPlans.aiGenerate')}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('blogPlans.aiGenerateTitle')}
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4">
        <p className="text-xs text-ink-faint">{t('blogPlans.aiGenerateDesc')}</p>

        <div>
          <label className={labelCls}>{t('blogPlans.aiSeed')}</label>
          <input className={inputCls} value={form.topic} maxLength={500}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder={t('blogPlans.aiSeedPlaceholder')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{t('blogPlans.days')}</label>
            <input type="number" min="1" max={MAX_DAYS} className={inputCls}
              value={form.days}
              onChange={(e) => setForm({ ...form, days: Math.min(MAX_DAYS, Math.max(1, Number(e.target.value) || 1)) })} />
          </div>
          <div>
            <label className={labelCls}>{t('blogPlans.triggerTime')}</label>
            <input type="time" step="60" className={inputCls} value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })} />
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

        {createdPlans.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-bold text-ink">
              {t('blogPlans.generatedPlans', { count: createdPlans.length })}
            </p>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {createdPlans.map((plan) => (
                <div key={plan.id} className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
                  <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-bold text-accent">
                    {formatFireTime(plan)}
                  </span>
                  <span className="truncate text-ink">{plan.topic}</span>
                  <span className="ml-auto shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {t('blogPlans.oneShot')}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-faint">{t('blogPlans.oneShotHint')}</p>
          </div>
        )}

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  );
};

export default PlanAiGenerateModal;