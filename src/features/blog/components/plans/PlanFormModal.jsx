import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import TimezoneSelect from '@components/common/TimezoneSelect';
import TimeInput from '@components/common/TimeInput';
import FormField from '@components/common/FormField';
import { formInputCls } from '@components/common/formStyles';
import { blogPlanService } from '../../services/blogPlanService';
import { useToast } from '@/hooks/useToast';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const initialForm = () => ({
  topic: '',
  timezone: 'Asia/Shanghai',
  triggerTime: '09:00',
  syncCsdn: false,
  audience: '',
  tone: '',
});

/**
 * 自定义计划：单主题 + 每日单触发时间，每天 AI 自动生成一篇不重复的文章
 */
const PlanFormModal = ({ isOpen, plan, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState(initialForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(plan?.id
        ? {
            topic: plan.topic,
            timezone: plan.timezone,
            triggerTime: plan.triggerTime || plan.triggerTimes?.[0] || '09:00',
            syncCsdn: !!plan.syncCsdn,
            audience: plan.audience || '',
            tone: plan.tone || '',
          }
        : initialForm());
      setError('');
    }
  }, [isOpen, plan]);

  const submit = async () => {
    if (!form.topic.trim()) {
      setError(t('blogPlans.topicRequired'));
      return;
    }
    if (!TIME_RE.test(form.triggerTime)) {
      setError(t('blogPlans.timeInvalid'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        topic: form.topic.trim(),
        timezone: form.timezone,
        triggerTime: form.triggerTime,
        syncCsdn: form.syncCsdn,
        audience: form.audience.trim(),
        tone: form.tone.trim(),
      };
      if (plan?.id) {
        await blogPlanService.updatePlan(plan.id, payload);
        toast.success(t('blogPlans.updated'));
      } else {
        await blogPlanService.createPlan(payload);
        toast.success(t('blogPlans.created'));
      }
      onClose();
      await onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      <button onClick={onClose} disabled={saving}
        className="rounded-xl border border-border px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
        {t('common.cancel')}
      </button>
      <button onClick={submit} disabled={saving}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {t('common.save')}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan?.id ? t('blogPlans.editTitle') : t('blogPlans.createCustomTitle')}
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4">
        <FormField label={t('blogPlans.topic')} hint={t('blogPlans.customDailyHint')}>
          <input className={formInputCls} value={form.topic} maxLength={500}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder={t('blogPlans.topicPlaceholder')} />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label={t('blogPlans.triggerTime')}>
            <TimeInput size="sm" value={form.triggerTime}
              onChange={(e) => setForm({ ...form, triggerTime: e.target.value })} />
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

        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <input type="checkbox" checked={form.syncCsdn}
            onChange={(e) => setForm({ ...form, syncCsdn: e.target.checked })}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
          {t('blogPlans.syncCsdn')}
        </label>

        {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}
      </div>
    </Modal>
  );
};

export default PlanFormModal;
