import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ChevronDown,
    Coins,
    Loader2,
    LogOut,
    Settings2,
    Shield,
    UserRound,
} from "lucide-react";
import { useAuthSession } from "@features/auth/context/authSessionContextValue";
import { authService } from "@features/auth/services/authService";
import {
    pointsService,
    formatPoints,
} from "@features/profile/services/pointsService";
import { useToast } from "@hooks/useToast";

const getDisplayName = (userInfo) =>
    userInfo?.nickname || userInfo?.username || "";

/**
 * 顶栏用户区：头像 + 用户名 + 积分。点击展开浮框展示部分用户信息，
 * 提供个人设置 / 退出登录入口。
 */
const UserMenu = ({ onOpenSettings }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const { userInfo } = useAuthSession();
    const [open, setOpen] = useState(false);
    const [points, setPoints] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const boxRef = useRef(null);

    const displayName = getDisplayName(userInfo);
    const avatarText = (displayName || "XL").slice(0, 2).toUpperCase();
    const avatar = userInfo?.avatar;

    useEffect(() => {
        if (!open) return;
        const handler = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // 积分余额：挂载与浮框打开时刷新（静默失败，不影响顶栏渲染）。
    useEffect(() => {
        let active = true;
        pointsService
            .overview({ _silent: true })
            .then((data) => active && setPoints(data))
            .catch(() => {
                /* 静默保留旧值 */
            });
        return () => {
            active = false;
        };
    }, [open, userInfo?.id]);

    const handleLogout = useCallback(async () => {
        setLoggingOut(true);
        try {
            await authService.logout();
            window.location.href = "/";
        } catch {
            setLoggingOut(false);
            toast.error(t("workspace.logoutFailed"));
        }
    }, [t, toast]);

    return (
        <div className="relative" ref={boxRef}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex min-h-11 items-center gap-1.5 rounded-xl px-1.5 py-1 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent-200 sm:gap-2"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={t("workspace.userMenu")}
            >
                <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-micro font-black uppercase text-white">
                    {avatarText}
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={displayName}
                            className="absolute inset-0 h-full w-full rounded-full object-cover"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    ) : null}
                </span>
                <span className="hidden min-w-0 text-left min-[420px]:block">
                    <span className="block max-w-[8rem] truncate text-xs font-bold text-ink">
                        {displayName}
                    </span>
                    <span className="mt-0.5 block max-w-[8rem] truncate text-micro font-medium text-ink-faint">
                        {points
                            ? `${t("workspace.points")}: ${formatPoints(points.balance)}`
                            : t("workspace.title")}
                    </span>
                </span>
                <ChevronDown
                    className={`hidden h-3.5 w-3.5 text-ink-faint transition-transform min-[420px]:block ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-canvas shadow-lg shadow-black/5"
                >
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
                                {userInfo?.email || userInfo?.username || ""}
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

                    <div className="border-t border-border p-1.5">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
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
    );
};

export default UserMenu;
