import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import TimezoneSelect from '@components/common/TimezoneSelect';
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

const inputCls = 'w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';
const labelCls = 'block text-xs font-medium text-ink-secondary mb-1';

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
        className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
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
        <div>
          <label className={labelCls}>{t('blogPlans.topic')}</label>
          <input className={inputCls} value={form.topic} maxLength={500}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder={t('blogPlans.topicPlaceholder')} />
          <p className="mt-1 text-xs text-ink-faint">{t('blogPlans.customDailyHint')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('blogPlans.triggerTime')}</label>
            <input type="time" step="60" className={inputCls} value={form.triggerTime}
              onChange={(e) => setForm({ ...form, triggerTime: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t('blogPlans.timezone')}</label>
            <TimezoneSelect
              size="sm"
              value={form.timezone}
              onChange={(value) => setForm({ ...form, timezone: value })}
            />
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

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  );
};

export default PlanFormModal;
