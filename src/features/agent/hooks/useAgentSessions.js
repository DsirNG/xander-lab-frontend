import { useCallback, useEffect, useRef, useState } from "react";
import {
    agentConversationService,
    normalizeAgentConversationPage,
} from "../services/agentConversationService";
import { isAbortError } from "../utils/conversationState";

const SESSIONS_POLL_INTERVAL_MS = 5000;
const SESSIONS_PAGE_SIZE = 30;

const mergeFirstPage = (current, firstPage) => {
    const firstPageIds = new Set(firstPage.map((item) => String(item.id)));
    return [
        ...firstPage,
        ...current.filter((item) => !firstPageIds.has(String(item.id))),
    ];
};

const appendUniqueSessions = (current, nextPage) => {
    const seen = new Set(current.map((item) => String(item.id)));
    const additions = [];
    nextPage.forEach((item) => {
        const key = String(item.id);
        if (!seen.has(key)) {
            seen.add(key);
            additions.push(item);
        }
    });
    return [...current, ...additions];
};

/**
 * 会话列表的生命周期与当前会话流式状态无关：列表可以在离开当前会话后继续刷新，
 * 也负责已读、置顶和列表中的乐观状态。把它独立出来，避免主对话 Hook 同时管理两套状态机。
 */
export const useAgentSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [sessionsHasMore, setSessionsHasMore] = useState(false);
    const [sessionsLoadingMore, setSessionsLoadingMore] = useState(false);
    const [sessionsLoadError, setSessionsLoadError] = useState(false);
    const [sessionsLoadMoreError, setSessionsLoadMoreError] = useState(false);
    const sessionsControllerRef = useRef(null);
    const sessionsMoreControllerRef = useRef(null);
    const sessionsRequestRef = useRef(0);
    const sessionsPageRef = useRef(1);
    const sessionsHasMoreRef = useRef(false);
    const sessionsLoadingMoreRef = useRef(false);

    /** quiet 用于轮询刷新：不闪列表骨架，失败也保留上一次的列表。 */
    const loadSessions = useCallback(async ({ quiet = false } = {}) => {
        const requestId = ++sessionsRequestRef.current;
        sessionsControllerRef.current?.abort();
        sessionsMoreControllerRef.current?.abort();
        sessionsMoreControllerRef.current = null;
        sessionsLoadingMoreRef.current = false;
        setSessionsLoadingMore(false);
        setSessionsLoadMoreError(false);
        const controller = new AbortController();
        sessionsControllerRef.current = controller;
        if (!quiet) {
            setSessionsLoading(true);
            setSessionsLoadError(false);
        }
        try {
            const response = await agentConversationService.list({
                page: 1,
                size: SESSIONS_PAGE_SIZE,
                _silent: true,
                dedupe: false,
                signal: controller.signal,
            });
            const result = normalizeAgentConversationPage(response);
            if (requestId === sessionsRequestRef.current) {
                setSessions((current) => mergeFirstPage(current, result.items));
                sessionsHasMoreRef.current = result.hasMore;
                setSessionsHasMore(result.hasMore);
                setSessionsLoadError(false);
            }
        } catch (error) {
            if (!isAbortError(error) && requestId === sessionsRequestRef.current) {
                if (!quiet) setSessionsLoadError(true);
            }
        } finally {
            if (requestId === sessionsRequestRef.current)
                setSessionsLoading(false);
        }
    }, []);

    const loadMoreSessions = useCallback(async () => {
        if (!sessionsHasMoreRef.current || sessionsLoadingMoreRef.current)
            return false;

        const requestId = sessionsRequestRef.current;
        const page = sessionsPageRef.current + 1;
        const controller = new AbortController();
        sessionsMoreControllerRef.current = controller;
        sessionsLoadingMoreRef.current = true;
        setSessionsLoadingMore(true);
        setSessionsLoadMoreError(false);

        try {
            const response = await agentConversationService.list({
                page,
                size: SESSIONS_PAGE_SIZE,
                _silent: true,
                dedupe: false,
                signal: controller.signal,
            });
            const result = normalizeAgentConversationPage(response);
            if (requestId !== sessionsRequestRef.current) return false;
            setSessions((current) => appendUniqueSessions(current, result.items));
            sessionsPageRef.current = result.page || page;
            sessionsHasMoreRef.current = result.hasMore;
            setSessionsHasMore(result.hasMore);
            return true;
        } catch (error) {
            if (!isAbortError(error) && requestId === sessionsRequestRef.current)
                setSessionsLoadMoreError(true);
            return false;
        } finally {
            if (requestId === sessionsRequestRef.current) {
                sessionsLoadingMoreRef.current = false;
                setSessionsLoadingMore(false);
            }
        }
    }, []);

    /** 新建会话先放进列表，详情随后由路由生命周期补齐。 */
    const prependSession = useCallback((session) => {
        if (!session?.id) return;
        setSessions((current) => [
            session,
            ...current.filter((item) => String(item.id) !== String(session.id)),
        ]);
    }, []);

    /** 上报已读：失败不打断对话，下次打开会重试。 */
    const markConversationRead = useCallback(async (id) => {
        const key = String(id);
        setSessions((current) =>
            current.map((session) =>
                String(session.id) === key
                    ? { ...session, unread: false }
                    : session,
            ),
        );
        try {
            await agentConversationService.markRead(key, {
                _silent: true,
                dedupe: false,
            });
            return true;
        } catch {
            return false;
        }
    }, []);

    /** 置顶/取消置顶：先乐观更新列表分组，失败回滚并把错误交给调用方提示。 */
    const setConversationPinned = useCallback(async (id, pinned) => {
        const key = String(id);
        const apply = (value) =>
            setSessions((current) =>
                current.map((session) =>
                    String(session.id) === key
                        ? { ...session, isPinned: value }
                        : session,
                ),
            );
        apply(pinned ? 1 : 0);
        try {
            const updated = pinned
                ? await agentConversationService.pin(key, {
                      _silent: true,
                      dedupe: false,
                  })
                : await agentConversationService.unpin(key, {
                      _silent: true,
                      dedupe: false,
                  });
            if (updated?.id != null) {
                setSessions((current) =>
                    current.map((session) =>
                        String(session.id) === key
                            ? { ...session, ...updated }
                            : session,
                    ),
                );
            }
            return true;
        } catch (error) {
            apply(pinned ? 0 : 1);
            throw error;
        }
    }, []);

    /** 一轮开始时先本地置为 running：离开该会话后列表仍能显示执行状态。 */
    const markSessionRunning = useCallback((id) => {
        const key = String(id);
        setSessions((current) =>
            current.map((session) =>
                String(session.id) === key
                    ? {
                          ...session,
                          status: "running",
                          unread: false,
                          updatedAt: new Date().toISOString(),
                      }
                    : session,
            ),
        );
    }, []);

    useEffect(() => {
        loadSessions();
        return () => {
            sessionsControllerRef.current?.abort();
            sessionsMoreControllerRef.current?.abort();
        };
    }, [loadSessions]);

    // 有会话在执行时轮询列表：离开该会话后仍能看到转圈变蓝点；全部收口后自动停。
    const hasRunningSession = sessions.some(
        (session) => session.status === "running",
    );
    useEffect(() => {
        if (!hasRunningSession) return undefined;
        const refresh = () => {
            if (document.visibilityState !== "hidden")
                loadSessions({ quiet: true });
        };
        const timer = window.setInterval(refresh, SESSIONS_POLL_INTERVAL_MS);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [hasRunningSession, loadSessions]);

    return {
        sessions,
        sessionsLoading,
        sessionsHasMore,
        sessionsLoadingMore,
        sessionsLoadError,
        sessionsLoadMoreError,
        loadSessions,
        loadMoreSessions,
        prependSession,
        markConversationRead,
        setConversationPinned,
        markSessionRunning,
    };
};
