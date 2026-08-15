import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import FormField from '@components/common/FormField';
import { formInputCls } from '@components/common/formStyles';
import { useToast } from '@/hooks/useToast';
import { adminService } from '../services/adminService';

/**
 * 模型供应商新建/编辑弹窗。
 * apiKey 只进不出：编辑时留空表示保持原密钥不变。
 */
const ProviderFormModal = ({ isOpen, provider, providers, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState('0');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const editing = Boolean(provider);

  useEffect(() => {
    if (!isOpen) return;
    if (provider) {
      setName(provider.name || '');
      setVendor(provider.vendor || 'OPENAI_COMPATIBLE');
      setBaseUrl(provider.baseUrl || '');
      setApiKey('');
      setDescription(provider.description || '');
      setEnabled(provider.enabled !== false);
      setPriority(String(provider.priority ?? 0));
    } else {
      setName('');
      setVendor('OPENAI_COMPATIBLE');
      setBaseUrl('');
      setApiKey('');
      setDescription('');
      setEnabled(true);
      setPriority('0');
    }
    setFormError('');
  }, [isOpen, provider]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedBaseUrl = baseUrl.trim();
    const trimmedKey = apiKey.trim();
    if (!trimmedName || !trimmedBaseUrl) {
      setFormError(t('admin.providers.formRequired'));
      return;
    }
    if (!editing && !trimmedKey) {
      setFormError(t('admin.providers.formKeyRequired'));
      return;
    }
    const nameTaken = providers?.some(
      (p) => p.name?.toLowerCase() === trimmedName.toLowerCase() && p.id !== provider?.id,
    );
    if (nameTaken) {
      setFormError(t('admin.providers.nameTaken'));
      return;
    }
    const payload = {
      name: trimmedName,
      vendor: vendor.trim() || 'OPENAI_COMPATIBLE',
      baseUrl: trimmedBaseUrl.replace(/\/+$/, ''),
      apiKey: editing && !trimmedKey ? null : trimmedKey,
      description: description.trim() || null,
      enabled,
      priority: Number(priority) || 0,
    };
    try {
      setSaving(true);
      if (editing) {
        await adminService.updateProvider(provider.id, payload);
        toast.success(t('admin.providers.updated'));
      } else {
        await adminService.createProvider(payload);
        toast.success(t('admin.providers.created'));
      }
      onClose();
      onSaved?.();
    } catch (err) {
      setFormError(err?.response?.data?.message || t('admin.providers.saveFailed'));
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
        {editing ? t('common.save') : t('admin.providers.create')}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? t('admin.providers.editTitle') : t('admin.providers.createTitle')}
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4">
        <FormField label={t('admin.providers.name')} htmlFor="admin-provider-name">
          <input
            id="admin-provider-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('admin.providers.namePlaceholder')}
            className={formInputCls}
          />
        </FormField>

        <FormField label={t('admin.providers.vendor')} htmlFor="admin-provider-vendor">
          <input
            id="admin-provider-vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="OPENAI_COMPATIBLE"
            className={formInputCls}
          />
        </FormField>

        <FormField label={t('admin.providers.baseUrl')} htmlFor="admin-provider-base-url">
          <input
            id="admin-provider-base-url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            className={formInputCls}
          />
        </FormField>

        <FormField
          label={t('admin.providers.apiKey')}
          hint={editing ? t('admin.providers.apiKeyHint') : undefined}
          htmlFor="admin-provider-api-key"
        >
          <input
            id="admin-provider-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={editing ? t('admin.providers.apiKeyEditPlaceholder') : t('admin.providers.apiKeyPlaceholder')}
            className={formInputCls}
            autoComplete="new-password"
          />
        </FormField>

        <FormField label={t('admin.providers.description')} htmlFor="admin-provider-description">
          <textarea
            id="admin-provider-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${formInputCls} resize-none`}
          />
        </FormField>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-muted">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent-200"
            />
            {t('admin.providers.enabled')}
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <span>{t('admin.providers.priority')}</span>
            <input
              type="number"
              min="0"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`${formInputCls} w-24`}
            />
          </label>
        </div>

        {formError && (
          <p className="text-xs font-medium text-danger">{formError}</p>
        )}
      </div>
    </Modal>
  );
};

export default ProviderFormModal