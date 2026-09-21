import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { agentConversationService } from "../services/agentConversationService";
import {
    abortableDelay,
    asId,
    collapsePlanUpdates,
    isAbortError,
    normalizeRunVersion,
    readDeepThinkingPreference,
    restorePlanMessage,
    saveDeepThinkingPreference,
    toolTraceKey,
} from "../utils/conversationState";
import { useAgentSessions } from "./useAgentSessions";

const LIVE_STEP_LIMIT = 100;
const MAX_RECONNECT_DELAY_MS = 5000;
/**
 * Dindor 对话状态：服务端快照是事实来源，SSE 仅负责增量反馈与断线续传。
 */
export const useAgentConversation = ({ conversationId }) => {
    const { t } = useTranslation();
    const routeConversationId = asId(conversationId);
    const {
        sessions,
        sessionsLoading,
        loadSessions,
        prependSession,
        markConversationRead,
        setConversationPinned,
        markSessionRunning,
    } = useAgentSessions();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(Boolean(routeConversationId));
    const [creating, setCreating] = useState(false);
    const [running, setRunning] = useState(false);
    const [approvals, setApprovals] = useState([]);
    const [decidingApprovalId, setDecidingApprovalId] = useState(null);
    const [liveSteps, setLiveSteps] = useState([]);
    const [reconnecting, setReconnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    // 深度思考是使用习惯而不是会话状态，所以记在本地、跨会话与刷新都保持。
    const [deepThinking, setDeepThinkingState] = useState(
        readDeepThinkingPreference,
    );

    const activeIdRef = useRef(routeConversationId);
    const cursorRef = useRef(0);
    const runVersionRef = useRef(null);
    const streamEpochRef = useRef(0);
    const routeControllerRef = useRef(null);
    const turnControllerRef = useRef(null);
    const createControllerRef = useRef(null);
    const creatingRef = useRef(false);
    const runningRef = useRef(false);
    const pendingFirstMessageRef = useRef(null);
    const readReportedRef = useRef(new Set());
    const answerDeltaRef = useRef("");
    const toolDeltaRef = useRef(new Map());
    const streamFrameRef = useRef(null);
    const deepThinkingRef = useRef(deepThinking);

    /** 切换深度思考：写回本地偏好，让下一轮请求带上新的选择。 */
    const setDeepThinking = useCallback((next) => {
        const value =
            typeof next === "function"
                ? Boolean(next(deepThinkingRef.current))
                : Boolean(next);
        deepThinkingRef.current = value;
        saveDeepThinkingPreference(value);
        setDeepThinkingState(value);
    }, []);

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
            toolDrafts.forEach((draft) => {
                upsert(
                    (step) =>
                        step.type === "tool_delta" &&
                        step.traceKey === draft.traceKey,
                    {
                        type: "tool_delta",
                        traceKey: draft.traceKey,
                        tool: draft.tool,
                        invocationId: draft.invocationId,
                        content: draft.content,
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
                // 入参要留住：它是"这一步到底做了什么"唯一的证据，收口后仍要能展开回看。
                pushStep({
                    type: "tool",
                    traceKey: toolTraceKey(data),
                    tool: data?.tool,
                    invocationId: data?.invocationId,
                    phase: "start",
                    args: data?.args,
                });
            } else if (event === "tool_progress") {
                const rawMessage = String(data?.message ?? "");
                const separator = rawMessage.indexOf("|");
                pushStep({
                    type: "tool",
                    traceKey: toolTraceKey(data),
                    tool: data?.tool,
                    invocationId: data?.invocationId,
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
                const key = toolTraceKey(data);
                const draft = toolDeltaRef.current.get(key);
                toolDeltaRef.current.set(key, {
                    traceKey: key,
                    tool: data?.tool || draft?.tool || "tool",
                    invocationId: data?.invocationId ?? draft?.invocationId,
                    content: `${draft?.content || ""}${data?.delta || ""}`,
                });
                scheduleDeltaFlush();
            } else if (event === "tool_end" || event === "tool_error") {
                const key = toolTraceKey(data);
                const tool = data?.tool || "tool";
                toolDeltaRef.current.delete(key);
                setLiveSteps((current) =>
                    current.filter(
                        (step) =>
                            !(
                                step.type === "tool_delta" &&
                                step.traceKey === key
                            ),
                    ),
                );
                pushStep({
                    type: "tool",
                    traceKey: key,
                    tool,
                    invocationId: data?.invocationId,
                    phase: event === "tool_end" ? "end" : "error",
                    result: data?.result,
                    error: data?.error,
                });
            } else if (event === "approval_required") {
                answerDeltaRef.current = "";
                updateRunning(false);
                setConversation((current) =>
                    current
                        ? { ...current, status: "awaiting_approval" }
                        : current,
                );
                pushStep({ type: "approval", approval: data });
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
            } else if (event === "artifact") {
                // 代码是这一轮真正的产出：交付卡一到就插进时间线，不等收口后的快照刷新。
                // 同一张卡改了一版就地替换，免得时间线上并排堆两份源码。
                setLiveSteps((current) => {
                    const step = { type: "artifact", payload: data };
                    const index = current.findIndex(
                        (entry) =>
                            entry.type === "artifact" &&
                            entry.payload?.id === data?.id,
                    );
                    if (index < 0)
                        return [...current, step].slice(-LIVE_STEP_LIMIT);
                    const next = [...current];
                    next[index] = step;
                    return next;
                });
            } else if (event === "quiz") {
                // 答题卡是用户接下来要动手点的界面：一到就插进时间线，不等收口后的快照刷新
                // （与 artifact 同一套处理，否则卡片会迟到一步才出现）。
                setLiveSteps((current) => {
                    const step = { type: "quiz", payload: data };
                    const index = current.findIndex(
                        (entry) =>
                            entry.type === "quiz" &&
                            entry.payload?.id === data?.id,
                    );
                    if (index < 0)
                        return [...current, step].slice(-LIVE_STEP_LIMIT);
                    const next = [...current];
                    next[index] = step;
                    return next;
                });
            } else if (event === "error") {
                const message =
                    typeof data === "string"
                        ? data
                        : data?.message || t("blog.agentChat.failed");
                setErrorMessage(message);
                pushStep({ type: "error", message });
            }
        },
        [
            isCurrent,
            pushStep,
            rememberEvent,
            scheduleDeltaFlush,
            t,
            updateRunning,
        ],
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
            setMessages(
                collapsePlanUpdates(
                    restorePlanMessage(detail.messages, snapshot),
                ),
            );
            const status = snapshot?.status;
            if (status === "running") {
                updateRunning(true);
            } else if (
                status === "ready" ||
                status === "failed" ||
                status === "awaiting_approval"
            ) {
                updateRunning(false);
            }
            if (status === "failed") {
                setErrorMessage(
                    snapshot?.errorMessage || t("blog.agentChat.failed"),
                );
            } else if (
                status === "ready" ||
                status === "awaiting_approval" ||
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

    const loadApprovals = useCallback(
        async (id, signal) => {
            const items = await agentConversationService.listApprovals(id, {
                _silent: true,
                dedupe: false,
                signal,
            });
            if (isCurrent(id)) {
                setApprovals(
                    Array.isArray(items)
                        ? items.filter(
                              (approval) => approval?.status === "PENDING",
                          )
                        : [],
                );
            }
            return items;
        },
        [isCurrent],
    );

    useEffect(() => {
        const id = conversation?.id;
        if (!id || conversation?.status !== "awaiting_approval") {
            setApprovals([]);
            return undefined;
        }
        const controller = new AbortController();
        loadApprovals(id, controller.signal).catch((error) => {
            if (!controller.signal.aborted && isCurrent(id)) {
                setErrorMessage(
                    error.message || t("blog.agentChat.loadFailed"),
                );
            }
        });
        return () => controller.abort();
    }, [conversation?.id, conversation?.status, isCurrent, loadApprovals, t]);

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
            {
                displayUserMessage = true,
                attachments = [],
                deepThinking: deepThinkingOverride,
            } = {},
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
                        deepThinkingOverride ?? deepThinkingRef.current,
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

    const decideApproval = useCallback(
        async (approvalId, approved, reason = "") => {
            const id = activeIdRef.current;
            if (!id || !approvalId || decidingApprovalId != null) return null;
            setDecidingApprovalId(approvalId);
            try {
                const decision = await agentConversationService.decideApproval(
                    id,
                    approvalId,
                    approved,
                    reason,
                    { _silent: true, dedupe: false },
                );
                const detail = await agentConversationService.get(id, {
                    _silent: true,
                    dedupe: false,
                });
                applySnapshot(id, detail);
                await loadSessions();
                if (
                    approved &&
                    detail?.conversation?.status === "running" &&
                    routeControllerRef.current &&
                    !routeControllerRef.current.signal.aborted
                ) {
                    updateRunning(true);
                    void recoverConversation(
                        id,
                        routeControllerRef.current.signal,
                        detail,
                    );
                }
                return decision;
            } finally {
                setDecidingApprovalId(null);
            }
        },
        [
            applySnapshot,
            decidingApprovalId,
            loadSessions,
            recoverConversation,
            updateRunning,
        ],
    );

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
                    prependSession(detail.conversation);
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
        [clearLiveState, prependSession, pushStep, t],
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

    useEffect(
        () => () => {
            streamEpochRef.current += 1;
            routeControllerRef.current?.abort();
            turnControllerRef.current?.abort();
            createControllerRef.current?.abort();
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
        approvals,
        decidingApprovalId,
        reconnecting,
        errorMessage,
        liveSteps,
        deepThinking,
        setDeepThinking,
        loadSessions,
        openConversation,
        sendMessage,
        cancelTurn,
        decideApproval,
        createConversation,
        setConversationPinned,
        markConversationRead,
        reset,
        refreshMessages,
    };
};

// Keep the historical import path stable while the pure formatters live outside the Hook.
export { toolCallSummary, compactToolResult } from "../utils/toolMessages";
