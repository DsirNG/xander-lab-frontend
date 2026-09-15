import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plug, Plus, RefreshCw, Trash2 } from "lucide-react";
import DataTable from "@components/common/DataTable";
import RowActionsMenu from "@components/common/RowActionsMenu";
import ConfirmModal from "@components/common/ConfirmModal";
import Button from "@components/common/Button";
import { useToast } from "@/hooks/useToast";
import McpServerFormModal from "./McpServerFormModal";

const PAGE_SIZE = 10;

/**
 * 远端 MCP 服务器列表，用户版与管理版共用。
 *
 * <p>两个版本的差别只有接口前缀和文案：用户版管自己配的，管理版管平台级（全员可用）。
 * 归属过滤在后端做，前端不做权限判断。</p>
 *
 * <p>「测试连接」是唯一的网络动作入口：工具目录只有探测过才会有，
 * 没探测过的服务器即使启用了也不贡献任何工具。所以状态列要显眼地告诉用户这一点。</p>
 */
const McpServersPanel = ({ service, variant = "user" }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [probingId, setProbingId] = useState(null);

    const scope = variant === "admin" ? "admin" : "user";

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError("");
            const data = await service.list();
            setServers(data || []);
        } catch (err) {
            setLoadError(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentMcp.loadFailed"),
            );
        } finally {
            setLoading(false);
        }
    }, [service, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 客户端分页：一个人（或一个平台）配的服务器是几台的量级，不值得为它加分页接口。
    const total = servers.length;
    const pageRows = useMemo(
        () => servers.slice((page - 1) * pageSize, page * pageSize),
        [servers, page, pageSize],
    );

    const handleProbe = async (server) => {
        try {
            setProbingId(server.id);
            const updated = await service.probe(server.id);
            if (updated?.lastStatus === "OK") {
                toast.success(
                    t("blog.agentMcp.probeOk", {
                        count: (updated.tools || []).length,
                    }),
                );
            } else {
                toast.error(
                    updated?.lastError || t("blog.agentMcp.probeFailed"),
                );
            }
            await loadData();
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentMcp.probeFailed"),
            );
        } finally {
            setProbingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            setDeleteBusy(true);
            await service.remove(deleting.id);
            toast.success(t("blog.agentMcp.deleted"));
            setDeleting(null);
            // 删掉当前页最后一条时回退一页，避免停在空页上。
            const lastPage = Math.max(1, Math.ceil((total - 1) / pageSize));
            if (page > lastPage) setPage(lastPage);
            await loadData();
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentMcp.deleteFailed"),
            );
        } finally {
            setDeleteBusy(false);
        }
    };

    const renderStatus = (server) => {
        if (server.lastStatus === "OK") {
            return (
                <span className="text-micro font-semibold text-success">
                    {t("blog.agentMcp.statusOk")}
                </span>
            );
        }
        if (server.lastStatus === "FAILED") {
            return (
                <span
                    className="line-clamp-2 text-micro text-danger"
                    title={server.lastError || ""}
                >
                    {server.lastError || t("blog.agentMcp.statusFailed")}
                </span>
            );
        }
        return (
            <span className="text-micro text-ink-faint">
                {t("blog.agentMcp.statusNever")}
            </span>
        );
    };

    const columns = [
        {
            key: "server",
            title: t("blog.agentMcp.columnServer"),
            width: "28%",
            render: (server) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-caption font-semibold text-ink">
                            {server.displayName}
                        </span>
                        <span className="shrink-0 rounded-md bg-surface-muted px-1.5 py-0.5 text-micro font-semibold text-ink-muted">
                            {t(
                                server.platformOwned
                                    ? "blog.agentMcp.platformBadge"
                                    : "blog.agentMcp.personalBadge",
                            )}
                        </span>
                    </div>
                    <div className="mt-0.5 truncate font-mono text-micro text-ink-faint">
                        {server.serverKey}
                    </div>
                </div>
            ),
        },
        {
            key: "endpoint",
            title: t("blog.agentMcp.columnEndpoint"),
            width: "26%",
            render: (server) => (
                <span
                    className="line-clamp-2 break-all font-mono text-micro text-ink-secondary"
                    title={server.endpointUrl}
                >
                    {server.endpointUrl}
                </span>
            ),
        },
        {
            key: "tools",
            title: t("blog.agentMcp.columnTools"),
            width: "12%",
            render: (server) => {
                const count = (server.tools || []).length;
                if (count === 0) {
                    return (
                        <span className="text-micro text-ink-faint">
                            {t("blog.agentMcp.noTools")}
                        </span>
                    );
                }
                return (
                    <span className="text-micro font-semibold text-ink-secondary">
                        {t("blog.agentMcp.toolsCount", { count })}
                    </span>
                );
            },
        },
        {
            key: "status",
            title: t("blog.agentMcp.columnStatus"),
            width: "20%",
            render: renderStatus,
        },
        {
            key: "actions",
            title: t("blog.agentMcp.columnActions"),
            width: "14%",
            render: (server) => (
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => handleProbe(server)}
                        disabled={probingId === server.id}
                        title={t("blog.agentMcp.probe")}
                        aria-label={t("blog.agentMcp.probeFor", {
                            name: server.displayName,
                        })}
                        className="rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-muted hover:text-accent disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-3.5 w-3.5 ${
                                probingId === server.id ? "animate-spin" : ""
                            }`}
                            aria-hidden="true"
                        />
                    </button>
                    <RowActionsMenu
                        align="right"
                        ariaLabel={t("blog.agentMcp.actionsFor", {
                            name: server.displayName,
                        })}
                        actions={[
                            {
                                key: "edit",
                                label: t("blog.agentMcp.edit"),
                                icon: Pencil,
                                onClick: () => {
                                    setEditing(server);
                                    setFormOpen(true);
                                },
                            },
                            {
                                key: "delete",
                                label: t("blog.agentMcp.delete"),
                                icon: Trash2,
                                danger: true,
                                onClick: () => setDeleting(server),
                            },
                        ]}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden p-4 py-short-tight sm:p-6">
            <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-title text-ink">
                        <Plug
                            className="h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {t(`blog.agentMcp.title.${scope}`)}
                        </span>
                    </div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {t(`blog.agentMcp.subtitle.${scope}`)}
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                    }}
                    size="sm"
                    icon={Plus}
                    className="shrink-0"
                >
                    {t("blog.agentMcp.create")}
                </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <DataTable
                    columns={columns}
                    rows={pageRows}
                    loading={loading}
                    error={loadError}
                    errorTitle={t("blog.agentMcp.loadFailed")}
                    onRetry={loadData}
                    onRetryLabel={t("blog.agentImages.retry")}
                    emptyTitle={t("blog.agentMcp.emptyTitle")}
                    emptyHint={t("blog.agentMcp.emptyHint")}
                    emptyIcon={Plug}
                    minWidth="900px"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    paginationDisabled={total === 0}
                />
            </div>

            <McpServerFormModal
                isOpen={formOpen}
                service={service}
                prefill={editing}
                onClose={() => setFormOpen(false)}
                onSaved={loadData}
            />

            <ConfirmModal
                isOpen={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                confirming={deleteBusy}
                title={t("blog.agentMcp.deleteTitle")}
                message={t("blog.agentMcp.deleteConfirm", {
                    name: deleting?.displayName || "",
                })}
                confirmText={t("blog.agentMcp.delete")}
                cancelText={t("common.cancel")}
            />
        </div>
    );
};

export default McpServersPanel;
