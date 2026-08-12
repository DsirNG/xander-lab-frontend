import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import { blogPlanService } from '../../services/blogPlanService';
import { useToast } from '@/hooks/useToast';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_TIMES = 5;
const MAX_TOPICS = 30;

const initialForm = () => ({
  topic: '',
  timezone: 'Asia/Shanghai',
  triggerTimes: ['09:00'],
  topics: [],
  days: 7,
  syncCsdn: false,
  audience: '',
  tone: '',
});

const inputCls = 'w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';
const labelCls = 'block text-xs font-medium text-ink-secondary mb-1';

/**
 * 新建 / 编辑定时发文计划弹窗
 * - 多时段：triggerTimes（1-5 个 HH:mm，可增删）
 * - 多日主题队列：topics 每天按序消费一个；可 AI 生成主题
 */
const PlanFormModal = ({ isOpen, plan, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState(initialForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingTopics, setGeneratingTopics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(plan?.id
        ? {
            topic: plan.topic,
            timezone: plan.timezone,
            triggerTimes:
              plan.triggerTimes?.length > 0
                ? plan.triggerTimes
                : [plan.triggerTime || '09:00'],
            topics: plan.topics || [],
            days: Math.max(1, plan.topics?.length || 7),
            syncCsdn: !!plan.syncCsdn,
            audience: plan.audience || '',
            tone: plan.tone || '',
          }
        : initialForm());
      setError('');
    }
  }, [isOpen, plan]);

  const setTime = (index, value) => {
    setForm((prev) => ({
      ...prev,
      triggerTimes: prev.triggerTimes.map((time, i) => (i === index ? value : time)),
    }));
  };

  const addTime = () => {
    setForm((prev) =>
      prev.triggerTimes.length >= MAX_TIMES
        ? prev
        : { ...prev, triggerTimes: [...prev.triggerTimes, '09:00'] }
    );
  };

  const removeTime = (index) => {
    setForm((prev) => ({
      ...prev,
      triggerTimes: prev.triggerTimes.filter((_, i) => i !== index),
    }));
  };

  const setTopicAt = (index, value) => {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.map((topic, i) => (i === index ? value : topic)),
    }));
  };

  const addTopic = () => {
    setForm((prev) =>
      prev.topics.length >= MAX_TOPICS
        ? prev
        : { ...prev, topics: [...prev.topics, ''] }
    );
  };

  const removeTopicAt = (index) => {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const generateTopics = async () => {
    if (!form.topic.trim()) {
      setError(t('blogPlans.topicRequired'));
      return;
    }
    setGeneratingTopics(true);
    setError('');
    try {
      const topics = await blogPlanService.generateTopics({
        topic: form.topic.trim(),
        count: Math.min(MAX_TOPICS, Math.max(1, form.days)),
        audience: form.audience.trim(),
        tone: form.tone.trim(),
        excludeTitles: form.topics.map((item) => item.trim()).filter(Boolean),
      });
      const merged = Array.from(
        new Set([...(form.topics.map((item) => item.trim()).filter(Boolean)), ...topics])
      );
      setForm((prev) => ({ ...prev, topics: merged, days: merged.length }));
      toast.success(t('blogPlans.topicsGenerated', { count: topics.length }));
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.topicsGenerateFailed'));
    } finally {
      setGeneratingTopics(false);
    }
  };

  const submit = async () => {
    if (!form.topic.trim()) {
      setError(t('blogPlans.topicRequired'));
      return;
    }
    const triggerTimes = form.triggerTimes.map((time) => time.trim()).filter(Boolean);
    if (triggerTimes.length === 0 || triggerTimes.some((time) => !TIME_RE.test(time))) {
      setError(t('blogPlans.timeInvalid'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        topic: form.topic.trim(),
        timezone: form.timezone,
        triggerTimes,
        topics: Array.from(new Set(form.topics.map((item) => item.trim()).filter(Boolean))),
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
      title={plan?.id ? t('blogPlans.editTitle') : t('blogPlans.createTitle')}
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>{t('blogPlans.topic')}</label>
          <input className={inputCls} value={form.topic} maxLength={500}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder={t('blogPlans.topicPlaceholder')} />
        </div>

        <div>
          <label className={labelCls}>{t('blogPlans.triggerTime')}</label>
          <div className="space-y-2">
            {form.triggerTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="time" step="60" className={inputCls} value={time}
                  onChange={(e) => setTime(index, e.target.value)} />
                {form.triggerTimes.length > 1 && (
                  <button type="button" onClick={() => removeTime(index)}
                    aria-label={t('blogPlans.removeTime')}
                    className="shrink-0 rounded-lg border border-border p-2 text-ink-faint hover:bg-surface-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addTime}
            disabled={form.triggerTimes.length >= MAX_TIMES}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> {t('blogPlans.addTime')}
          </button>
          {form.triggerTimes.length >= MAX_TIMES && (
            <p className="mt-1 text-xs text-ink-faint">{t('blogPlans.timesMaxHint')}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>{t('blogPlans.timezone')}</label>
          <input className={inputCls} value={form.timezone} maxLength={64}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            placeholder="Asia/Shanghai" />
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

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-bold text-ink">{t('blogPlans.topicsQueue')}</p>
          <p className="mt-1 text-xs text-ink-faint">{t('blogPlans.topicsHint')}</p>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="w-28">
              <label className={labelCls}>{t('blogPlans.days')}</label>
              <input type="number" min="1" max={MAX_TOPICS} className={inputCls}
                value={form.days}
                onChange={(e) => setForm({ ...form, days: Number(e.target.value) || 1 })} />
            </div>
            <button type="button" onClick={generateTopics} disabled={generatingTopics || saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50">
              {generatingTopics ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {t('blogPlans.generateTopics')}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {form.topics.map((topic, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-bold text-accent">{index + 1}</span>
                <input className={inputCls} value={topic} maxLength={500}
                  onChange={(e) => setTopicAt(index, e.target.value)}
                  placeholder={t('blogPlans.topicQueuePlaceholder')} />
                <button type="button" onClick={() => removeTopicAt(index)}
                  aria-label={t('blogPlans.removeTopic')}
                  className="shrink-0 rounded-lg border border-border p-2 text-ink-faint hover:bg-surface-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.topics.length === 0 && (
              <p className="text-xs text-ink-faint">{t('blogPlans.topicQueueEmpty')}</p>
            )}
          </div>
          <button type="button" onClick={addTopic}
            disabled={form.topics.length >= MAX_TOPICS}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:bg-surface-muted disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> {t('blogPlans.addTopic')}
          </button>
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
