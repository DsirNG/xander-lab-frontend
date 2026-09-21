import { useCallback, useEffect, useRef } from "react";
import { toolTraceKey } from "../utils/conversationState";

const LIVE_STEP_LIMIT = 100;

/**
 * Owns the transient SSE/live timeline state for an Agent conversation.
 * Durable conversation snapshots remain owned by useAgentConversation.
 */
export function useAgentConversationLive({
    t,
    isCurrent,
    setConversation,
    setErrorMessage,
    setLiveSteps,
    updateRunning,
}) {
    const cursorRef = useRef(0);
    const runVersionRef = useRef(null);
    const streamEpochRef = useRef(0);
    const answerDeltaRef = useRef("");
    const toolDeltaRef = useRef(new Map());
    const streamFrameRef = useRef(null);

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
    }, [setLiveSteps]);

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
    }, [setLiveSteps]);

    const pushStep = useCallback(
        (step) => {
            setLiveSteps((current) => [
                ...current.slice(-(LIVE_STEP_LIMIT - 1)),
                step,
            ]);
        },
        [setLiveSteps],
    );

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
            setConversation,
            setErrorMessage,
            setLiveSteps,
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
        [clearLiveState, setErrorMessage],
    );

    useEffect(
        () => () => {
            streamEpochRef.current += 1;
            if (streamFrameRef.current != null) {
                window.cancelAnimationFrame(streamFrameRef.current);
            }
        },
        [],
    );

    return {
        applyEvent,
        beginRunGeneration,
        clearLiveState,
        cursorRef,
        pushStep,
        runVersionRef,
        streamEpochRef,
    };
}
