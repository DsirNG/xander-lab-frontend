import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ban, RotateCcw, Search, Users } from "lucide-react";
import DataTable from "@components/common/DataTable";
import RowActionsMenu from "@components/common/RowActionsMenu";
import ConfirmModal from "@components/common/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { adminService } from "../services/adminService";

/**
 * 管理台-用户列表：关键字过滤、分页、封禁/解封。
 * 封禁会立即撤销该用户全部登录会话。
 */
const AdminUsersPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [keyword, setKeyword] = useState("");
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pendingTarget, setPendingTarget] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.listUsers({
                keyword: keyword || undefined,
                page,
                size: pageSize,
            });
            setUsers(data?.records || []);
            setTotal(Number(data?.total) || 0);
        } catch {
            toast.error(t("admin.users.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [toast, t, keyword, page, pageSize]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleToggleStatus = async (user) => {
        const nextStatus = user.status === 1 ? 0 : 1;
        try {
            setBusyId(user.id);
            await adminService.updateUserStatus(user.id, nextStatus);
            toast.success(
                nextStatus === 0
                    ? t("admin.users.banned")
                    : t("admin.users.unbanned"),
            );
            await loadUsers();
        } catch {
            // HTTP 层已统一提示
        } finally {
            setBusyId(null);
            setPendingTarget(null);
        }
    };

    const formatWhen = (value) =>
        value ? new Date(value).toLocaleString() : "—";

    const columns = [
        {
            key: "username",
            title: t("admin.users.username"),
            width: "20%",
            render: (user) => (
                <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-ink">
                        {user.username}
                    </div>
                    {user.nickname && (
                        <div className="mt-0.5 truncate text-micro text-ink-faint">
                            {user.nickname}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "email",
            title: t("admin.users.email"),
            width: "24%",
            render: (user) => (
                <span
                    className="block truncate text-xs font-medium text-ink-muted"
                    title={user.email}
                >
                    {user.email || "—"}
                </span>
            ),
        },
        {
            key: "role",
            title: t("admin.users.role"),
            width: "10%",
            render: (user) => (
                <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
                        user.role === "ADMIN"
                            ? "bg-accent-soft text-accent-fg"
                            : "bg-surface-muted text-ink-muted"
                    }`}
                >
                    {user.role === "ADMIN"
                        ? t("admin.users.roleAdmin")
                        : t("admin.users.roleUser")}
                </span>
            ),
        },
        {
            key: "status",
            title: t("admin.users.status"),
            width: "10%",
            render: (user) => {
                const banned = user.status === 0;
                return (
                    <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
                            banned
                                ? "bg-danger-soft text-danger-fg"
                                : "bg-success-soft text-success-fg"
                        }`}
                    >
                        {banned
                            ? t("admin.users.statusBanned")
                            : t("admin.users.statusActive")}
                    </span>
                );
            },
        },
        {
            key: "createdAt",
            title: t("admin.users.createdAt"),
            width: "22%",
            render: (user) => (
                <span className="block truncate text-xs font-medium text-ink-muted">
                    {formatWhen(user.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: t("admin.users.actions"),
            width: "14%",

            render: (user) => {
                if (user.role === "ADMIN") {
                    return (
                        <span className="inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-micro text-ink-faint">
                            {t("admin.users.protected")}
                        </span>
                    );
                }
                const banned = user.status === 0;
                const items = [
                    {
                        key: banned ? "unban" : "ban",
                        label: banned
                            ? t("admin.users.unban")
                            : t("admin.users.ban"),
                        icon: banned ? RotateCcw : Ban,
                        danger: !banned,
                        disabled: busyId === user.id,
                        loading: busyId === user.id,
                        loadingLabel: banned
                            ? t("admin.users.unban")
                            : t("admin.users.ban"),
                        onClick: () => setPendingTarget(user),
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
                        <Users
                            className="h-4 w-4 text-accent"
                            aria-hidden="true"
                        />
                        {t("admin.users.title")}
                    </h1>
                    <p className="mt-1 text-xs text-ink-muted">
                        {t("admin.users.subtitle")}
                    </p>
                </div>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
                        aria-hidden="true"
                    />
                    <input
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                        placeholder={t("admin.users.keywordPlaceholder")}
                        className="h-9 w-64 rounded-lg border border-border bg-canvas pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent-200 focus:outline-none focus:ring-2 focus:ring-accent-200/40"
                    />
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <DataTable
                    columns={columns}
                    rows={users}
                    loading={loading}
                    emptyTitle={t("admin.users.empty")}
                    emptyHint={t("admin.users.emptyHint")}
                    emptyIcon={Users}
                    minWidth="920px"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    paginationDisabled={loading}
                />
            </div>

            <ConfirmModal
                isOpen={Boolean(pendingTarget)}
                onClose={() => setPendingTarget(null)}
                onConfirm={() => handleToggleStatus(pendingTarget)}
                confirming={busyId === pendingTarget?.id}
                title={
                    pendingTarget?.status === 1
                        ? t("admin.users.banTitle")
                        : t("admin.users.unbanTitle")
                }
                message={
                    pendingTarget?.status === 1
                        ? t("admin.users.banMessage", {
                              name: pendingTarget?.username,
                          })
                        : t("admin.users.unbanMessage", {
                              name: pendingTarget?.username,
                          })
                }
                confirmText={
                    pendingTarget?.status === 1
                        ? t("admin.users.ban")
                        : t("admin.users.unban")
                }
                cancelText={t("common.cancel")}
                danger={pendingTarget?.status === 1}
            />
        </div>
    );
};

export default AdminUsersPage;
