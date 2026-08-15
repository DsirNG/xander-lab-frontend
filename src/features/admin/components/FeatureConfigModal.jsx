import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import FormField from '@components/common/FormField';
import CustomSelect from '@components/common/CustomSelect';
import Button from '@components/common/Button';
import { formInputCls } from '@components/common/formStyles';
import { useToast } from '@/hooks/useToast';
import { adminService } from '../services/adminService';

/**
 * 功能模型配置弹窗：为主模型/兜底模型各选择一个供应商 + 模型名。
 * 两个槽位均留空 = 该功能未启用管理台路由，回退环境变量。
 */
const FeatureConfigModal = ({ isOpen, config, providers, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [enabled, setEnabled] = useState(false);
  const [primaryProviderId, setPrimaryProviderId] = useState(null);
  const [primaryModel, setPrimaryModel] = useState('');
  const [fallbackProviderId, setFallbackProviderId] = useState(null);
  const [fallbackModel, setFallbackModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const providerOptions = useMemo(
    () => providers.map((p) => ({ value: p.id, label: p.name })),
    [providers],
  );
  const fallbackOptions = useMemo(
    () => [{ value: '', label: t('admin.configs.noFallback') }, ...providerOptions],
    [providerOptions, t],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (config) {
      setEnabled(config.enabled);
      setPrimaryProviderId(config.primaryProviderId || null);
      setPrimaryModel(config.primaryModel || '');
      setFallbackProviderId(config.fallbackProviderId || null);
      setFallbackModel(config.fallbackModel || '');
    } else {
      setEnabled(false);
      setPrimaryProviderId(null);
      setPrimaryModel('');
      setFallbackProviderId(null);
      setFallbackModel('');
    }
    setFormError('');
  }, [isOpen, config]);

  const handleSubmit = async () => {
    const primaryModelTrimmed = primaryModel.trim();
    const fallbackModelTrimmed = fallbackModel.trim();
    if (!enabled && (primaryProviderId || primaryModelTrimmed || fallbackProviderId || fallbackModelTrimmed)) {
      setFormError(t('admin.configs.formUntypedWhileEnabled'));
      return;
    }
    if (enabled && !primaryProviderId) {
      setFormError(t('admin.configs.formPrimaryRequired'));
      return;
    }
    if (primaryProviderId && !primaryModelTrimmed) {
      setFormError(t('admin.configs.formModelRequired'));
      return;
    }
    if (fallbackProviderId && !fallbackModelTrimmed) {
      setFormError(t('admin.configs.formModelRequired'));
      return;
    }
    try {
      setSaving(true);
      await adminService.updateFeatureConfig(config.featureKey, {
        enabled,
        primaryProviderId,
        primaryModel: primaryModelTrimmed || null,
        fallbackProviderId,
        fallbackModel: fallbackModelTrimmed || null,
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
      <Button
        type="button"
        onClick={onClose}
        disabled={saving}
        variant="ghost"
        className="rounded-xl px-5 py-2.5 text-caption font-bold"
      >
        {t('common.cancel')}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        loading={saving}
        variant="ink"
        className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-caption font-bold transition hover:bg-accent active:scale-95"
      >
        {t('common.save')}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.configs.editTitle', { feature: t(`admin.configs.feature.${config?.featureKey}`) })}
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        {formError && (
          <p className="text-xs font-medium text-danger">{formError}</p>
        )}
      </div>
    </Modal>
  );
};

export default FeatureConfigModal