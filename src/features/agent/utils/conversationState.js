const DEEP_THINKING_STORAGE_KEY = "agent.deepThinking";
const IMAGE_TOOL = "image_generate";

export const readDeepThinkingPreference = () => {
    try {
        return window.localStorage.getItem(DEEP_THINKING_STORAGE_KEY) === "1";
    } catch {
        return false;
    }
};

export const saveDeepThinkingPreference = (enabled) => {
    try {
        window.localStorage.setItem(
            DEEP_THINKING_STORAGE_KEY,
            enabled ? "1" : "0",
        );
    } catch {
        // 隐私模式下写不进去也不影响本次会话使用。
    }
};

export const asId = (value) => (value == null ? null : String(value));
export const normalizeRunVersion = (value) => String(value ?? 0);

/**
 * 一次工具调用的配对键，用来把 start/progress/delta/end 四条事件归到同一张卡上。
 *
 * 优先用后端给的 invocationId：并行批次里同一步可以出现两个同名工具。
 * 后端没有持久化身份时按工具名回退，保证同一次调用的事件仍能归并。
 */
export const toolTraceKey = (payload) =>
    payload?.invocationId || payload?.tool || "tool";

export const isAbortError = (error) =>
    Boolean(
        error?.name === "AbortError" ||
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED" ||
        error?.isCancelled,
    );

/** The backend stores a conversation plan as a JSON snapshot. */
export const parsePlanItems = (planJson) => {
    if (Array.isArray(planJson)) return planJson;
    if (typeof planJson !== "string" || !planJson.trim()) return [];
    try {
        const parsed = JSON.parse(planJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

/**
 * Plans created before plan messages were persisted still exist in planJson.
 * Reinsert those legacy plans after the task-introduction thought so they remain
 * part of the conversation timeline after a refresh.
 */
export const restorePlanMessage = (messages, conversation) => {
    const timeline = Array.isArray(messages) ? messages : [];
    if (timeline.some((message) => message.kind === "plan")) return timeline;
    const items = parsePlanItems(conversation?.planJson);
    if (items.length === 0) return timeline;

    const planMessage = {
        id: `plan-snapshot-${conversation?.id ?? "unknown"}`,
        role: "assistant",
        kind: "plan",
        content: JSON.stringify(items),
    };
    const thoughtIndex = timeline.findIndex(
        (message) => message.kind === "thought",
    );
    const userIndex = timeline.findIndex((message) => message.role === "user");
    const anchorIndex = thoughtIndex >= 0 ? thoughtIndex : userIndex;
    if (anchorIndex < 0) return [...timeline, planMessage];
    return [
        ...timeline.slice(0, anchorIndex + 1),
        planMessage,
        ...timeline.slice(anchorIndex + 1),
    ];
};

/** Older turns may contain one plan message per status update; retain one card per user turn. */
export const collapsePlanUpdates = (messages) => {
    const timeline = Array.isArray(messages) ? messages : [];
    const collapsed = [];
    let planIndex = -1;
    for (const message of timeline) {
        if (message.role === "user") planIndex = -1;
        if (message.kind !== "plan") {
            collapsed.push(message);
            continue;
        }
        if (planIndex < 0) {
            planIndex = collapsed.length;
            collapsed.push(message);
            continue;
        }
        // Keep the original timeline position, but render the latest status snapshot.
        collapsed[planIndex] = {
            ...collapsed[planIndex],
            content: message.content,
        };
    }
    return collapsed;
};

export const hasStreamingAnswer = (steps = []) =>
    steps.some(
        (step) => step.type === "answer" || step.type === "answer_delta",
    );

export const getActiveImageGeneration = (steps = []) => {
    let active = false;
    let message = "";

    steps.forEach((step) => {
        if (step.type !== "tool" || step.tool !== IMAGE_TOOL) return;
        if (step.phase === "start") {
            active = true;
            message = "";
        } else if (step.phase === "progress") {
            active = true;
            message = step.message || message;
        } else if (step.phase === "end" || step.phase === "error") {
            active = false;
        }
    });

    return active ? { message } : null;
};

export const abortableDelay = (delay, signal) =>
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
