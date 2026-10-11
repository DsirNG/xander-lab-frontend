import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, MessageCircle, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "@shared/ui/overlays/Modal";
import {
    agentConversationService,
    normalizeAgentConversationPage,
} from "@features/agent/services/agentConversationService";

const PAGE_SIZE = 20;

const debugConversationSearch = (event, details = {}) => {
    if (!import.meta.env.DEV) return;
    console.debug(`[ConversationSearch] ${event}`, {
        at: new Date().toISOString(),
        ...details,
    });
};

const appendUnique = (current, incoming) => {
    const seen = new Set(current.map((item) => String(item.id)));
    const additions = [];
    incoming.forEach((item) => {
        const key = String(item.id);
        if (!seen.has(key)) {
            seen.add(key);
            additions.push(item);
        }
    });
    return [...current, ...additions];
};

const WorkspaceConversationSearchModal = ({ open, onClose, onSelect }) => {
    const { t } = useTranslation();
    const modalInstanceId = useId();
    const [query, setQuery] = useState("");
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const requestVersionRef = useRef(0);
    const requestControllerRef = useRef(null);
    const resultsRef = useRef(null);
    const sentinelRef = useRef(null);
    const previousOpenRef = useRef(open);

    useEffect(() => {
        const wasOpen = previousOpenRef.current;
        previousOpenRef.current = open;
        if (wasOpen !== open) {
            debugConversationSearch("visibility-change", {
                modalInstanceId,
                from: wasOpen,
                to: open,
            });
        }
    }, [modalInstanceId, open]);

    useEffect(() => {
        const requestVersion = ++requestVersionRef.current;
        requestControllerRef.current?.abort();

        if (!open) {
            setQuery("");
            setItems([]);
            setPage(1);
            setHasMore(false);
            setLoading(false);
            setLoadingMore(false);
            setLoadError(false);
            setLoadMoreError(false);
            return undefined;
        }

        debugConversationSearch("search-effect", {
            modalInstanceId,
            requestVersion,
            queryLength: query.length,
            retryKey,
        });
        const controller = new AbortController();
        requestControllerRef.current = controller;
        setLoading(true);
        setLoadingMore(false);
        setLoadError(false);
        setLoadMoreError(false);
        const delay = query.trim() ? 250 : 0;
        let requestStarted = false;
        const timer = window.setTimeout(async () => {
            requestStarted = true;
            try {
                debugConversationSearch("list-request-start", {
                    modalInstanceId,
                    requestVersion,
                    page: 1,
                    size: PAGE_SIZE,
                    queryLength: query.length,
                });
                const response = await agentConversationService.list({
                    page: 1,
                    size: PAGE_SIZE,
                    search: query,
                    _silent: true,
                    dedupe: false,
                    signal: controller.signal,
                });
                const result = normalizeAgentConversationPage(response);
                if (requestVersion !== requestVersionRef.current) return;
                setItems(result.items);
                setPage(result.page || 1);
                setHasMore(result.hasMore);
                debugConversationSearch("list-request-success", {
                    modalInstanceId,
                    requestVersion,
                    itemCount: result.items.length,
                    hasMore: result.hasMore,
                });
            } catch (error) {
                debugConversationSearch(
                    controller.signal.aborted ? "list-request-aborted" : "list-request-error",
                    {
                        modalInstanceId,
                        requestVersion,
                        errorName: controller.signal.aborted ? undefined : error?.name,
                    },
                );
                if (controller.signal.aborted || requestVersion !== requestVersionRef.current)
                    return;
                setItems([]);
                setHasMore(false);
                setLoadError(true);
            } finally {
                if (requestVersion === requestVersionRef.current)
                    setLoading(false);
            }
        }, delay);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
            debugConversationSearch("search-effect-cleanup", {
                modalInstanceId,
                requestVersion,
                requestStarted,
            });
        };
    }, [modalInstanceId, open, query, retryKey]);

    const loadMore = useCallback(async () => {
        if (!open || loading || loadingMore || loadError || loadMoreError || !hasMore)
            return;
        const requestVersion = requestVersionRef.current;
        const nextPage = page + 1;
        const controller = new AbortController();
        requestControllerRef.current?.abort();
        requestControllerRef.current = controller;
        setLoadingMore(true);
        setLoadMoreError(false);
        try {
            const response = await agentConversationService.list({
                page: nextPage,
                size: PAGE_SIZE,
                search: query,
                _silent: true,
                dedupe: false,
                signal: controller.signal,
            });
            const result = normalizeAgentConversationPage(response);
            if (requestVersion !== requestVersionRef.current) return;
            setItems((current) => appendUnique(current, result.items));
            setPage(result.page || nextPage);
            setHasMore(result.hasMore);
        } catch {
            if (!controller.signal.aborted && requestVersion === requestVersionRef.current)
                setLoadMoreError(true);
        } finally {
            if (requestVersion === requestVersionRef.current)
                setLoadingMore(false);
        }
    }, [hasMore, loadError, loadMoreError, loading, loadingMore, open, page, query]);

    useEffect(() => {
        const root = resultsRef.current;
        const sentinel = sentinelRef.current;
        if (!open || !root || !sentinel || !hasMore || loading || loadingMore || loadError || loadMoreError)
            return undefined;
        if (typeof IntersectionObserver === "undefined") return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) loadMore();
            },
            { root, rootMargin: "100px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadError, loadMore, loadMoreError, loading, loadingMore, open, items.length]);

    const close = () => {
        debugConversationSearch("close-request", { modalInstanceId });
        requestControllerRef.current?.abort();
        onClose();
    };

    return (
        <Modal
            isOpen={open}
            onClose={close}
            title={t("workspace.agent.searchPlaceholder", "搜索对话")}
            width="max-w-lg"
            className="h-[560px]"
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-2.5">
                    <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        maxLength={100}
                        placeholder={t("workspace.agent.searchPlaceholder", "搜索对话")}
                        autoFocus
                        className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-faint"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="grid h-7 w-7 place-items-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink"
                            aria-label={t("common.clear", "清除")}
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                <div
                    ref={resultsRef}
                    className="max-h-[50vh] min-h-32 overflow-y-auto pr-1"
                    aria-busy={loading || loadingMore}
                >
                    {loading ? (
                        <div className="flex min-h-32 items-center justify-center gap-2 text-caption text-ink-muted">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            {t("workspace.agent.loadingSessions", "正在加载对话…")}
                        </div>
                    ) : loadError ? (
                        <button
                            type="button"
                            onClick={() => setRetryKey((current) => current + 1)}
                            className="flex min-h-32 w-full items-center justify-center text-caption text-accent hover:underline"
                        >
                            {t("workspace.agent.loadSessionsFailed", "加载失败，点击重试")}
                        </button>
                    ) : items.length ? (
                        <>
                            <div className="space-y-1">
                                {items.map((session) => (
                                    <button
                                        key={session.id}
                                        type="button"
                                        onClick={() => {
                                            close();
                                            onSelect(session.id);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
                                    >
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span className="min-w-0 flex-1 truncate text-body text-ink">
                                            {session.title || t("blog.agent.untitled", "未命名对话")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div ref={sentinelRef} className="flex min-h-10 items-center justify-center">
                                {loadingMore ? (
                                    <span className="flex items-center gap-2 text-caption text-ink-muted">
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        {t("workspace.agent.loadingSessions", "正在加载对话…")}
                                    </span>
                                ) : loadMoreError ? (
                                    <button
                                        type="button"
                                        onClick={loadMore}
                                        className="text-caption text-accent hover:underline"
                                    >
                                        {t("workspace.agent.loadSessionsFailed", "加载失败，点击重试")}
                                    </button>
                                ) : hasMore ? (
                                    <button
                                        type="button"
                                        onClick={loadMore}
                                        className="text-caption text-ink-muted hover:text-accent"
                                    >
                                        {t("workspace.agent.loadMoreSessions", "加载更多对话")}
                                    </button>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-32 items-center justify-center text-caption text-ink-muted">
                            {query.trim()
                                ? t("blog.agentChat.searchNoMatches", "没有找到匹配的会话")
                                : t("workspace.agent.noConversations", "暂无对话")}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default WorkspaceConversationSearchModal;
