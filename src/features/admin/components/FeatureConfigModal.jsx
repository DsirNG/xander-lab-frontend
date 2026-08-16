import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import FormField from '@components/common/FormField';
import CustomSelect from '@components/common/CustomSelect';
import { formInputCls } from '@components/common/formStyles';
import { useToast } from '@/hooks/useToast';
import { adminService } from '../services/adminService';

/**
 * 功能模型配置弹窗：为主模型/兜底模型各选择一个供应商 + 模型名 + 接口风格。
 * 两个槽位均留空 = 该功能未启用管理台路由，回退环境变量。
 * 接口风格按功能过滤：图片功能可选图片/对话接口，文本功能可选对话/Responses 接口。
 */
const API_STYLE_IMAGES = 'IMAGES_GENERATIONS';
const API_STYLE_CHAT = 'CHAT_COMPLETIONS';
const API_STYLE_CHAT_PROMPT = 'CHAT_PROMPT';
const API_STYLE_RESPONSES = 'RESPONSES';

const FeatureConfigModal = ({ isOpen, config, providers, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [enabled, setEnabled] = useState(false);
  const [primaryProviderId, setPrimaryProviderId] = useState(null);
  const [primaryModel, setPrimaryModel] = useState('');
  const [primaryApiStyle, setPrimaryApiStyle] = useState('');
  const [fallbackProviderId, setFallbackProviderId] = useState(null);
  const [fallbackModel, setFallbackModel] = useState('');
  const [fallbackApiStyle, setFallbackApiStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const providerOptions = useMemo(
    () => providers.map((p) => ({
      value: p.id,
      label: p.baseUrl ? `${p.name} · ${p.baseUrl}` : p.name,
    })),
    [providers],
  );
  const fallbackOptions = useMemo(
    () => [{ value: '', label: t('admin.configs.noFallback') }, ...providerOptions],
    [providerOptions, t],
  );
  const styleOptions = useMemo(() => {
    const isImage = config?.featureKey === 'blog_agent_image';
    const options = isImage
      ? [API_STYLE_CHAT, API_STYLE_CHAT_PROMPT, API_STYLE_IMAGES]
      : [API_STYLE_CHAT, API_STYLE_RESPONSES];
    return options.map((style) => ({
      value: style,
      label: style === API_STYLE_IMAGES
        ? t('admin.configs.apiStyleImages')
        : style === API_STYLE_CHAT
          ? t('admin.configs.apiStyleChat')
          : style === API_STYLE_CHAT_PROMPT
            ? t('admin.configs.apiStyleChatPrompt')
            : t('admin.configs.apiStyleResponses'),
    }));
  }, [config?.featureKey, t]);

  useEffect(() => {
    if (!isOpen) return;
    if (config) {
      setEnabled(config.enabled);
      setPrimaryProviderId(config.primaryProviderId || null);
      setPrimaryModel(config.primaryModel || '');
      setPrimaryApiStyle(config.primaryApiStyle || '');
      setFallbackProviderId(config.fallbackProviderId || null);
      setFallbackModel(config.fallbackModel || '');
      setFallbackApiStyle(config.fallbackApiStyle || '');
    } else {
      setEnabled(false);
      setPrimaryProviderId(null);
      setPrimaryModel('');
      setPrimaryApiStyle('');
      setFallbackProviderId(null);
      setFallbackModel('');
      setFallbackApiStyle('');
    }
    setFormError('');
  }, [isOpen, config]);

  const handleSubmit = async () => {
    const primaryModelTrimmed = primaryModel.trim();
    const fallbackModelTrimmed = fallbackModel.trim();
    if (!enabled && (primaryProviderId || primaryModelTrimmed || primaryApiStyle
        || fallbackProviderId || fallbackModelTrimmed || fallbackApiStyle)) {
      setFormError(t('admin.configs.formUntypedWhileEnabled'));
      return;
    }
    if (enabled && !primaryProviderId) {
      setFormError(t('admin.configs.formPrimaryRequired'));
      return;
    }
    if (primaryProviderId && (!primaryModelTrimmed || !primaryApiStyle)) {
      setFormError(t('admin.configs.formModelRequired'));
      return;
    }
    if (fallbackProviderId && (!fallbackModelTrimmed || !fallbackApiStyle)) {
      setFormError(t('admin.configs.formModelRequired'));
      return;
    }
    if (primaryProviderId && fallbackProviderId && primaryProviderId === fallbackProviderId
        && primaryModelTrimmed === fallbackModelTrimmed) {
      setFormError(t('admin.configs.formFallbackDuplicate'));
      return;
    }
    try {
      setSaving(true);
      await adminService.updateFeatureConfig(config.featureKey, {
        enabled,
        primaryProviderId,
        primaryModel: primaryModelTrimmed || null,
        primaryApiStyle: primaryApiStyle || null,
        fallbackProviderId,
        fallbackModel: fallbackModelTrimmed || null,
        fallbackApiStyle: fallbackApiStyle || null,
      });
      toast.success(t('admin.configs.updated'));
      onClose();
      onSaved?.();
    } catch (err) {
      setFormError(err?.response?.data?.message || t('admin.configs.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="rounded-xl px-5 py-2.5 text-caption font-bold text-ink-muted transition hover:bg-surface-muted disabled:opacity-50"
      >
        {t('common.cancel')}
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-caption font-bold text-white transition hover:bg-accent active:scale-95 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {t('common.save')}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.configs.editTitle', { feature: t(`admin.configs.feature.${config?.featureKey}`) })}
      width="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-5">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent-200"
          />
          {t('admin.configs.formEnabled')}
          <span className="text-micro font-normal text-ink-faint">{t('admin.configs.formEnabledHint')}</span>
        </label>

        <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-micro leading-relaxed text-ink-muted">
          {t('admin.configs.configHint')}
        </p>

        <div>
          <p className="mb-2 text-xs font-bold text-ink-secondary">{t('admin.configs.primary')}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label={t('admin.configs.primaryProvider')}>
              <CustomSelect
                size="md"
                options={providerOptions}
                value={primaryProviderId}
                onChange={setPrimaryProviderId}
                placeholder={t('admin.configs.selectProvider')}
              />
            </FormField>
            <FormField label={t('admin.configs.primaryModel')} htmlFor="admin-config-primary-model">
              <input
                id="admin-config-primary-model"
                value={primaryModel}
                onChange={(e) => setPrimaryModel(e.target.value)}
                placeholder="gpt-4o"
                className={formInputCls}
                disabled={!primaryProviderId}
              />
            </FormField>
            <FormField label={t('admin.configs.primaryApiStyle')}>
              <CustomSelect
                size="md"
                options={styleOptions}
                value={primaryApiStyle || ''}
                onChange={(value) => setPrimaryApiStyle(value || '')}
                placeholder={t('admin.configs.selectProvider')}
              />
            </FormField>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-ink-secondary">{t('admin.configs.fallback')}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label={t('admin.configs.fallbackProvider')}>
              <CustomSelect
                size="md"
                options={fallbackOptions}
                value={fallbackProviderId || ''}
                onChange={(value) => setFallbackProviderId(value === '' ? null : value)}
                placeholder={t('admin.configs.selectProvider')}
              />
            </FormField>
            <FormField label={t('admin.configs.fallbackModel')} htmlFor="admin-config-fallback-model">
              <input
                id="admin-config-fallback-model"
                value={fallbackModel}
                onChange={(e) => setFallbackModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className={formInputCls}
                disabled={!fallbackProviderId}
              />
            </FormField>
            <FormField label={t('admin.configs.fallbackApiStyle')}>
              <CustomSelect
                size="md"
                options={styleOptions}
                value={fallbackApiStyle || ''}
                onChange={(value) => setFallbackApiStyle(value || '')}
                placeholder={t('admin.configs.selectProvider')}
              />
            </FormField>
          </div>
        </div>

        <p className="text-micro text-ink-faint">{t('admin.configs.apiStyleHint')}</p>

        {formError && (
          <p className="text-xs font-medium text-danger">{formError}</p>
        )}
      </div>
    </Modal>
  );
};

export default FeatureConfigModal