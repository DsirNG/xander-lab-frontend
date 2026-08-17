import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Sparkles } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import TimezoneSelect from '@components/common/TimezoneSelect';
import TimeInput from '@components/common/TimeInput';
import FormField from '@components/common/FormField';
import { formInputCls } from '@components/common/formStyles';
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
  syncJuejin: false,
  audience: '',
  tone: '',
});

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
        syncJuejin: form.syncJuejin,
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
      <Button onClick={onClose} disabled={generating} variant="outline">
        {t('common.close')}
      </Button>
      <Button onClick={submit} loading={generating} variant="primary" icon={Sparkles}>
        {t('blogPlans.aiGenerate')}
      </Button>
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
        <div className="text-xs text-ink-faint">{t('blogPlans.aiGenerateDesc')}</div>

        <FormField label={t('blogPlans.aiSeed')}>
          <input className={formInputCls} value={form.topic} maxLength={500}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder={t('blogPlans.aiSeedPlaceholder')} />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label={t('blogPlans.days')}>
            <input type="number" min="1" max={MAX_DAYS} className={formInputCls}
              value={form.days}
              onChange={(e) => setForm({ ...form, days: Math.min(MAX_DAYS, Math.max(1, Number(e.target.value) || 1)) })} />
          </FormField>
          <FormField label={t('blogPlans.triggerTime')}>
            <TimeInput size="sm" value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </FormField>
          <FormField label={t('blogPlans.timezone')}>
            <TimezoneSelect
              size="sm"
              value={form.timezone}
              onChange={(value) => setForm({ ...form, timezone: value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label={t('blogPlans.audience')}>
            <input className={formInputCls} value={form.audience} maxLength={120}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              placeholder={t('blogPlans.audiencePlaceholder')} />
          </FormField>
          <FormField label={t('blogPlans.tone')}>
            <input className={formInputCls} value={form.tone} maxLength={60}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              placeholder={t('blogPlans.tonePlaceholder')} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={form.syncCsdn}
              onChange={(e) => setForm({ ...form, syncCsdn: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
            {t('blogPlans.syncCsdn')}
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={form.syncJuejin}
              onChange={(e) => setForm({ ...form, syncJuejin: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
            {t('blogPlans.syncJuejin')}
          </label>
        </div>

        {createdPlans.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="text-xs font-bold text-ink">
              {t('blogPlans.generatedPlans', { count: createdPlans.length })}
            </div>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {createdPlans.map((plan) => (
                <div key={plan.id} className="flex min-w-0 items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
                  <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-bold text-accent">
                    {formatFireTime(plan)}
                  </span>
                  <span className="min-w-0 truncate text-ink">{plan.topic}</span>
                  <span className="ml-auto shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {t('blogPlans.oneShot')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-ink-faint">{t('blogPlans.oneShotHint')}</div>
          </div>
        )}

        {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}
      </div>
    </Modal>
  );
};

export default PlanAiGenerateModal;