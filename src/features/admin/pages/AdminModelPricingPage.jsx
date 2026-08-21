import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Pencil, Plus, Trash2 } from 'lucide-react';
import DataTable from '@components/common/DataTable';
import RowActionsMenu from '@components/common/RowActionsMenu';
import ConfirmModal from '@components/common/ConfirmModal';
import { useToast } from '@/hooks/useToast';
import { adminService } from '../services/adminService';
import PricingFormModal from '../components/PricingFormModal';

/** 毫分/1K → 元/1M 展示换算（¥2/M = 200 毫分/1K）。 */
const MILLI_PER_1K_TO_YUAN_PER_M = 1 / 100;

const formatPrice = (milli) => {
  if (milli === null || milli === undefined) return '—';
  const yuan = milli * MILLI_PER_1K_TO_YUAN_PER_M;
  return `¥${Number.isInteger(yuan) ? yuan : yuan.toFixed(2).replace(/\.?0+$/, '')}`;
};

/**
 * 管理台-模型定价：维护各模型 token 计费单价。
 * 计费按 model 精确匹配；删除或停用后该模型回退服务端默认价。
 */
const AdminModelPricingPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyModel, setBusyModel] = useState(null);

  const loadPrices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.listModelPrices();
      setPrices(data || []);
    } catch {
      toast.error(t('admin.pricing.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const openCreate = () => { setEditingPrice(null); setFormOpen(true); };
  const openEdit = (price) => { setEditingPrice(price); setFormOpen(true); };

  const handleDelete = async () => {
    try {
      setBusyModel(pendingDelete.model);
      await adminService.deleteModelPrice(pendingDelete.model);
      toast.success(t('admin.pricing.deleted'));
      setPendingDelete(null);
      await loadPrices();
    } catch {
      // HTTP 层已统一提示
    } finally {
      setBusyModel(null);
    }
  };

  const priceColumn = (key, titleKey) => ({
    key,
    title: t(titleKey),
    width: '13%',
    render: (row) => (
      <span className="text-xs font-medium text-ink-muted">{formatPrice(row[key])}</span>
    ),
  });

  const columns = [
    {
      key: 'model',
      title: t('admin.pricing.model'),
      width: '22%',
      render: (price) => (
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-ink">{price.model}</div>
          {price.remark ? (
            <div className="mt-0.5 truncate text-micro text-ink-faint" title={price.remark}>{price.remark}</div>
          ) : null}
        </div>
      ),
    },
    priceColumn('inputMilliPer1kToken', 'admin.pricing.inputPrice'),
    priceColumn('outputMilliPer1kToken', 'admin.pricing.outputPrice'),
    priceColumn('cachedMilliPer1kToken', 'admin.pricing.cachedReadPrice'),
    priceColumn('cachedWriteMilliPer1kToken', 'admin.pricing.cachedWritePrice'),
    {
      key: 'enabled',
      title: t('admin.pricing.status'),
      width: '10%',
      render: (price) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
            price.enabled ? 'bg-success-soft text-success-fg' : 'bg-danger-soft text-danger-fg'
          }`}
        >
          {price.enabled ? t('admin.pricing.statusEnabled') : t('admin.pricing.statusDisabled')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('admin.pricing.actions'),
      width: '14%',
      render: (price) => {
        const items = [
          {
            key: 'edit',
            label: t('admin.pricing.edit'),
            icon: Pencil,
            disabled: busyModel === price.model,
            onClick: () => openEdit(price),
          },
          {
            key: 'delete',
            label: t('admin.pricing.delete'),
            icon: Trash2,
            danger: true,
            disabled: busyModel === price.model,
            onClick: () => setPendingDelete(price),
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
            <Coins className="h-4 w-4 text-accent" aria-hidden="true" />
            {t('admin.pricing.title')}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">{t('admin.pricing.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-xs font-bold text-white transition hover:bg-accent active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t('admin.pricing.add')}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <DataTable
          columns={columns}
          rows={prices}
          loading={loading}
          emptyTitle={t('admin.pricing.empty')}
          emptyHint={t('admin.pricing.emptyHint')}
          emptyIcon={Coins}
          minWidth="860px"
        />
      </div>

      <PricingFormModal
        isOpen={formOpen}
        price={editingPrice}
        onClose={() => setFormOpen(false)}
        onSaved={loadPrices}
      />

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        confirming={busyModel === pendingDelete?.model}
        title={t('admin.pricing.deleteTitle')}
        message={t('admin.pricing.deleteMessage', { name: pendingDelete?.model })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default AdminModelPricingPage;
