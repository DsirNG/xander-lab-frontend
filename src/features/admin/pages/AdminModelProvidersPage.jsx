import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, Pencil, Plus, Server, Trash2 } from 'lucide-react';
import DataTable from '@components/common/DataTable';
import RowActionsMenu from '@components/common/RowActionsMenu';
import ConfirmModal from '@components/common/ConfirmModal';
import Button from '@components/common/Button';
import { useToast } from '@/hooks/useToast';
import { adminService } from '../services/adminService';
import ProviderFormModal from '../components/ProviderFormModal';

/**
 * 管理台-模型供应商：CRUD + 启用/停用。
 * API 密钥只进不出，列表仅展示「已配置/未配置」标记。
 */
const AdminModelProvidersPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.listProviders();
      setProviders(data || []);
    } catch {
      toast.error(t('admin.providers.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { loadProviders(); }, [loadProviders]);

  const openCreate = () => { setEditingProvider(null); setFormOpen(true); };
  const openEdit = (provider) => { setEditingProvider(provider); setFormOpen(true); };

  const toggleEnabled = async (provider) => {
    try {
      setBusyId(provider.id);
      await adminService.setProviderEnabled(provider.id, !provider.enabled);
      toast.success(provider.enabled ? t('admin.providers.disableToast') : t('admin.providers.enableToast'));
      await loadProviders();
    } catch {
      // HTTP 层已统一提示
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setBusyId(pendingDelete.id);
      await adminService.deleteProvider(pendingDelete.id);
      toast.success(t('admin.providers.deleted'));
      setPendingDelete(null);
      await loadProviders();
    } catch {
      // HTTP 层已统一提示（被引用时返回 409）
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      title: t('admin.providers.name'),
      width: '20%',
      render: (provider) => (
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-ink">{provider.name}</div>
          <div className="mt-0.5 truncate text-micro text-ink-faint">{provider.vendor || '—'}</div>
        </div>
      ),
    },
    {
      key: 'baseUrl',
      title: t('admin.providers.baseUrl'),
      width: '26%',
      render: (provider) => (
        <span className="block truncate text-xs font-medium text-ink-muted" title={provider.baseUrl}>
          {provider.baseUrl}
        </span>
      ),
    },
    {
      key: 'apiKey',
      title: t('admin.providers.apiKey'),
      width: '12%',
      render: (provider) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium ${
            provider.apiKeyConfigured
              ? 'bg-success-soft text-success-fg'
              : 'bg-surface-muted text-ink-faint'
          }`}
        >
          <KeyRound className="h-3 w-3" aria-hidden="true" />
          {provider.apiKeyConfigured
            ? t('admin.providers.keyConfigured')
            : t('admin.providers.keyMissing')}
        </span>
      ),
    },
    {
      key: 'enabled',
      title: t('admin.providers.status'),
      width: '10%',
      render: (provider) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
            provider.enabled ? 'bg-success-soft text-success-fg' : 'bg-danger-soft text-danger-fg'
          }`}
        >
          {provider.enabled ? t('admin.providers.statusEnabled') : t('admin.providers.statusDisabled')}
        </span>
      ),
    },
    {
      key: 'priority',
      title: t('admin.providers.priority'),
      width: '8%',
      render: (provider) => (
        <span className="text-xs font-medium text-ink-muted">{provider.priority ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      title: t('admin.providers.actions'),
      width: '24%',

      render: (provider) => {
        const items = [
          {
            key: 'edit',
            label: t('admin.providers.edit'),
            icon: Pencil,
            disabled: busyId === provider.id,
            onClick: () => openEdit(provider),
          },
          {
            key: 'toggle',
            label: provider.enabled
              ? t('admin.providers.disable')
              : t('admin.providers.enable'),
            loading: busyId === provider.id && pendingDelete?.id !== provider.id,
            onClick: () => toggleEnabled(provider),
          },
          {
            key: 'delete',
            label: t('admin.providers.delete'),
            icon: Trash2,
            danger: true,
            disabled: busyId === provider.id,
            onClick: () => setPendingDelete(provider),
          },
        ];
        return <RowActionsMenu actions={items} align="right" />;
      },
    },
  ];

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-base font-bold text-ink">
              <Server className="h-4 w-4 text-accent" aria-hidden="true" />
              {t('admin.providers.title')}
            </h1>
            <p className="mt-1 text-xs text-ink-muted">{t('admin.providers.subtitle')}</p>
          </div>
          <Button
            type="button"
            onClick={openCreate}
            variant="ink"
            size="sm"
            icon={Plus}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition hover:bg-accent active:scale-95"
          >
            {t('admin.providers.add')}
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            rows={providers}
            loading={loading}
            emptyTitle={t('admin.providers.empty')}
            emptyHint={t('admin.providers.emptyHint')}
            emptyIcon={Server}
            minWidth="860px"
          />
        </div>

      <ProviderFormModal
        isOpen={formOpen}
        provider={editingProvider}
        providers={providers}
        onClose={() => setFormOpen(false)}
        onSaved={loadProviders}
      />

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        confirming={busyId === pendingDelete?.id}
        title={t('admin.providers.deleteTitle')}
        message={t('admin.providers.deleteMessage', { name: pendingDelete?.name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default AdminModelProvidersPage
