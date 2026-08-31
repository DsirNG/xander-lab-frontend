import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    agentConversationService,
    parseToolPayload,
} from "../services/agentConversationService";

const LIVE_STEP_LIMIT = 100;
const MAX_RECONNECT_DELAY_MS = 5000;
/** 后台会话状态只能从列表快照得知，有会话在执行时才轮询，全部收口后自动停止。 */
const SESSIONS_POLL_INTERVAL_MS = 5000;

const asId = (value) => (value == null ? null : String(value));
const normalizeRunVersion = (value) => String(value ?? 0);
const isAbortError = (error) =>
    Boolean(
        error?.name === "AbortError" ||
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED" ||
        error?.isCancelled,
    );

const abortableDelay = (delay, signal) =>
    new Promise((resolve, reject) => {
        const rejectAborted = () =>
            reject(new DOMException("Aborted", "AbortError"));
        if (signal?.aborted) {
            rejectAborted();
            return;
        }

        let timer;
        const cleanup = () => signal?.removeEventListener("abort", handleAbort);
        const handleResolve = () => {
            cleanup();
            resolve();
        };
        const handleAbort = () => {
            window.clearTimeout(timer);
            cleanup();
            rejectAborted();
        };
        timer = window.setTimeout(handleResolve, delay);
        signal?.addEventListener("abort", handleAbort, { once: true });
    });

/**
 * Dindor 对话状态：服务端快照是事实来源，SSE 仅负责增量反馈与断线续传。
 */
export const useAgentConversation = ({ conversationId }) => {
    const { t } = useTranslation();
    const routeConversationId = asId(conversationId);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(Boolean(routeConversationId));
    const [creating, setCreating] = useState(false);
    const [running, setRunning] = useState(false);
    const [liveSteps, setLiveSteps] = useState([]);
    const [reconnecting, setReconnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const activeIdRef = useRef(routeConversationId);
    const cursorRef = useRef(0);
    const runVersionRef = useRef(null);
    const streamEpochRef = useRef(0);
    const routeControllerRef = useRef(null);
    const turnControllerRef = useRef(null);
    const createControllerRef = useRef(null);
    const sessionsControllerRef = useRef(null);
    const sessionsRequestRef = useRef(0);
    const creatingRef = useRef(false);
    const runningRef = useRef(false);
    const pendingFirstMessageRef = useRef(null);
    const readReportedRef = useRef(new Set());
    const answerDeltaRef = useRef("");
    const toolDeltaRef = useRef(new Map());
    const streamFrameRef = useRef(null);

    // Update before effects run so late responses from the previous route are ignored
    // during the very first render after a conversation navigation.
    activeIdRef.current = routeConversationId;

    const isCurrent = useCallback((id) => activeIdRef.current === asId(id), []);

    const updateRunning = useCallback((value) => {
        runningRef.current = value;
        setRunning(value);
    }, []);

    const flushBufferedDeltas = useCallback(() => {
        streamFrameRef.current = null;
        const answer = answerDeltaRef.current;
        const toolDrafts = new Map(toolDeltaRef.current);
        setLiveSteps((current) => {
            let next = current;
            const upsert = (predicate, value) => {
                const index = next.findIndex(predicate);
                if (index < 0) next = [...next, value];
                else {
                    next = [...next];
                    next[index] = value;
                }
            };
            if (answer) {
                upsert((step) => step.type === "answer_delta", {
                    type: "answer_delta",
                    content: answer,
                });
            }
            toolDrafts.forEach((content, tool) => {
                upsert(
                    (step) => step.type === "tool_delta" && step.tool === tool,
                    {
                        type: "tool_delta",
                        tool,
                        content,
                    },
                );
            });
            return next.slice(-LIVE_STEP_LIMIT);
        });
    }, []);

    const scheduleDeltaFlush = useCallback(() => {
        if (streamFrameRef.current == null) {
            streamFrameRef.current =
                window.requestAnimationFrame(flushBufferedDeltas);
        }
    }, [flushBufferedDeltas]);

    const clearLiveState = useCallback(() => {
        if (streamFrameRef.current != null) {
            window.cancelAnimationFrame(streamFrameRef.current);
            streamFrameRef.current = null;
        }
        answerDeltaRef.current = "";
        toolDeltaRef.current.clear();
        setLiveSteps([]);
    }, []);

    const pushStep = useCallback((step) => {
        setLiveSteps((current) => [
            ...current.slice(-(LIVE_STEP_LIMIT - 1)),
            step,
        ]);
    }, []);

    const rememberEvent = useCallback((rawId) => {
        if (rawId == null || rawId === "") return true;
        const eventId = Number(rawId);
        if (!Number.isSafeInteger(eventId) || eventId <= 0) return true;
        if (eventId <= cursorRef.current) return false;
        cursorRef.current = eventId;
        return true;
    }, []);

    const applyEvent = useCallback(
        (sourceId, sourceEpoch, { id, event, data }) => {
            if (
                !isCurrent(sourceId) ||
                streamEpochRef.current !== sourceEpoch ||
                !rememberEvent(id)
            )
                return;

            if (event === "thought") {
                pushStep({ type: "thought", content: String(data ?? "") });
            } else if (event === "tool_start") {
                pushStep({ type: "tool", tool: data?.tool, phase: "start" });
            } else if (event === "tool_progress") {
                const rawMessage = String(data?.message ?? "");
                const separator = rawMessage.indexOf("|");
                pushStep({
                    type: "tool",
                    tool: data?.tool,
                    phase: "progress",
                    stage:
                        data?.stage ||
                        (separator >= 0
                            ? rawMessage.slice(0, separator)
                            : undefined),
                    message:
                        separator >= 0
                            ? rawMessage.slice(separator + 1)
                            : rawMessage,
                });
            } else if (event === "tool_delta") {
                const tool = data?.tool || "tool";
                toolDeltaRef.current.set(
                    tool,
                    `${toolDeltaRef.current.get(tool) || ""}${data?.delta || ""}`,
                );
                scheduleDeltaFlush();
            } else if (event === "tool_end" || event === "tool_error") {
                const tool = data?.tool || "tool";
                toolDeltaRef.current.delete(tool);
                setLiveSteps((current) =>
                    current.filter(
                        (step) =>
                            !(step.type === "tool_delta" && step.tool === tool),
                    ),
                );
                pushStep({
                    type: "tool",
                    tool,
                    phase: event === "tool_end" ? "end" : "error",
                    result: data?.result,
                    error: data?.error,
                });
            } else if (event === "answer_delta") {
                answerDeltaRef.current += String(data ?? "");
                scheduleDeltaFlush();
            } else if (event === "answer") {
                answerDeltaRef.current = "";
                setLiveSteps((current) =>
                    [
                        ...current.filter(
                            (step) => step.type !== "answer_delta",
                        ),
                        { type: "answer", content: String(data ?? "") },
                    ].slice(-LIVE_STEP_LIMIT),
                );
            } else if (event === "plan") {
                const items = Array.isArray(data?.items) ? data.items : [];
                // 计划是会话状态而不是流水日志：整体替换已渲染的那一条，避免每次改写都堆一份旧计划。
                setLiveSteps((current) => {
                    const step = { type: "plan", items };
                    const index = current.findIndex(
                        (entry) => entry.type === "plan",
                    );
                    if (index < 0)
                        return [...current, step].slice(-LIVE_STEP_LIMIT);
                    const next = [...current];
                    next[index] = step;
                    return next;
                });
            } else if (event === "reflection") {
                // 自检驳回时用户已经看到了流式回复草稿；先撤掉它，否则会同时出现“已完成”和批评意见。
                answerDeltaRef.current = "";
                setLiveSteps((current) =>
                    [
                        ...current.filter(
                            (step) => step.type !== "answer_delta",
                        ),
                        {
                            type: "reflection",
                            round: data?.round,
                            content: String(data?.critique ?? ""),
                        },
                    ].slice(-LIVE_STEP_LIMIT),
                );
            } else if (event === "error") {
                const message =
                    typeof data === "string"
                        ? data
                        : data?.message || t("blog.agentChat.failed");
                setErrorMessage(message);
                pushStep({ type: "error", message });
            }
        },
        [isCurrent, pushStep, rememberEvent, scheduleDeltaFlush, t],
    );

    const beginRunGeneration = useCallback(
        (runVersion = null, { clearLive = true } = {}) => {
            streamEpochRef.current += 1;
            cursorRef.current = 0;
            runVersionRef.current = runVersion;
            if (clearLive) clearLiveState();
            setErrorMessage(null);
        },
        [clearLiveState],
    );

    const applySnapshot = useCallback(
        (id, detail, { clearLive = false } = {}) => {
            if (!isCurrent(id) || !detail) return null;
            const snapshot = detail.conversation ?? null;
            const nextRunVersion = snapshot
                ? normalizeRunVersion(snapshot.runVersion)
                : null;
            const runChanged =
                runVersionRef.current !== null &&
                nextRunVersion !== null &&
                runVersionRef.current !== nextRunVersion;
            if (runChanged)
                beginRunGeneration(nextRunVersion, { clearLive: false });
            if (nextRunVersion !== null) runVersionRef.current = nextRunVersion;

            setConversation(snapshot);
            setMessages(Array.isArray(detail.messages) ? detail.messages : []);
            const status = snapshot?.status;
            if (status === "running") {
                updateRunning(true);
            } else if (status === "ready" || status === "failed") {
                updateRunning(false);
            }
            if (status === "failed") {
                setErrorMessage(
                    snapshot?.errorMessage || t("blog.agentChat.failed"),
                );
            } else if (
                status === "ready" ||
                (status === "running" && runChanged)
            ) {
                setErrorMessage(null);
            }
            if (clearLive && !runChanged) clearLiveState();
            return { runChanged, runVersion: nextRunVersion, status };
        },
        [beginRunGeneration, clearLiveState, isCurrent, t, updateRunning],
    );

    const refreshAfterClientError = useCallback(
        async (id, signal, fallbackMessage) => {
            try {
                const detail = await agentConversationService.get(id, {
                    _silent: true,
                    dedupe: false,
                    signal,
                });
                const result = applySnapshot(id, detail, {
                    clearLive: detail?.conversation?.status !== "running",
                });
                if (result?.status === "ready" || result?.status === "failed") {
                    setReconnecting(false);
                }
            } catch (error) {
                if (signal.aborted || isAbortError(error) || !isCurrent(id))
                    return;
                setErrorMessage(error.message || fallbackMessage);
                setReconnecting(false);
            }
        },
        [applySnapshot, isCurrent],
    );

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

    /** 上报已读：把列表上的“生成完成”蓝点去掉，失败不打断对话，下次打开会重试。 */
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

    /** 一轮开始时先本地置为 running：即使离开该会话，列表也会转圈并触发轮询。 */
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

    const refreshMessages = useCallback(
        async (id, config = {}) => {
            const detail = await agentConversationService.get(id, {
                _silent: true,
                ...config,
            });
            applySnapshot(id, detail, {
                clearLive: detail?.conversation?.status !== "running",
            });
            return detail;
        },
        [applySnapshot],
    );

    /** Reconnect until the durable snapshot reaches ready/failed or the route changes. */
    const recoverConversation = useCallback(
        async (id, signal, initialDetail = null) => {
            let detail = initialDetail;
            let reconnectAttempt = 0;

            while (!signal.aborted && isCurrent(id)) {
                try {
                    detail =
                        detail ||
                        (await agentConversationService.get(id, {
                            _silent: true,
                            dedupe: false,
                            signal,
                        }));
                    const snapshotResult = applySnapshot(id, detail);
                    if (!snapshotResult || signal.aborted || !isCurrent(id))
                        return;
                    if (
                        snapshotResult.status === "ready" ||
                        snapshotResult.status === "failed"
                    ) {
                        clearLiveState();
                        setReconnecting(false);
                        return;
                    }
                    if (snapshotResult.status !== "running") return;

                    updateRunning(true);
                    setReconnecting(reconnectAttempt > 0);
                    const subscribedRunVersion = snapshotResult.runVersion;
                    const streamEpoch = ++streamEpochRef.current;
                    try {
                        await agentConversationService.subscribeEvents(
                            id,
                            cursorRef.current || undefined,
                            (payload) => applyEvent(id, streamEpoch, payload),
                            { _silent: true, signal },
                        );
                    } finally {
                        if (streamEpochRef.current === streamEpoch)
                            streamEpochRef.current += 1;
                    }

                    if (signal.aborted || !isCurrent(id)) return;
                    detail = await agentConversationService.get(id, {
                        _silent: true,
                        dedupe: false,
                        signal,
                    });
                    const latestSnapshot = applySnapshot(id, detail);
                    if (!latestSnapshot || signal.aborted || !isCurrent(id))
                        return;
                    if (
                        latestSnapshot.status === "ready" ||
                        latestSnapshot.status === "failed"
                    ) {
                        clearLiveState();
                        setReconnecting(false);
                        return;
                    }
                    if (latestSnapshot.status !== "running") return;
                    if (
                        latestSnapshot.runChanged ||
                        latestSnapshot.runVersion !== subscribedRunVersion
                    ) {
                        reconnectAttempt = 0;
                        continue;
                    }
                    reconnectAttempt += 1;
                } catch (error) {
                    if (signal.aborted || isAbortError(error) || !isCurrent(id))
                        return;
                    if (error?.status && error.status < 500) {
                        await refreshAfterClientError(
                            id,
                            signal,
                            error.message || t("blog.agentChat.loadFailed"),
                        );
                        return;
                    }
                    detail = null;
                    reconnectAttempt += 1;
                    setReconnecting(true);
                }

                const delay = Math.min(
                    500 * 2 ** Math.max(0, reconnectAttempt - 1),
                    MAX_RECONNECT_DELAY_MS,
                );
                try {
                    await abortableDelay(delay, signal);
                } catch {
                    return;
                }
            }
        },
        [
            applyEvent,
            applySnapshot,
            clearLiveState,
            isCurrent,
            refreshAfterClientError,
            t,
            updateRunning,
        ],
    );

    const openConversation = useCallback(
        async (id, signal) => {
            try {
                const detail = await agentConversationService.get(id, {
                    _silent: true,
                    dedupe: false,
                    signal,
                });
                const snapshotResult = applySnapshot(id, detail);
                if (!snapshotResult || signal.aborted || !isCurrent(id)) return;
                setLoading(false);
                if (detail?.conversation?.status === "running") {
                    await recoverConversation(id, signal, detail);
                    if (!signal.aborted && isCurrent(id)) await loadSessions();
                } else {
                    clearLiveState();
                }
            } catch (error) {
                if (!signal.aborted && !isAbortError(error) && isCurrent(id)) {
                    setErrorMessage(
                        error.message || t("blog.agentChat.loadFailed"),
                    );
                }
            } finally {
                if (!signal.aborted && isCurrent(id)) setLoading(false);
            }
        },
        [
            applySnapshot,
            clearLiveState,
            isCurrent,
            loadSessions,
            recoverConversation,
            t,
        ],
    );

    /** Send subsequent turns. New conversations are started by create() on the server. */
    const sendMessage = useCallback(
        async (
            content,
            { displayUserMessage = true, attachments = [] } = {},
        ) => {
            const id = activeIdRef.current;
            const text = content?.trim();
            if (!id || !text || runningRef.current || creatingRef.current)
                return false;

            turnControllerRef.current?.abort();
            const controller = new AbortController();
            turnControllerRef.current = controller;
            beginRunGeneration(null, { clearLive: displayUserMessage });
            updateRunning(true);
            setConversation((current) =>
                current ? { ...current, status: "running" } : current,
            );
            markSessionRunning(id);
            if (displayUserMessage) {
                pushStep({
                    type: "user",
                    content: text,
                    ...(attachments.length > 0 ? { attachments } : {}),
                });
            }

            try {
                const streamEpoch = ++streamEpochRef.current;
                try {
                    await agentConversationService.sendMessageStream(
                        id,
                        text,
                        attachments,
                        (payload) => applyEvent(id, streamEpoch, payload),
                        { _silent: true, signal: controller.signal },
                    );
                } finally {
                    if (streamEpochRef.current === streamEpoch)
                        streamEpochRef.current += 1;
                }
                if (!controller.signal.aborted && isCurrent(id)) {
                    await recoverConversation(id, controller.signal);
                    if (!controller.signal.aborted && isCurrent(id))
                        await loadSessions();
                }
                return true;
            } catch (error) {
                if (
                    controller.signal.aborted ||
                    isAbortError(error) ||
                    !isCurrent(id)
                )
                    return false;
                if (error?.status && error.status < 500) {
                    setErrorMessage(
                        error.message || t("blog.agentChat.sendFailed"),
                    );
                    await refreshAfterClientError(
                        id,
                        controller.signal,
                        error.message || t("blog.agentChat.sendFailed"),
                    );
                    return false;
                }
                setReconnecting(true);
                await recoverConversation(id, controller.signal);
                if (!controller.signal.aborted && isCurrent(id))
                    await loadSessions();
                return true;
            } finally {
                if (turnControllerRef.current === controller)
                    turnControllerRef.current = null;
            }
        },
        [
            applyEvent,
            beginRunGeneration,
            isCurrent,
            loadSessions,
            markSessionRunning,
            pushStep,
            recoverConversation,
            refreshAfterClientError,
            t,
            updateRunning,
        ],
    );

    const cancelTurn = useCallback(async () => {
        const id = activeIdRef.current;
        if (!id || !runningRef.current) return;
        const requestEpoch = streamEpochRef.current;
        try {
            await agentConversationService.cancel(id, {
                _silent: true,
                dedupe: false,
            });
        } catch (error) {
            if (
                isCurrent(id) &&
                streamEpochRef.current === requestEpoch &&
                !isAbortError(error)
            ) {
                setErrorMessage(error.message || t("blog.agentChat.failed"));
            }
        }
    }, [isCurrent, t]);

    /** 创建会话壳；首条消息在会话快照就绪后经 /messages/stream 发送，与后续轮次共用同一流式接口。 */
    const createConversation = useCallback(
        async (content, attachments = []) => {
            const text = content?.trim();
            if (!text) throw new Error(t("blog.agentChat.inputRequired"));
            if (creatingRef.current) return null;

            creatingRef.current = true;
            setCreating(true);
            setErrorMessage(null);

            createControllerRef.current?.abort();
            const controller = new AbortController();
            createControllerRef.current = controller;
            try {
                const detail = await agentConversationService.create(text, {
                    dedupe: false,
                    _silent: true,
                    signal: controller.signal,
                });
                const id = detail?.conversation?.id;
                if (id) {
                    pushStep({
                        type: "user",
                        content: text,
                        ...(attachments.length > 0 ? { attachments } : {}),
                    });
                    setSessions((current) => [
                        detail.conversation,
                        ...current.filter(
                            (session) => String(session.id) !== String(id),
                        ),
                    ]);
                    pendingFirstMessageRef.current = {
                        id: String(id),
                        text,
                        attachments,
                        detail,
                        routeInitialized: false,
                        sent: false,
                    };
                }
                return detail;
            } catch (error) {
                if (
                    !controller.signal.aborted &&
                    createControllerRef.current === controller &&
                    !isAbortError(error)
                ) {
                    setErrorMessage(
                        error.message || t("blog.agentChat.sendFailed"),
                    );
                    clearLiveState();
                }
                throw error;
            } finally {
                if (createControllerRef.current === controller) {
                    createControllerRef.current = null;
                    creatingRef.current = false;
                    setCreating(false);
                }
            }
        },
        [clearLiveState, pushStep, t],
    );

    const reset = useCallback(() => {
        beginRunGeneration();
        pendingFirstMessageRef.current = null;
        routeControllerRef.current?.abort();
        turnControllerRef.current?.abort();
        createControllerRef.current?.abort();
        setConversation(null);
        setMessages([]);
        setLoading(false);
        updateRunning(false);
        setReconnecting(false);
        setErrorMessage(null);
    }, [beginRunGeneration, updateRunning]);

    useEffect(() => {
        loadSessions();
        return () => sessionsControllerRef.current?.abort();
    }, [loadSessions]);

    useEffect(() => {
        const id = asId(conversationId);
        let pending = pendingFirstMessageRef.current;
        if (pending && pending.id !== id) {
            pendingFirstMessageRef.current = null;
            pending = null;
        }
        const isNewlyCreated = Boolean(id && pending?.id === id);

        // React StrictMode may replay this effect. Keep the optimistic conversation
        // intact and do not start a competing recovery request for the same shell.
        if (isNewlyCreated && pending.routeInitialized) return undefined;
        if (isNewlyCreated) pending.routeInitialized = true;

        beginRunGeneration(null, { clearLive: !isNewlyCreated });
        routeControllerRef.current?.abort();
        turnControllerRef.current?.abort();
        activeIdRef.current = id;
        setReconnecting(false);
        updateRunning(false);

        if (!id) {
            setConversation(null);
            setMessages([]);
            setLoading(false);
            return undefined;
        }

        // 切换会话时重置消息列表，触发即时骨架屏加载，消除响应滞后感。
        setConversation(null);
        if (isNewlyCreated && pending?.detail) {
            applySnapshot(id, pending.detail);
            setLoading(false);
            return undefined;
        }
        setMessages([]);
        setLoading(true);
        const controller = new AbortController();
        routeControllerRef.current = controller;
        openConversation(id, controller.signal);
        return () => {
            streamEpochRef.current += 1;
            controller.abort();
        };
    }, [
        applySnapshot,
        beginRunGeneration,
        conversationId,
        openConversation,
        updateRunning,
    ]);

    // 新会话首条消息在快照就绪后经 /messages/stream 发送，避免首轮走 /events 恢复而整体一次性出现。
    useEffect(() => {
        const pending = pendingFirstMessageRef.current;
        const convId = activeIdRef.current;
        if (!pending || pending.sent || !convId || loading || !conversation)
            return;
        if (pending.id !== convId || String(conversation.id) !== convId) return;
        if (conversation.status === "running") return;
        pending.sent = true;
        sendMessage(pending.text, {
            displayUserMessage: false,
            attachments: pending.attachments,
        });
    }, [loading, conversation, sendMessage]);

    // 已读时机：正在看的会话不在执行中（打开旧会话，或在本会话里看到这一轮收口）。
    useEffect(() => {
        const id = activeIdRef.current;
        if (!id || !conversation || String(conversation.id) !== id) return;
        if (conversation.status === "running" || !conversation.unread) return;
        const key = `${id}:${conversation.lastCompletedAt ?? ""}`;
        if (readReportedRef.current.has(key)) return;
        readReportedRef.current.add(key);
        setConversation((current) =>
            current && String(current.id) === id
                ? { ...current, unread: false }
                : current,
        );
        markConversationRead(id).then((ok) => {
            if (!ok) readReportedRef.current.delete(key);
        });
    }, [conversation, markConversationRead]);

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

    useEffect(
        () => () => {
            streamEpochRef.current += 1;
            routeControllerRef.current?.abort();
            turnControllerRef.current?.abort();
            createControllerRef.current?.abort();
            sessionsControllerRef.current?.abort();
            if (streamFrameRef.current != null)
                window.cancelAnimationFrame(streamFrameRef.current);
        },
        [],
    );

    return {
        sessions,
        sessionsLoading,
        conversation,
        messages,
        loading,
        creating,
        running,
        reconnecting,
        errorMessage,
        liveSteps,
        loadSessions,
        openConversation,
        sendMessage,
        cancelTurn,
        createConversation,
        setConversationPinned,
        markConversationRead,
        reset,
        refreshMessages,
    };
};

/** 历史 tool 消息渲染辅助：tool_call / tool_result 的展示文本。 */
export const toolCallSummary = (message, t) => {
    const payload = parseToolPayload(message?.content);
    const tool =
        payload?.tool || message?.toolName || t("blog.agentChat.unknownTool");
    return { tool, payload };
};

/** 工具结果截断为短摘要。 */
export const compactToolResult = (result) => {
    const text = typeof result === "string" ? result : JSON.stringify(result);
    if (!text || text.length <= 200) return text;
    return `${text.slice(0, 200)}…`;
};
