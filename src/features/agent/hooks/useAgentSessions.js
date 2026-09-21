import { useCallback, useEffect, useRef, useState } from "react";
import { agentConversationService } from "../services/agentConversationService";
import { isAbortError } from "../utils/conversationState";

const SESSIONS_POLL_INTERVAL_MS = 5000;

/**
 * 会话列表的生命周期与当前会话流式状态无关：列表可以在离开当前会话后继续刷新，
 * 也负责已读、置顶和列表中的乐观状态。把它独立出来，避免主对话 Hook 同时管理两套状态机。
 */
export const useAgentSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const sessionsControllerRef = useRef(null);
    const sessionsRequestRef = useRef(0);

    /** quiet 用于轮询刷新：不闪列表骨架，失败也保留上一次的列表。 */
    const loadSessions = useCallback(async ({ quiet = false } = {}) => {
        const requestId = ++sessionsRequestRef.current;
        sessionsControllerRef.current?.abort();
        const controller = new AbortController();
        sessionsControllerRef.current = controller;
        if (!quiet) setSessionsLoading(true);
        try {
            const list = await agentConversationService.list({
                _silent: true,
                dedupe: false,
                signal: controller.signal,
            });
            if (requestId === sessionsRequestRef.current)
                setSessions(Array.isArray(list) ? list : []);
        } catch (error) {
            if (
                !quiet &&
                !isAbortError(error) &&
                requestId === sessionsRequestRef.current
            )
                setSessions([]);
        } finally {
            if (requestId === sessionsRequestRef.current)
                setSessionsLoading(false);
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
        return () => sessionsControllerRef.current?.abort();
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
        loadSessions,
        prependSession,
        markConversationRead,
        setConversationPinned,
        markSessionRunning,
    };
};
