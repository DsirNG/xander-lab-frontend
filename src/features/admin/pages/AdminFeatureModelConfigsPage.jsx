import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, SlidersHorizontal } from 'lucide-react';
import DataTable from '@components/common/DataTable';
import RowActionsMenu from '@components/common/RowActionsMenu';
import { useToast } from '@/hooks/useToast';
import { adminService, FEATURE_KEYS } from '../services/adminService';
import FeatureConfigModal from '../components/FeatureConfigModal';

/**
 * 管理台-功能模型配置：为每个功能设置主模型与兜底模型。
 * 全部槽位留空表示未启用管理台路由，模型调用回退环境变量。
 */
const AdminFeatureModelConfigsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [configs, setConfigs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const providerName = useCallback(
    (id) => providers.find((p) => p.id === id)?.name || `#${id}`,
    [providers],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [configData, providerData] = await Promise.all([
        adminService.listFeatureConfigs(),
        adminService.listProviders(),
      ]);
      const ordered = FEATURE_KEYS.map(
        (key) => configData?.find((c) => c.featureKey === key)
          || { featureKey: key, enabled: false, primaryProviderId: null, primaryModel: null, fallbackProviderId: null, fallbackModel: null, updatedAt: null },
      );
      setConfigs(ordered);
      setProviders(providerData || []);
    } catch {
      toast.error(t('admin.configs.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { loadData(); }, [loadData]);

  const renderSlot = (providerId, model) => {
    if (!providerId || !model) {
      return <span className="text-xs text-ink-faint">{t('admin.configs.none')}</span>;
    }
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-micro font-medium text-ink-secondary">
          {providerName(providerId)}
        </span>
        <span className="text-xs font-bold text-ink">{model}</span>
      </span>
    );
  };

  const columns = [
    {
      key: 'feature',
      title: t('admin.configs.feature'),
      width: '22%',
      render: (config) => (
        <span className="text-xs font-bold text-ink">
          {t(`admin.configs.feature.${config.featureKey}`)}
        </span>
      ),
    },
    {
      key: 'enabled',
      title: t('admin.configs.enabledLabel'),
      width: '10%',
      render: (config) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
            config.enabled ? 'bg-success-soft text-success' : 'bg-surface-muted text-ink-faint'
          }`}
        >
          {config.enabled ? t('admin.configs.enabledOn') : t('admin.configs.enabledOff')}
        </span>
      ),
    },
    {
      key: 'primary',
      title: t('admin.configs.primary'),
      width: '28%',
      render: (config) => renderSlot(config.primaryProviderId, config.primaryModel),
    },
    {
      key: 'fallback',
      title: t('admin.configs.fallback'),
      width: '28%',
      render: (config) => renderSlot(config.fallbackProviderId, config.fallbackModel),
    },
    {
      key: 'actions',
      title: t('admin.configs.actions'),
      width: '12%',

      render: (config) => {
        const items = [
          {
            key: 'edit',
            label: t('admin.configs.edit'),
            icon: Pencil,
            disabled: savingId === config.featureKey,
            onClick: () => setEditingConfig(config),
          },
        ];
        return <RowActionsMenu actions={items} align="right" />;
      },
    },
  ];

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden p-4 sm:p-6">
        <div className="mb-4">
          <h1 className="flex items-center gap-2 text-base font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-accent" aria-hidden="true" />
            {t('admin.configs.title')}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">{t('admin.configs.subtitle')}</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            rows={configs}
            loading={loading}
            emptyTitle={t('admin.configs.empty')}
            emptyHint={t('admin.configs.emptyHint')}
            emptyIcon={SlidersHorizontal}
            minWidth="820px"
          />
        </div>

      <FeatureConfigModal
        isOpen={Boolean(editingConfig)}
        config={editingConfig}
        providers={providers}
        onClose={() => setEditingConfig(null)}
        onSaved={() => { setSavingId(editingConfig?.featureKey); loadData().finally(() => setSavingId(null)); }}
      />
    </div>
  );
};

export default AdminFeatureModelConfigsPage
