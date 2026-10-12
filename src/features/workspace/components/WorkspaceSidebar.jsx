import { useEffect, useId, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    Brain,
    CalendarClock,
    Library,
    Blocks,
    ChevronRight,
    FileText,
    Image,
    Loader2,
    PanelLeftClose,
    PanelLeftOpen,
    PenLine,
    Pin,
    PinOff,
    Plus,
    Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import WorkspaceConversationSearchModal from "./WorkspaceConversationSearchModal";

const parseSessionTime = (value) => {
    if (!value) return 0;
    const parsed = new Date(
        typeof value === "string" ? value.replace(" ", "T") : value,
    ).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatSessionTime = (value) => {
    const timestamp = parseSessionTime(value);
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

const SessionRow = ({ session, active, onSelect, onTogglePin, t }) => {
    const pinned = Number(session.isPinned) === 1;
    const running = session.status === "running";
    const unread = !running && !active && Boolean(session.unread);
    const title = session.title || t("blog.agent.untitled", "未命名对话");

    return (
        <div
            className={`group flex min-w-0 items-center rounded-lg transition-colors ${
                active ? "bg-surface-muted" : "hover:bg-surface-muted"
            }`}
        >
            <button
                type="button"
                onClick={() => onSelect(session.id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
            >
                <span className="grid h-3 w-3 shrink-0 place-items-center">
                    {running || unread ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                    ) : null}
                </span>
                <span
                    className={`min-w-0 flex-1 truncate text-caption ${
                        active ? "font-semibold text-ink" : "text-ink"
                    }`}
                >
                    {title}
                </span>
                <span className="shrink-0 text-micro text-ink-faint">
                    {formatSessionTime(session.updatedAt || session.createdAt)}
                </span>
            </button>
            <button
                type="button"
                onClick={() => onTogglePin(session.id, !pinned)}
                className="mr-1 hidden h-6 w-6 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-canvas hover:text-ink group-hover:grid"
                title={
                    pinned
                        ? t("workspace.agent.unpin", "取消置顶")
                        : t("workspace.agent.pin", "置顶")
                }
                aria-label={
                    pinned
                        ? t("workspace.agent.unpin", "取消置顶")
                        : t("workspace.agent.pin", "置顶")
                }
            >
                {pinned ? (
                    <PinOff className="h-3 w-3" aria-hidden="true" />
                ) : (
                    <Pin className="h-3 w-3" aria-hidden="true" />
                )}
            </button>
        </div>
    );
};

SessionRow.propTypes = {
    session: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        createdAt: PropTypes.string,
        isPinned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        title: PropTypes.string,
        unread: PropTypes.bool,
        updatedAt: PropTypes.string,
    }).isRequired,
    active: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onTogglePin: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

const WorkspaceSidebar = ({
    userInfo,
    sessions,
    activeConversationId,
    sessionsLoading,
    sessionsHasMore,
    sessionsLoadingMore,
    sessionsLoadError,
    sessionsLoadMoreError,
    onNewConversation,
    onSelectConversation,
    onTogglePin,
    onLoadSessions,
    onLoadMoreSessions,
    onOpenSettings,
    activeView,
    onSelectView,
}) => {
    const { t } = useTranslation();
    const sidebarInstanceId = useId();
    const [historyOpen, setHistoryOpen] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const sessionListRef = useRef(null);
    const loadMoreSentinelRef = useRef(null);
    const displayName = userInfo?.nickname || userInfo?.username || "DinQorAI";
    const avatarText = displayName.slice(0, 2).toUpperCase();
    const sidebarToggleLabel = t(
        collapsed
            ? "workspace.agent.expandSidebar"
            : "workspace.agent.collapseSidebar",
    );
    const openSearch = (event) => {
        if (import.meta.env.DEV) {
            console.debug("[ConversationSearch] open-click", {
                at: new Date().toISOString(),
                sidebarInstanceId,
                clickCount: event?.detail,
                alreadyOpen: searchOpen,
            });
        }
        setSearchOpen(true);
    };
    const collapseSidebarButton = (
        <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label={t("workspace.agent.collapseSidebar")}
            title={t("workspace.agent.collapseSidebar")}
            className="group/sidebar-toggle relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-caption font-medium text-white opacity-0 shadow-sm transition-opacity group-hover/sidebar-toggle:opacity-100 group-focus-visible/sidebar-toggle:opacity-100"
            >
                {t("workspace.agent.collapseSidebar")}
            </span>
        </button>
    );
    const collapsedLogoButton = (
        <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label={sidebarToggleLabel}
            title={sidebarToggleLabel}
            className="group/logo relative grid h-10 w-10 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
            <img
                src="/assets/workspace/workspace-logo.svg"
                alt="DinQor"
                className="h-full w-full object-contain transition-opacity duration-150 group-hover/logo:opacity-0 group-focus-visible/logo:opacity-0"
            />
            <span className="absolute inset-0 grid place-items-center text-ink opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100">
                <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            </span>
        </button>
    );
    const isViewActive = (view) => activeView === view;
    const chatIsActive = activeView === null;
    const newConversationClass = chatIsActive
        ? "bg-ink font-semibold text-white hover:bg-ink-secondary"
        : "text-ink-secondary hover:text-ink";
    const linkClass = (view) => {
        const active = isViewActive(view);
        return `group/nav relative flex h-10 items-center text-body transition-colors duration-200 ${
            collapsed
                ? "h-11 w-11 justify-center rounded-xl"
                : "w-full gap-3 rounded-lg px-3"
        } ${
            active
                ? collapsed
                    ? "bg-ink text-white"
                    : "bg-ink font-semibold text-white"
                : "text-ink-secondary hover:text-ink"
        }`;
    };
    const navIconClass = (view) => {
        const active = isViewActive(view);
        return `grid shrink-0 place-items-center ${
            collapsed
                ? "h-9 w-9"
                : `h-8 w-8 rounded-lg transition-colors ${active ? "bg-white/10" : "group-hover/nav:bg-surface-muted"}`
        }`;
    };
    const primaryItems = [
        { view: "articles", icon: Library, label: t("contentLibrary.articles") },
        { view: "plans", icon: CalendarClock, label: t("contentLibrary.plans") },
        { view: "writing", icon: PenLine, label: t("workspace.agent.nav.writing") },
        { view: "documents", icon: FileText, label: t("workspace.agent.nav.documents") },
        { view: "memory", icon: Brain, label: t("workspace.agent.nav.memory") },
    ];
    const utilityItems = [
        { view: "images", icon: Image, label: t("workspace.menu.images") },
        { view: "plugins", icon: Blocks, label: t("workspace.menu.plugins") },
    ];

    const { pinnedSessions, recentSessions } = useMemo(() => {
        const sorted = [...(sessions || [])].sort((a, b) => {
            const timeDifference =
                parseSessionTime(b.updatedAt || b.createdAt) -
                parseSessionTime(a.updatedAt || a.createdAt);
            return timeDifference || Number(b.id) - Number(a.id);
        });
        return {
            pinnedSessions: sorted.filter(
                (session) => Number(session.isPinned) === 1,
            ),
            recentSessions: sorted.filter(
                (session) => Number(session.isPinned) !== 1,
            ),
        };
    }, [sessions]);

    useEffect(() => {
        const root = sessionListRef.current;
        const sentinel = loadMoreSentinelRef.current;
        if (
            !root ||
            !sentinel ||
            !sessionsHasMore ||
            sessionsLoadingMore ||
            sessionsLoadMoreError ||
            typeof onLoadMoreSessions !== "function" ||
            typeof IntersectionObserver === "undefined"
        ) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting))
                    onLoadMoreSessions();
            },
            { root, rootMargin: "120px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [
        onLoadMoreSessions,
        sessionsHasMore,
        sessionsLoadMoreError,
        sessionsLoadingMore,
        sessions.length,
    ]);

    return (
        <>
        <aside
            className={`hidden h-dvh shrink-0 flex-col border-r border-border bg-canvas transition-[width,padding] duration-200 lg:flex ${collapsed ? "w-[72px] px-1.5 py-3" : "w-[252px] px-3.5 py-5"}`}
            aria-label="DinQor Agent"
        >
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
                <div className="flex min-w-0 items-center gap-2.5">
                    {collapsed ? collapsedLogoButton : null}
                    {!collapsed ? (
                        <span className="min-w-0">
                            <span className="block truncate text-title font-semibold text-ink">
                                DinQor
                            </span>
                        </span>
                    ) : null}
                </div>
                {!collapsed ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={openSearch}
                            className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                            title={t("workspace.agent.searchPlaceholder", "搜索对话")}
                            aria-label={t("workspace.agent.searchPlaceholder", "搜索对话")}
                        >
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {collapseSidebarButton}
                    </div>
                ) : null}
            </div>

            {collapsed ? (
                <div className="mt-2 flex flex-col items-center gap-1">
                    <button
                        type="button"
                        onClick={onNewConversation}
                        className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${newConversationClass}`}
                        title={t("workspace.agent.newConversation", "新建对话")}
                        aria-label={t("workspace.agent.newConversation", "新建对话")}
                    >
                        <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={openSearch}
                        className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                        title={t("workspace.agent.searchPlaceholder", "搜索对话")}
                        aria-label={t("workspace.agent.searchPlaceholder", "搜索对话")}
                    >
                        <Search className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            ) : null}

            <div className={`flex min-h-0 flex-1 flex-col ${collapsed ? "mt-2 items-center" : "mt-4"}`}>
                {!collapsed ? (
                    <button
                        type="button"
                        onClick={onNewConversation}
                        aria-label={t("workspace.agent.newConversation", "新建对话")}
                        aria-current={chatIsActive ? "page" : undefined}
                        className={`group/new-conversation flex h-10 w-full items-center gap-3 rounded-lg px-3 text-body transition-colors ${newConversationClass}`}
                    >
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${chatIsActive ? "" : "group-hover/new-conversation:bg-surface-muted"}`}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span>
                            {t("workspace.agent.newConversation", "新建对话")}
                        </span>
                    </button>
                ) : null}

                <nav
                    className={`flex w-full flex-col ${collapsed ? "mt-2 items-center gap-1" : "mt-5 gap-1"}`}
                    aria-label={t("workspace.agent.tools")}
                >
                    {!collapsed ? <div className="mb-1 px-3 pt-1 text-micro font-medium uppercase tracking-[0.12em] text-ink-faint">{t("workspace.agent.workspaceNav")}</div> : null}
                    {primaryItems.map(({ view, icon: Icon, label }) => (
                        <button key={view} type="button" onClick={() => onSelectView(view)} className={linkClass(view)} title={collapsed ? label : undefined} aria-label={label}>
                            <span className={navIconClass(view)}>
                                <Icon className={collapsed ? "h-5 w-5" : "h-[17px] w-[17px]"} aria-hidden="true" />
                            </span>
                            {!collapsed ? <span>{label}</span> : null}
                        </button>
                    ))}
                    <div className={`my-2 border-t border-border ${collapsed ? "w-9" : "mx-2"}`} />
                    {!collapsed ? <div className="mb-1 px-3 text-micro font-medium uppercase tracking-[0.12em] text-ink-faint">{t("workspace.agent.tools")}</div> : null}
                    {utilityItems.map(({ view, icon: Icon, label }) => (
                        <button key={view} type="button" onClick={() => onSelectView(view)} className={linkClass(view)} title={collapsed ? label : undefined} aria-label={label}>
                            <span className={navIconClass(view)}>
                                <Icon className={collapsed ? "h-5 w-5" : "h-[17px] w-[17px]"} aria-hidden="true" />
                            </span>
                            {!collapsed ? <span>{label}</span> : null}
                        </button>
                    ))}
                </nav>

                {!collapsed ? <button
                    type="button"
                    onClick={() => setHistoryOpen((open) => !open)}
                    aria-expanded={historyOpen}
                    className="mt-6 flex items-center justify-between border-t border-border px-2 pt-4 text-caption text-ink-muted"
                >
                    {t("blog.agentChat.recentChats")}
                    <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${historyOpen ? "rotate-90" : ""}`}
                    />
                </button> : null}
                <div
                    hidden={!historyOpen || collapsed}
                    ref={sessionListRef}
                    className="mt-3 min-h-0 flex-1 overflow-y-auto"
                >
                    <div className="px-2 text-caption font-semibold text-ink-muted">
                        {t("workspace.agent.groups.pinned", "置顶")}
                    </div>
                    <div className="mt-2 space-y-0.5">
                        {pinnedSessions.length ? (
                            pinnedSessions.map((session) => (
                                <SessionRow
                                    key={session.id}
                                    session={session}
                                    active={
                                        activeView === null &&
                                        String(activeConversationId) ===
                                            String(session.id)
                                    }
                                    onSelect={onSelectConversation}
                                    onTogglePin={onTogglePin}
                                    t={t}
                                />
                            ))
                        ) : (
                            <div className="px-2 py-1 text-micro text-ink-faint">
                                {t("workspace.agent.noPinned", "暂无置顶对话")}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 px-2">
                        <span className="text-caption font-semibold text-ink-muted">
                            {t("workspace.agent.groups.recent", "最近")}
                        </span>
                    </div>
                    <div className="mt-2 space-y-0.5">
                        {recentSessions.length ? (
                            recentSessions.map((session) => (
                                <SessionRow
                                    key={session.id}
                                    session={session}
                                    active={
                                        activeView === null &&
                                        String(activeConversationId) ===
                                            String(session.id)
                                    }
                                    onSelect={onSelectConversation}
                                    onTogglePin={onTogglePin}
                                    t={t}
                                />
                            ))
                        ) : sessionsLoadError && sessions.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => onLoadSessions?.()}
                                className="w-full px-2 py-1 text-left text-micro text-ink hover:underline"
                            >
                                {t(
                                    "workspace.agent.loadSessionsFailed",
                                    "加载失败，点击重试",
                                )}
                            </button>
                        ) : sessionsLoading && sessions.length === 0 ? (
                            <div className="flex items-center gap-2 px-2 py-1 text-micro text-ink-muted">
                                <Loader2
                                    className="h-3.5 w-3.5 animate-spin"
                                    aria-hidden="true"
                                />
                                {t(
                                    "workspace.agent.loadingSessions",
                                    "正在加载对话…",
                                )}
                            </div>
                        ) : (
                            <div className="px-2 py-1 text-micro text-ink-faint">
                                {t(
                                    "workspace.agent.noConversations",
                                    "暂无会话",
                                )}
                            </div>
                        )}
                    </div>
                    <div
                        ref={loadMoreSentinelRef}
                        className="flex min-h-10 items-center justify-center px-2"
                    >
                        {sessionsLoadingMore ? (
                            <span className="flex items-center gap-2 text-micro text-ink-muted">
                                <Loader2
                                    className="h-3.5 w-3.5 animate-spin"
                                    aria-hidden="true"
                                />
                                {t(
                                    "workspace.agent.loadingSessions",
                                    "正在加载对话…",
                                )}
                            </span>
                        ) : sessionsLoadMoreError ? (
                            <button
                                type="button"
                                onClick={onLoadMoreSessions}
                                className="text-micro text-ink hover:underline"
                            >
                                {t(
                                    "workspace.agent.loadSessionsFailed",
                                    "加载失败，点击重试",
                                )}
                            </button>
                        ) : sessionsHasMore ? (
                            <button
                                type="button"
                                onClick={onLoadMoreSessions}
                                className="text-micro text-ink-muted hover:text-ink"
                            >
                                {t(
                                    "workspace.agent.loadMoreSessions",
                                    "加载更多对话",
                                )}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onOpenSettings}
                className={`mt-3 flex min-h-[48px] items-center rounded-xl border border-border bg-canvas text-left transition-colors hover:bg-surface-muted ${collapsed ? "w-10 justify-center border-0" : "gap-3 px-3"}`}
                aria-label={t("workspace.settings")}
                title={collapsed ? displayName : undefined}
            >
                <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-muted text-micro font-bold text-ink ${collapsed ? "h-8 w-8" : "h-9 w-9"}`}>
                    {avatarText}
                    {userInfo?.avatar ? (
                        <img
                            src={userInfo.avatar}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : null}
                </span>
                {!collapsed ? <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption font-medium text-ink">
                        {displayName}
                    </span>
                    <span className="mt-0.5 block truncate text-micro text-ink-muted">
                        {userInfo?.role || "USER"}
                    </span>
                </span> : null}
                {!collapsed ? <ChevronRight
                    className="h-4 w-4 shrink-0 text-ink-faint"
                    aria-hidden="true"
                /> : null}
            </button>
            <WorkspaceConversationSearchModal
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelect={onSelectConversation}
            />
        </aside>
        <div className="flex shrink-0 flex-col border-b border-border bg-canvas px-3 py-2 lg:hidden">
            <div className="flex h-9 items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <img src="/assets/workspace/workspace-logo.svg" alt="DinQor" className="h-8 w-8 object-contain" />
                    <span className="truncate text-caption font-semibold text-ink">DinQor Agent</span>
                </div>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={onNewConversation} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${newConversationClass}`} aria-label={t("workspace.agent.newConversation")} aria-current={chatIsActive ? "page" : undefined}>
                        <Plus className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={openSearch} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted" aria-label={t("workspace.agent.searchPlaceholder")}>
                        <Search className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={onOpenSettings} className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted text-micro font-semibold text-ink" aria-label={t("workspace.settings")}>
                        {userInfo?.avatar ? <img src={userInfo.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : avatarText}
                    </button>
                </div>
            </div>
            <nav className="mt-2 flex gap-1 overflow-x-auto pb-0.5" aria-label={t("workspace.agent.workspaceNav")}>
                {[...primaryItems, ...utilityItems].map(({ view, icon: Icon, label }) => {
                    const active = view === "chat" ? !activeView : activeView === view;
                    return (
                        <button key={view} type="button" onClick={() => onSelectView(view)} aria-current={active ? "page" : undefined} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-micro transition-colors ${active ? "bg-ink font-semibold text-white" : "text-ink-muted hover:bg-surface-muted hover:text-ink"}`}>
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {label}
                        </button>
                    );
                })}
            </nav>
        </div>
        </>
    );
};

WorkspaceSidebar.propTypes = {
    userInfo: PropTypes.shape({
        avatar: PropTypes.string,
        nickname: PropTypes.string,
        role: PropTypes.string,
        username: PropTypes.string,
    }),
    sessions: PropTypes.arrayOf(PropTypes.object),
    sessionsLoading: PropTypes.bool,
    sessionsHasMore: PropTypes.bool,
    sessionsLoadingMore: PropTypes.bool,
    sessionsLoadError: PropTypes.bool,
    sessionsLoadMoreError: PropTypes.bool,
    activeConversationId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onNewConversation: PropTypes.func.isRequired,
    onSelectConversation: PropTypes.func.isRequired,
    onTogglePin: PropTypes.func.isRequired,
    onLoadSessions: PropTypes.func,
    onLoadMoreSessions: PropTypes.func,
    onOpenSettings: PropTypes.func.isRequired,
    activeView: PropTypes.oneOf([
        "articles",
        "plans",
        "images",
        "plugins",
        "writing",
        "documents",
        "memory",
        null,
    ]),
    onSelectView: PropTypes.func.isRequired,
};

WorkspaceSidebar.defaultProps = {
    userInfo: null,
    sessions: [],
    sessionsLoading: false,
    sessionsHasMore: false,
    sessionsLoadingMore: false,
    sessionsLoadError: false,
    sessionsLoadMoreError: false,
    activeConversationId: null,
    activeView: null,
};

export default WorkspaceSidebar;
