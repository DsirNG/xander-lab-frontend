import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Pencil, Plus, Server, Trash2 } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { formInputCls } from "@shared/ui/forms/formStyles";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import { useToast } from "@shared/hooks/useToast";
import { isRequestCancelled } from "@api";
import { adminService } from "../services/adminService";
import ProviderFormModal from "../components/ProviderFormModal";

/**
 * 管理台-模型供应商：CRUD + 启用/停用。
 * API 密钥只进不出，列表仅展示「已配置/未配置」标记。
 */
const AdminModelProvidersPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [search, setSearch] = useState("");
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const loadProviders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.listProviders({ _silent: true });
            setProviders(data || []);
        } catch (error) {
            if (isRequestCancelled(error)) return;
            toast.error(error?.message || t("admin.providers.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => {
        loadProviders();
    }, [loadProviders]);

    const openCreate = () => {
        setEditingProvider(null);
        setFormOpen(true);
    };
    const openEdit = (provider) => {
        setEditingProvider(provider);
        setFormOpen(true);
    };

    const toggleEnabled = async (provider) => {
        try {
            setBusyId(provider.id);
            await adminService.setProviderEnabled(
                provider.id,
                !provider.enabled,
            );
            toast.success(
                provider.enabled
                    ? t("admin.providers.disableToast")
                    : t("admin.providers.enableToast"),
            );
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
            toast.success(t("admin.providers.deleted"));
            setPendingDelete(null);
            await loadProviders();
        } catch {
            // HTTP 层已统一提示（被引用时返回 409）
        } finally {
            setBusyId(null);
        }
    };

    const actions = (provider) => {
        const items = [
            {
                key: "edit",
                label: t("admin.providers.edit"),
                icon: Pencil,
                disabled: busyId === provider.id,
                onClick: () => openEdit(provider),
            },
            {
                key: "toggle",
                label: provider.enabled
                    ? t("admin.providers.disable")
                    : t("admin.providers.enable"),
                loading:
                    busyId === provider.id && pendingDelete?.id !== provider.id,
                onClick: () => toggleEnabled(provider),
            },
            {
                key: "delete",
                label: t("admin.providers.delete"),
                icon: Trash2,
                danger: true,
                disabled: busyId === provider.id,
                onClick: () => setPendingDelete(provider),
            },
        ];
        return items;
    };
    const filtered = providers.filter((provider) =>
        `${provider.name} ${provider.baseUrl}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );
    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden p-4 sm:p-6">
            <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-title font-semibold text-ink">
                        <Server
                            className="h-4 w-4 text-ink"
                            aria-hidden="true"
                        />
                        {t("admin.providers.title")}
                    </h1>
                    <p className="mt-1 text-caption text-ink-muted">
                        {t("admin.providers.subtitle")}
                    </p>
                </div>
                <Button variant="ink" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    {t("admin.providers.add")}
                </Button>
            </div>

            <Link to="/workspace/admin/feature-model-configs" className="mb-4 text-caption text-ink-muted underline underline-offset-4">{t("admin.configs.title")}</Link>
            <div className="mb-4 shrink-0">
                <input
                    className={formInputCls}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.providers.searchPresets")}
                    aria-label={t("admin.providers.searchPresets")}
                />
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                {filtered.map((provider) => (
                    <div
                        key={provider.id}
                        className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-4 sm:p-5"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-muted">
                            <Server className="h-5 w-5 text-ink-muted" />
                        </div>
                        <button
                            type="button"
                            onClick={() => openEdit(provider)}
                            className="min-w-0 flex-1 text-left"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-body font-semibold">
                                    {provider.name}
                                </span>
                                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-micro text-ink-muted">
                                    {t("admin.providers.modelsTitle", {
                                        count: provider.models?.length ?? 0,
                                    })}
                                </span>
                            </div>
                            <div className="mt-1 truncate text-caption text-ink-muted">
                                {provider.baseUrl}
                            </div>
                            {provider.description && (
                                <div className="mt-1 truncate text-caption text-ink-faint">
                                    {provider.description}
                                </div>
                            )}
                        </button>
                        <span
                            className={`text-caption ${provider.enabled ? "text-success-fg" : "text-ink-faint"}`}
                        >
                            {t(
                                provider.enabled
                                    ? "admin.providers.statusEnabled"
                                    : "admin.providers.statusDisabled",
                            )}
                        </span>
                        <span
                            title={t(
                                provider.apiKeyConfigured
                                    ? "admin.providers.keyConfigured"
                                    : "admin.providers.keyMissing",
                            )}
                        >
                            <KeyRound
                                className={`h-4 w-4 ${provider.apiKeyConfigured ? "text-success-fg" : "text-ink-faint"}`}
                            />
                        </span>
                        <RowActionsMenu
                            actions={actions(provider)}
                            align="right"
                        />
                    </div>
                ))}
                {!filtered.length && (
                    <div className="rounded-card border border-dashed border-border p-10 text-center text-body text-ink-muted">
                        {t(
                            providers.length
                                ? "admin.providers.noMatches"
                                : "admin.providers.empty",
                        )}
                    </div>
                )}
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
                title={t("admin.providers.deleteTitle")}
                message={t("admin.providers.deleteMessage", {
                    name: pendingDelete?.name,
                })}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
            />
        </div>
    );
};

export default AdminModelProvidersPage;
