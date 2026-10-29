import React, { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    ChevronDown,
    Coins,
    Loader2,
    LogOut,
    Settings2,
    Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logout } from "@features/auth";
import { formatPoints, getPointsOverview } from "@features/account";
import { useToast } from "@shared/hooks/useToast";

const WorkspaceAccountMenu = ({
    userInfo,
    onOpenSettings,
    collapsed = false,
    compact = false,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const menuId = useId();
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [points, setPoints] = useState(null);

    const displayName =
        userInfo?.nickname || userInfo?.username || t("blog.agentChat.user");
    const avatarText = displayName.slice(0, 2).toUpperCase();
    const tier = userInfo?.tier || t("blog.agentChat.tierFree");

    useEffect(() => {
        if (!menuOpen) return undefined;

        const closeOnOutsidePointer = (event) => {
            if (!rootRef.current?.contains(event.target)) setMenuOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key !== "Escape") return;
            setMenuOpen(false);
            triggerRef.current?.focus();
        };

        document.addEventListener("pointerdown", closeOnOutsidePointer);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePointer);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return undefined;
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
            navigate("/", { replace: true });
        } catch {
            setLoggingOut(false);
            toast.error(t("workspace.logoutFailed"));
        }
    };

    const avatar = (
        <span
            className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent font-bold uppercase text-white ${compact ? "h-8 w-8 text-xs" : "h-9 w-9 text-caption"}`}
        >
            {avatarText}
            {userInfo?.avatar ? (
                <img
                    src={userInfo.avatar}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : null}
        </span>
    );

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={t("workspace.userMenu")}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls={menuOpen ? menuId : undefined}
                onClick={() => setMenuOpen((open) => !open)}
                title={collapsed || compact ? displayName : undefined}
                className={
                    compact
                        ? "grid h-9 w-9 place-items-center rounded-full bg-surface-muted text-ink transition-colors hover:bg-border"
                        : `flex min-h-12 items-center rounded-xl border border-border bg-canvas text-left transition-colors hover:bg-surface-muted ${collapsed ? "w-10 justify-center border-0" : "w-full gap-3 px-3"}`
                }
            >
                {avatar}
                {!collapsed && !compact ? (
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-caption font-medium text-ink">
                            {displayName}
                        </span>
                        <span className="mt-0.5 block truncate text-micro text-ink-muted">
                            {tier}
                        </span>
                    </span>
                ) : null}
                {!collapsed && !compact ? (
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${menuOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                    />
                ) : null}
            </button>

            {menuOpen ? (
                <div
                    id={menuId}
                    role="menu"
                    aria-label={t("workspace.userMenu")}
                    className={`absolute z-[80] w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-canvas p-2 shadow-md shadow-black/20 ${compact ? "right-0 top-full mt-2" : "bottom-full left-0 mb-2"}`}
                >
                    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-sm font-bold uppercase text-white">
                            {avatarText}
                            {userInfo?.avatar ? (
                                <img
                                    src={userInfo.avatar}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : null}
                        </span>
                        <span className="min-w-0">
                            <span className="flex min-w-0 items-center gap-1.5">
                                <span className="truncate text-sm font-semibold text-ink">
                                    {displayName}
                                </span>
                                {userInfo?.role ? (
                                    <span className="shrink-0 rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">
                                        {userInfo.role}
                                    </span>
                                ) : null}
                            </span>
                            <span className="block truncate text-micro text-ink-muted">
                                {userInfo?.email || userInfo?.username || "—"}
                            </span>
                        </span>
                    </div>

                    <div className="my-1 flex items-center gap-2.5 rounded-xl bg-surface-muted px-3 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-micro text-ink-muted">
                                {t("workspace.accountMenu.subscriptionTier")}
                            </span>
                            <span className="block truncate text-caption font-semibold text-ink">
                                {tier}
                            </span>
                        </span>
                    </div>

                    <div className="mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-ink-muted">
                            <Coins className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-micro text-ink-muted">
                                {t("workspace.points")}
                            </span>
                            <span className="block truncate text-caption font-semibold text-ink">
                                {points ? formatPoints(points.balance) : "—"}
                            </span>
                        </span>
                    </div>

                    <div className="border-t border-border pt-1">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setMenuOpen(false);
                                onOpenSettings();
                            }}
                            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-caption font-medium text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
                        >
                            <Settings2 className="h-4 w-4" aria-hidden="true" />
                            {t("workspace.settings")}
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-caption font-medium text-danger transition-colors hover:bg-danger-soft disabled:opacity-60"
                        >
                            {loggingOut ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                            )}
                            {t("nav.logout")}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

WorkspaceAccountMenu.propTypes = {
    userInfo: PropTypes.shape({
        avatar: PropTypes.string,
        email: PropTypes.string,
        nickname: PropTypes.string,
        role: PropTypes.string,
        tier: PropTypes.string,
        username: PropTypes.string,
    }),
    onOpenSettings: PropTypes.func.isRequired,
    collapsed: PropTypes.bool,
    compact: PropTypes.bool,
};

export default WorkspaceAccountMenu;
