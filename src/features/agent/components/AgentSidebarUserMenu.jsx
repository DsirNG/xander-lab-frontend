import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    ChevronDown,
    Coins,
    Loader2,
    LogOut,
    Settings2,
    Shield,
    UserRound,
    Send,
    CalendarClock,
    NotebookPen,
    Mail,
    Sparkles,
    Code2,
    Users,
    Server,
    SlidersHorizontal,
    Plug,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logout, useAuthSession } from "@features/auth";
import { formatPoints, getPointsOverview } from "@features/account";
import { useToast } from "@shared/hooks/useToast";

/** 工作台功能入口，与 WorkspaceLayout 菜单一致（当前页面外的独立全屏页面） */
const FEATURE_ENTRIES = [
    { to: "/workspace/publish", icon: Send, labelKey: "blog.publish" },
    { to: "/workspace/plans", icon: CalendarClock, labelKey: "nav.plans" },
    {
        to: "/workspace/blog-manage",
        icon: NotebookPen,
        labelKey: "profile.blogManage.title",
    },
    {
        to: "/workspace/email-reminders",
        icon: Mail,
        labelKey: "profile.emailReminders.title",
    },
    { to: "/workspace/img2three", icon: Sparkles, labelKey: "nav.img2three" },
    { to: "/workspace/studio", icon: Code2, labelKey: "nav.studio" },
];

/** 仅 ADMIN 角色可见的后台管理入口（路由侧另有 RequireAdmin 强校验） */
const ADMIN_ENTRIES = [
    {
        to: "/workspace/admin/users",
        icon: Users,
        labelKey: "admin.users.title",
    },
    {
        to: "/workspace/admin/model-providers",
        icon: Server,
        labelKey: "admin.providers.title",
    },
    {
        to: "/workspace/admin/model-pricing",
        icon: Coins,
        labelKey: "admin.pricing.title",
    },
    {
        to: "/workspace/admin/feature-model-configs",
        icon: SlidersHorizontal,
        labelKey: "admin.configs.title",
    },
    {
        to: "/workspace/admin/mcp-servers",
        icon: Plug,
        labelKey: "admin.mcpServers.title",
    },
];

const AgentSidebarUserMenu = ({ onOpenSettings }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { userInfo } = useAuthSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [points, setPoints] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const boxRef = useRef(null);

    const displayName =
        userInfo?.nickname || userInfo?.username || t("blog.agentChat.user");
    const avatarText = (displayName || "XL").slice(0, 2).toUpperCase();
    const avatar = userInfo?.avatar;
    const tier = userInfo?.tier || t("blog.agentChat.tierFree");

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target))
                setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        let active = true;
        getPointsOverview({ _silent: true })
            .then((data) => active && setPoints(data))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [menuOpen, userInfo?.id]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            window.location.href = "/";
        } catch {
            setLoggingOut(false);
            toast.error(t("workspace.logoutFailed"));
        }
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            {/* Bottom Profile */}
            <div className="p-3 border-t border-border/50">
                <div ref={boxRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        aria-label={t("workspace.userMenu")}
                        className={`flex w-full items-center justify-between rounded-xl p-2 transition ${
                            menuOpen
                                ? "bg-surface-muted"
                                : "hover:bg-surface-muted"
                        }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white font-bold text-xs uppercase">
                                {avatarText}
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={displayName}
                                        className="absolute inset-0 h-full w-full rounded-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : null}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                                <div className="text-sm font-semibold text-ink truncate">
                                    {displayName}
                                </div>
                                <div className="text-xs text-ink-muted truncate">
                                    {tier}
                                </div>
                            </div>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {menuOpen ? (
                        <div
                            role="menu"
                            className="absolute bottom-14 left-0 right-0 z-50 max-h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-border bg-canvas shadow-lg shadow-black/5"
                        >
                            {/* 用户信息 */}
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-black uppercase text-white">
                                    {avatarText}
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={displayName}
                                            className="absolute inset-0 h-full w-full rounded-full object-cover"
                                        />
                                    ) : null}
                                </span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <div className="truncate text-sm font-bold text-ink">
                                            {displayName}
                                        </div>
                                        {userInfo?.role ? (
                                            <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-micro font-bold uppercase text-accent ring-1 ring-accent-100">
                                                {userInfo.role}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="mt-0.5 truncate text-micro font-medium text-ink-faint">
                                        {userInfo?.email ||
                                            userInfo?.username ||
                                            ""}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-1 px-3 py-2.5">
                                <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2">
                                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-accent">
                                        <Coins className="h-3.5 w-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-micro font-medium text-ink-faint">
                                            {t("workspace.points")}
                                        </div>
                                        <div className="text-xs font-bold text-ink">
                                            {points
                                                ? formatPoints(points.balance)
                                                : "—"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2">
                                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-muted text-ink-faint">
                                        <UserRound className="h-3.5 w-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-micro font-medium text-ink-faint">
                                            {t("profile.account.username")}
                                        </div>
                                        <div className="truncate text-xs font-bold text-ink">
                                            {userInfo?.username || "—"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2">
                                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-muted text-ink-faint">
                                        <Shield className="h-3.5 w-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-micro font-medium text-ink-faint">
                                            {t("profile.account.role")}
                                        </div>
                                        <div className="text-xs font-bold text-ink">
                                            {userInfo?.role || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 工作台功能入口 */}
                            <div className="border-t border-border p-1.5">
                                <div className="px-3 py-1 text-micro font-semibold text-ink-faint">
                                    {t("workspace.title")}
                                </div>
                                <div className="grid gap-0.5">
                                    {FEATURE_ENTRIES.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.to}
                                                type="button"
                                                role="menuitem"
                                                onClick={() => {
                                                    closeMenu();
                                                    navigate(item.to);
                                                }}
                                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
                                            >
                                                <Icon
                                                    className="h-3.5 w-3.5 shrink-0 text-ink-muted"
                                                    aria-hidden="true"
                                                />
                                                {t(item.labelKey)}
                                            </button>
                                        );
                                    })}
                                    {userInfo?.role === "ADMIN" &&
                                        ADMIN_ENTRIES.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.to}
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        closeMenu();
                                                        navigate(item.to);
                                                    }}
                                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
                                                >
                                                    <Icon
                                                        className="h-3.5 w-3.5 shrink-0 text-ink-muted"
                                                        aria-hidden="true"
                                                    />
                                                    {t(item.labelKey)}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>

                            <div className="border-t border-border p-1.5">
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        closeMenu();
                                        onOpenSettings?.();
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
                                >
                                    <Settings2
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    {t("workspace.settings")}
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-muted transition hover:bg-danger-soft hover:text-danger disabled:opacity-60"
                                >
                                    {loggingOut ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <LogOut
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {t("nav.logout")}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};

AgentSidebarUserMenu.propTypes = {
    onOpenSettings: PropTypes.func,
};

export default AgentSidebarUserMenu;

