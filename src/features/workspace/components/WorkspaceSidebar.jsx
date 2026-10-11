import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    Blocks,
    ChevronRight,
    Image,
    Loader2,
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
                active ? "bg-accent-soft" : "hover:bg-surface-muted"
            }`}
        >
            <button
                type="button"
                onClick={() => onSelect(session.id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
            >
                <span className="grid h-3 w-3 shrink-0 place-items-center">
                    {running || unread ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    ) : null}
                </span>
                <span
                    className={`min-w-0 flex-1 truncate text-caption ${
                        active ? "font-semibold text-accent" : "text-ink"
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
                className="mr-1 hidden h-6 w-6 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-canvas hover:text-accent group-hover:grid"
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
    const [searchOpen, setSearchOpen] = useState(false);
    const sessionListRef = useRef(null);
    const loadMoreSentinelRef = useRef(null);
    const displayName = userInfo?.nickname || userInfo?.username || "DinQorAI";
    const avatarText = displayName.slice(0, 2).toUpperCase();
    const linkClass = (view) =>
        `flex min-h-10 items-center gap-3 rounded-lg px-3 text-body font-medium transition-colors ${
            activeView === view
                ? "bg-accent-soft text-accent"
                : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
        }`;

    const { pinnedSessions, recentSessions } = useMemo(() => {
        const sorted = [...(sessions || [])].sort(
            (a, b) => {
                const timeDifference =
                    parseSessionTime(b.updatedAt || b.createdAt) -
                    parseSessionTime(a.updatedAt || a.createdAt);
                return timeDifference || Number(b.id) - Number(a.id);
            },
        );
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
        <aside
            className="hidden h-dvh w-[220px] shrink-0 flex-col border-r border-border bg-canvas px-3.5 py-5 lg:flex"
            aria-label="DinQor Agent"
        >
            <div className="flex items-center justify-between px-2">
                <div className="text-title font-semibold text-ink">
                    DinQor Agent
                </div>
                <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="grid h-8 w-8 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-accent"
                    title={t("workspace.agent.searchPlaceholder", "搜索对话")}
                    aria-label={t("workspace.agent.searchPlaceholder", "搜索对话")}
                >
                    <Search className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="mt-7 flex min-h-0 flex-1 flex-col">
                <button
                    type="button"
                    onClick={onNewConversation}
                    className="flex h-10 items-center gap-2 rounded-lg bg-ink px-3 text-body font-semibold text-white transition-colors hover:bg-ink-secondary"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>
                        {t("workspace.agent.newConversation", "新建对话")}
                    </span>
                </button>

                <nav
                    className="mt-3 flex flex-col gap-1"
                    aria-label="Agent 工具"
                >
                    <button
                        type="button"
                        onClick={() => onSelectView("images")}
                        className={linkClass("images")}
                    >
                        <Image
                            className="h-[17px] w-[17px]"
                            aria-hidden="true"
                        />
                        <span>{t("workspace.menu.images", "图片")}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectView("plugins")}
                        className={linkClass("plugins")}
                    >
                        <Blocks
                            className="h-[17px] w-[17px]"
                            aria-hidden="true"
                        />
                        <span>{t("workspace.menu.plugins", "插件")}</span>
                    </button>
                </nav>

                <div
                    ref={sessionListRef}
                    className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-border pt-5"
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
                                className="w-full px-2 py-1 text-left text-micro text-accent hover:underline"
                            >
                                {t("workspace.agent.loadSessionsFailed", "加载失败，点击重试")}
                            </button>
                        ) : sessionsLoading && sessions.length === 0 ? (
                            <div className="flex items-center gap-2 px-2 py-1 text-micro text-ink-muted">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                {t("workspace.agent.loadingSessions", "正在加载对话…")}
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
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                {t("workspace.agent.loadingSessions", "正在加载对话…")}
                            </span>
                        ) : sessionsLoadMoreError ? (
                            <button
                                type="button"
                                onClick={onLoadMoreSessions}
                                className="text-micro text-accent hover:underline"
                            >
                                {t("workspace.agent.loadSessionsFailed", "加载失败，点击重试")}
                            </button>
                        ) : sessionsHasMore ? (
                            <button
                                type="button"
                                onClick={onLoadMoreSessions}
                                className="text-micro text-ink-muted hover:text-accent"
                            >
                                {t("workspace.agent.loadMoreSessions", "加载更多对话")}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onOpenSettings}
                className="mt-4 flex min-h-[60px] items-center gap-3 rounded-xl border border-border bg-canvas px-3 text-left transition-colors hover:bg-surface-muted"
                aria-label={t("workspace.settings")}
            >
                <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-accent-soft text-micro font-bold text-accent">
                    {avatarText}
                    {userInfo?.avatar ? (
                        <img
                            src={userInfo.avatar}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : null}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption font-medium text-ink">
                        {displayName}
                    </span>
                    <span className="mt-0.5 block truncate text-micro text-ink-muted">
                        {userInfo?.role || "USER"}
                    </span>
                </span>
                <ChevronRight
                    className="h-4 w-4 shrink-0 text-ink-faint"
                    aria-hidden="true"
                />
            </button>
            <WorkspaceConversationSearchModal
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelect={onSelectConversation}
            />
        </aside>
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
    activeView: PropTypes.oneOf(["images", "plugins", null]),
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
