import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Coins, Pencil, Plus, Trash2 } from "lucide-react";
import DataTable from "@shared/ui/data-display/DataTable";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import { useToast } from "@shared/hooks/useToast";
import { isRequestCancelled } from "@api";
import { adminService } from "../services/adminService";
import PricingFormModal from "../components/PricingFormModal";
import { milliPer1kToYuanPerM, milliPerRequestToYuan } from "../utils/pricingUnits";

const formatPrice = (milli) => {
    if (milli === null || milli === undefined) return "—";
    const yuan = milliPer1kToYuanPerM(milli);
    return `¥${Number.isInteger(yuan) ? yuan : yuan.toFixed(2).replace(/\.?0+$/, "")}`;
};

/**
 * 管理台-模型定价：维护各模型 Token / 按次计费单价。
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
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const currentPage = Math.min(page, Math.max(1, Math.ceil(prices.length / pageSize)));

    const loadPrices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.listModelPrices({ _silent: true });
            setPrices(data || []);
        } catch (error) {
            if (isRequestCancelled(error)) return;
            toast.error(error?.message || t("admin.pricing.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => {
        loadPrices();
    }, [loadPrices]);

    const openCreate = () => {
        setEditingPrice(null);
        setFormOpen(true);
    };
    const openEdit = (price) => {
        setEditingPrice(price);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        try {
            setBusyModel(pendingDelete.model);
            await adminService.deleteModelPrice(pendingDelete.model);
            toast.success(t("admin.pricing.deleted"));
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
        width: "120px",
        headerClassName: "whitespace-nowrap",
        className: "whitespace-nowrap",
        render: (row) => (
            <span className="text-caption font-medium text-ink-muted">
                {row.billingMode === "REQUEST" ? "—" : formatPrice(row[key])}
            </span>
        ),
    });

    const columns = [
        {
            key: "model",
            title: t("admin.pricing.model"),
            width: "230px",
            render: (price) => (
                <div className="min-w-0">
                    <div className="truncate text-caption font-bold text-ink">
                        {price.model}
                    </div>
                    {price.remark ? (
                        <div
                            className="mt-0.5 truncate text-micro text-ink-faint"
                            title={price.remark}
                        >
                            {price.remark}
                        </div>
                    ) : null}
                </div>
            ),
        },
        {
            key: "billingMode",
            title: t("admin.pricing.billingMode"),
            width: "120px",
            headerClassName: "whitespace-nowrap",
            className: "whitespace-nowrap",
            render: (row) => t(row.billingMode === "REQUEST" ? "admin.pricing.modeRequest" : "admin.pricing.modeToken"),
        },
        {
            key: "milliPerRequest",
            title: t("admin.pricing.requestPrice"),
            width: "160px",
            headerClassName: "whitespace-nowrap",
            className: "whitespace-nowrap",
            render: (row) => row.billingMode === "REQUEST" ? `¥${milliPerRequestToYuan(row.milliPerRequest ?? 0)}` : "—",
        },
        priceColumn("inputMilliPer1kToken", "admin.pricing.inputPrice"),
        priceColumn("outputMilliPer1kToken", "admin.pricing.outputPrice"),
        priceColumn("cachedMilliPer1kToken", "admin.pricing.cachedReadPrice"),
        priceColumn(
            "cachedWriteMilliPer1kToken",
            "admin.pricing.cachedWritePrice",
        ),
        {
            key: "enabled",
            title: t("admin.pricing.status"),
            width: "100px",
            render: (price) => (
                <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
                        price.enabled
                            ? "bg-success-soft text-success-fg"
                            : "bg-danger-soft text-danger-fg"
                    }`}
                >
                    {price.enabled
                        ? t("admin.pricing.statusEnabled")
                        : t("admin.pricing.statusDisabled")}
                </span>
            ),
        },
        {
            key: "actions",
            title: t("admin.pricing.actions"),
            width: "80px",
            render: (price) => {
                const items = [
                    {
                        key: "edit",
                        label: t("admin.pricing.edit"),
                        icon: Pencil,
                        disabled: busyModel === price.model,
                        onClick: () => openEdit(price),
                    },
                    {
                        key: "delete",
                        label: t("admin.pricing.delete"),
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
        <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col overflow-hidden p-4 sm:p-6">
            <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-title font-semibold text-ink">
                        <Coins
                            className="h-4 w-4 text-ink"
                            aria-hidden="true"
                        />
                        {t("admin.pricing.title")}
                    </h1>
                    <p className="mt-1 text-caption text-ink-muted">
                        {t("admin.pricing.subtitle")}
                    </p>
                    <p className="mt-1 text-micro text-ink-faint">
                        {t("admin.pricing.priceUnit")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex h-9 items-center gap-1.5 rounded-control bg-ink px-4 text-caption font-bold text-canvas transition hover:bg-ink-secondary active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("admin.pricing.add")}
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <DataTable
                    columns={columns}
                    rows={prices.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    page={currentPage}
                    pageSize={pageSize}
                    total={prices.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    loading={loading}
                    emptyTitle={t("admin.pricing.empty")}
                    emptyHint={t("admin.pricing.emptyHint")}
                    emptyIcon={Coins}
                    minWidth="1170px"
                    rowKey={(row) => row.model}
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
                title={t("admin.pricing.deleteTitle")}
                message={t("admin.pricing.deleteMessage", {
                    name: pendingDelete?.model,
                })}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
            />
        </div>
    );
};

export default AdminModelPricingPage;
