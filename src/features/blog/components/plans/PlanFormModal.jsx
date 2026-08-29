import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Check, Clock3, Sparkles } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import TimezoneSelect from '@components/common/TimezoneSelect';
import TimeInput from '@components/common/TimeInput';
import FormField from '@components/common/FormField';
import CustomSelect from '@components/common/CustomSelect';
import { formInputCls } from '@components/common/formStyles';
import { blogPlanService } from '../../services/blogPlanService';
import { useToast } from '@/hooks/useToast';
import { knowledgeService } from '@/features/knowledge/services/knowledgeService';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const initialForm = () => ({
  topic: '',
  scheduleType: 'DAILY',
  scheduledDate: tomorrow(),
  timezone: 'Asia/Shanghai',
  triggerTime: '09:00',
  syncCsdn: false,
  syncJuejin: false,
  audience: '',
  tone: '',
  aiOption: 'DEEP',
  knowledgeMaterialId: '',
  autoPublish: true,
});

const nextRunParts = (triggerTime, timezone, locale, scheduleType, scheduledDate) => {
  try {
    if (scheduleType !== 'DAILY' && scheduledDate) {
      const date = new Date(`${scheduledDate}T00:00:00Z`);
      return {
        date: scheduledDate.replaceAll('-', '/'),
        weekday: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(date),
      };
    }
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
    const today = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
    const nextDay = `${parts.hour}:${parts.minute}` < triggerTime ? today : today + 86_400_000;
    const date = new Date(nextDay);
    return {
      date: `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}`,
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(date),
    };
  } catch {
    return { date: '—', weekday: '' };
  }
};

/** 自定义计划：单主题 + 每日单触发时间。 */
const PlanFormModal = ({ isOpen, plan, onClose, onSaved }) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState(initialForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [knowledgeMaterials, setKnowledgeMaterials] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(plan?.id
      ? {
          topic: plan.topic || '',
          scheduleType: plan.scheduleType || (plan.runOnce ? 'ONCE' : 'DAILY'),
          scheduledDate: plan.scheduledDate || tomorrow(),
          timezone: plan.timezone || 'Asia/Shanghai',
          triggerTime: plan.triggerTime || plan.triggerTimes?.[0] || '09:00',
          syncCsdn: !!plan.syncCsdn,
          syncJuejin: !!plan.syncJuejin,
          audience: plan.audience || '',
          tone: plan.tone || '',
          aiOption: plan.aiOption || 'DEEP',
          knowledgeMaterialId: plan.knowledgeMaterialId ? String(plan.knowledgeMaterialId) : '',
          autoPublish: plan.autoPublish !== false,
        }
      : initialForm());
    setError('');
    knowledgeService.list({ archive: 'ACTIVE' }, { _silent: true })
      .then((items) => setKnowledgeMaterials(Array.isArray(items) ? items : []))
      .catch(() => setKnowledgeMaterials([]));
  }, [isOpen, plan]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const submit = async () => {
    if (!form.topic.trim()) {
      setError(t('blogPlans.topicRequired'));
      return;
    }
    if (!TIME_RE.test(form.triggerTime)) {
      setError(t('blogPlans.timeInvalid'));
      return;
    }
    if (form.scheduleType !== 'DAILY' && !form.scheduledDate) {
      setError(t('blogPlans.executionDate'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        topic: form.topic.trim(),
        scheduleType: form.scheduleType,
        scheduledDate: form.scheduleType === 'DAILY' ? null : form.scheduledDate,
        timezone: form.timezone,
        triggerTime: form.triggerTime,
        syncCsdn: form.syncCsdn,
        syncJuejin: form.syncJuejin,
        audience: form.audience.trim(),
        tone: form.tone.trim(),
        aiOption: form.aiOption,
        knowledgeMaterialId: form.knowledgeMaterialId ? Number(form.knowledgeMaterialId) : null,
        autoPublish: form.autoPublish,
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
      <Button onClick={onClose} disabled={saving} variant="outline">
        {t('common.cancel')}
      </Button>
      <Button onClick={submit} loading={saving} variant="primary">
        {t('common.save')}
      </Button>
    </>
  );

  const nextRun = nextRunParts(
    form.triggerTime, form.timezone, i18n.resolvedLanguage, form.scheduleType, form.scheduledDate,
  );
  const planTypes = [
    ['ONCE', 'typeOnce', 'typeOnceHint'],
    ['DAILY', 'typeDaily', 'typeDailyHint'],
    ['WEEKLY', 'typeWeekly', 'typeWeeklyHint'],
  ];
  const aiOptions = [
    ['DEEP', 'aiDeep', 'aiDeepHint'],
    ['PRACTICAL', 'aiPractical', 'aiPracticalHint'],
    ['NEWS', 'aiNews', 'aiNewsHint'],
    ['OPINION', 'aiOpinion', 'aiOpinionHint'],
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan?.id ? t('blogPlans.editTitle') : t('blogPlans.createCustomTitle')}
      width="max-w-4xl"
      footer={footer}
      closeOnOutsideClick={!saving}
    >
      <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-5">
          <FormField label={t('blogPlans.topic')} hint={t('blogPlans.customDailyHint')}>
            <div className="relative">
              <input className={`${formInputCls} pr-16`} value={form.topic} maxLength={500}
                onChange={(e) => updateForm('topic', e.target.value)}
                placeholder={t('blogPlans.topicPlaceholder')} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-micro text-ink-faint">
                {form.topic.length}/500
              </span>
            </div>
          </FormField>

          <FormField label={t('blogPlans.knowledgeBase')}>
            <CustomSelect size="sm" value={form.knowledgeMaterialId}
              onChange={(value) => updateForm('knowledgeMaterialId', value)}
              options={[
                { value: '', label: t('blogPlans.noKnowledgeBase') },
                ...knowledgeMaterials.map((item) => ({ value: String(item.id), label: item.title })),
              ]} />
          </FormField>

          <div>
            <div className="mb-2 text-caption font-semibold text-ink">{t('blogPlans.scheduleType')}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {planTypes.map(([value, titleKey, hintKey]) => {
                const selected = form.scheduleType === value;
                return <button key={value} type="button" onClick={() => updateForm('scheduleType', value)}
                  className={`relative rounded-xl border px-4 py-3 text-left transition-colors ${selected ? 'border-accent bg-accent-soft shadow-sm' : 'border-border bg-canvas hover:border-border-strong'}`}>
                  {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-accent" />}
                  <div className={`text-body font-semibold ${selected ? 'text-accent' : 'text-ink'}`}>{t(`blogPlans.${titleKey}`)}</div>
                  <div className="mt-1 pr-4 text-micro text-ink-faint">{t(`blogPlans.${hintKey}`)}</div>
                </button>;
              })}
            </div>
          </div>

          <FormField label={t('blogPlans.triggerTime')}>
            <div className={`grid grid-cols-1 gap-3 ${form.scheduleType === 'DAILY' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              {form.scheduleType !== 'DAILY' && <input type="date" className={formInputCls}
                min={tomorrow()} value={form.scheduledDate}
                onChange={(e) => updateForm('scheduledDate', e.target.value)}
                aria-label={t(form.scheduleType === 'ONCE' ? 'blogPlans.executionDate' : 'blogPlans.firstExecutionDate')} />}
              <TimeInput size="sm" value={form.triggerTime}
                onChange={(e) => updateForm('triggerTime', e.target.value)} />
              <TimezoneSelect size="sm" value={form.timezone}
                onChange={(value) => updateForm('timezone', value)} />
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('blogPlans.audience')}>
              <input className={formInputCls} value={form.audience} maxLength={120}
                onChange={(e) => updateForm('audience', e.target.value)}
                placeholder={t('blogPlans.audiencePlaceholder')} />
            </FormField>
            <FormField label={t('blogPlans.tone')}>
              <input className={formInputCls} value={form.tone} maxLength={60}
                onChange={(e) => updateForm('tone', e.target.value)}
                placeholder={t('blogPlans.tonePlaceholder')} />
            </FormField>
          </div>

          <div>
            <div className="mb-2 text-caption font-semibold text-ink">{t('blogPlans.aiDirection')}</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {aiOptions.map(([value, titleKey, hintKey]) => {
                const selected = form.aiOption === value;
                return <button key={value} type="button" onClick={() => updateForm('aiOption', value)}
                  className={`relative rounded-xl border p-3 text-left transition-colors ${selected ? 'border-accent bg-accent-soft' : 'border-border bg-canvas hover:border-border-strong'}`}>
                  {selected && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-accent" />}
                  <div className={`text-caption font-semibold ${selected ? 'text-accent' : 'text-ink'}`}>{t(`blogPlans.${titleKey}`)}</div>
                  <div className="mt-1 pr-2 text-micro text-ink-faint">{t(`blogPlans.${hintKey}`)}</div>
                </button>;
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 text-caption font-semibold text-ink">{t('blogPlans.publishPlatforms')}</div>
            <div className={`flex flex-wrap gap-2 ${form.autoPublish ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-2 rounded-xl border border-accent bg-accent-soft px-3 py-2 text-caption text-accent">
                <Check className="h-4 w-4" /> {t('blogPlans.localPlatform')}
              </div>
              {[
                ['syncJuejin', form.syncJuejin, t('blogPlans.syncJuejin')],
                ['syncCsdn', form.syncCsdn, t('blogPlans.syncCsdn')],
              ].map(([field, checked, label]) => (
                <label key={field} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-caption transition-colors ${checked ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-canvas text-ink-secondary'}`}>
                  <input type="checkbox" checked={checked} disabled={!form.autoPublish}
                    onChange={(e) => updateForm(field, e.target.checked)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-body text-ink-secondary">
            <input type="checkbox" checked={form.autoPublish}
              onChange={(e) => updateForm('autoPublish', e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
            {t('blogPlans.autoPublish')}
          </label>

          {error && <div role="alert" className="text-caption text-danger">{error}</div>}
        </div>

        <aside className="flex flex-col rounded-2xl border border-border bg-surface-muted p-5 text-ink-secondary">
          <div className="text-title text-ink">{t('blogPlans.title')}</div>
          <div className="mt-5 text-caption font-semibold text-ink">{t('blogPlans.nextRun')}</div>
          <div className="mt-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-title text-ink">{nextRun.date}</span>
            <span className="text-caption text-ink-muted">{nextRun.weekday}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-body text-ink">
            <Clock3 className="h-4 w-4 text-ink-faint" /> {form.triggerTime}
          </div>

          <div className="my-5 h-px bg-border" />
          <div className="space-y-4">
            <div>
              <div className="text-micro text-ink-faint">{t('blogPlans.topic')}</div>
              <div className="mt-1 break-words text-body font-semibold text-ink">{form.topic.trim() || t('blogPlans.topicPlaceholder')}</div>
            </div>
            <div>
              <div className="text-micro text-ink-faint">{t('blogPlans.timezone')}</div>
              <div className="mt-1 text-body font-semibold text-ink">{form.timezone}</div>
            </div>
            <div>
              <div className="text-micro text-ink-faint">{t('blogPlans.scheduleType')}</div>
              <div className="mt-1 text-body font-semibold text-ink">
                {t(`blogPlans.${planTypes.find(([value]) => value === form.scheduleType)?.[1]}`)}
              </div>
            </div>
            <div>
              <div className="text-micro text-ink-faint">{t('blogPlans.publishPlatforms')}</div>
              <div className="mt-1 text-body font-semibold text-ink">
                {[t('blogPlans.localPlatform'), form.syncCsdn && 'CSDN', form.syncJuejin && '掘金'].filter(Boolean).join(' · ')}
              </div>
            </div>
            {form.audience.trim() && <div>
              <div className="text-micro text-ink-faint">{t('blogPlans.audience')}</div>
              <div className="mt-1 text-body font-semibold text-ink">{form.audience.trim()}</div>
            </div>}
            {form.tone.trim() && <div>
              <div className="text-micro text-ink-faint">{t('blogPlans.tone')}</div>
              <div className="mt-1 text-body font-semibold text-ink">{form.tone.trim()}</div>
            </div>}
          </div>

          <div className="mt-auto pt-5">
            <div className="flex gap-3 rounded-xl bg-accent-soft p-4 text-caption text-accent-fg">
              <Sparkles className="h-4 w-4 shrink-0 text-accent" />
              <span>{t('blogPlans.customDailyHint')}</span>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
};

export default PlanFormModal;
