import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2, Trash2 } from 'lucide-react';
import FormField from '@components/common/FormField';
import ConfirmModal from '@components/common/ConfirmModal';
import { formInputCls } from '@components/common/formStyles';
import { useToast } from '@/hooks/useToast';
import { adminService } from '../services/adminService';

/**
 * 管理台-微信登录凭据：AppID/AppSecret 维护。
 * AppSecret 只进不出，保存后不再回显；清除后微信登录通道随即关闭。
 */
const AdminWechatCredentialPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [configured, setConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getWechatCredential();
      setAppId(data?.appId || '');
      setConfigured(Boolean(data?.secretConfigured));
    } catch {
      toast.error(t('admin.wechatCredential.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const trimmedId = appId.trim();
    const trimmedSecret = appSecret.trim();
    if (!trimmedId || !trimmedSecret) {
      setFormError(t('admin.wechatCredential.formRequired'));
      return;
    }
    try {
      setSaving(true);
      await adminService.saveWechatCredential({ appId: trimmedId, appSecret: trimmedSecret });
      toast.success(t('admin.wechatCredential.saved'));
      setAppSecret('');
      setFormError('');
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || t('admin.wechatCredential.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      await adminService.clearWechatCredential();
      toast.success(t('admin.wechatCredential.cleared'));
      setClearOpen(false);
      setAppSecret('');
      await load();
    } catch {
      // HTTP 层已统一提示
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink">{t('admin.wechatCredential.title')}</h2>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium ${
              configured ? 'bg-success-soft text-success-fg' : 'bg-surface-muted text-ink-faint'
            }`}
          >
            <KeyRound className="h-3 w-3" aria-hidden="true" />
            {configured
              ? t('admin.wechatCredential.configured')
              : t('admin.wechatCredential.notConfigured')}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">{t('admin.wechatCredential.subtitle')}</p>
      </div>

      <div className="rounded-2xl border border-border bg-canvas p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label={t('admin.wechatCredential.appId')} htmlFor="admin-wechat-app-id">
              <input
                id="admin-wechat-app-id"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder={t('admin.wechatCredential.appIdPlaceholder')}
                className={formInputCls}
                autoComplete="off"
              />
            </FormField>

            <FormField
              label={t('admin.wechatCredential.appSecret')}
              hint={configured ? t('admin.wechatCredential.appSecretHint') : undefined}
              htmlFor="admin-wechat-app-secret"
            >
              <input
                id="admin-wechat-app-secret"
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder={t('admin.wechatCredential.appSecretPlaceholder')}
                className={formInputCls}
                autoComplete="new-password"
              />
            </FormField>

            {formError && (
              <p className="text-xs font-medium text-danger">{formError}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-caption font-bold text-white transition hover:bg-accent active:scale-95 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {t('common.save')}
              </button>
              {configured && (
                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={clearing}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-caption font-bold text-danger transition hover:bg-danger-soft disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('admin.wechatCredential.clear')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={clearOpen}
        title={t('admin.wechatCredential.clearTitle')}
        message={t('admin.wechatCredential.clearMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirming={clearing}
        onConfirm={handleClear}
        onClose={() => setClearOpen(false)}
      />
    </div>
  );
};

export default AdminWechatCredentialPage;