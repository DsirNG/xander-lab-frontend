/**
 * 工具轨迹归并：把"一次工具调用"还原成一个可渲染对象。
 *
 * <p>后端把同一次调用拆开存：入参落 tool_call、结果落 tool_result（两条消息）；
 * 流式阶段再拆成 tool_start / tool_progress / tool_delta / tool_end 四种事件。
 * 页面需要的是"这次调用做了什么、拿回了什么"，所以在渲染前先合回一条。</p>
 *
 * <p>图片工具例外：它有专门的图片渲染，入参没有阅读价值，这里原样放过由页面处理。</p>
 */
import { parseToolPayload } from "../services/agentConversationService";

export const IMAGE_TOOL = "image_generate";
/**
 * 代码交付工具：它的入参就是整份源码，结果就是交付卡本身。
 *
 * <p>成功时不再另开一张轨迹卡（同一份代码在页面上出现两次，还得展开才看得见），
 * 只有失败/被拒时才留下轨迹 —— 否则“交付失败”会变成一次静默，用户又回到
 * “它说做完了，我什么也没看见”。</p>
 */
export const ARTIFACT_TOOL = "emit_artifact";

/** 轨迹状态：running 执行中、done 成功、error 失败、cancelled 用户停止。 */
const resultStatus = (payload) => {
    if (payload?.cancelled) return "cancelled";
    if (payload?.ok === false || payload?.error) return "error";
    return "done";
};

const traceEntry = (id, tool) => ({
    id,
    kind: "trace",
    type: "trace",
    role: "tool",
    tool,
    args: null,
    result: null,
    output: "",
    stage: "",
    message: "",
    error: "",
    status: "running",
});

/**
 * 持久化消息：把 tool_call 与其后的 tool_result 合成一条 trace。
 *
 * 只归并同名工具最近一次未收口的调用；历史数据里孤立的 tool_result 单独成卡，
 * 不因为找不到入参就把结果丢掉。
 */
export const mergeToolTraces = (messages = []) => {
    const merged = [];
    const openByTool = new Map();

    for (const message of messages) {
        const kind = message?.kind;
        if (kind !== "tool_call" && kind !== "tool_result") {
            merged.push(message);
            continue;
        }

        const payload = parseToolPayload(message.content) || {};
        const tool = payload.tool || message.toolName || "";

        if (tool === IMAGE_TOOL) {
            // 图片调用交给页面的图片分支，入参不展示。
            if (kind === "tool_result") merged.push(message);
            continue;
        }

        if (tool === ARTIFACT_TOOL) {
            // 交付卡自己就是这次调用的展示物；只有失败才需要一张轨迹卡说明原因。
            if (kind === "tool_result" && resultStatus(payload) !== "done") {
                merged.push({
                    ...traceEntry(message.id, tool),
                    result: payload,
                    status: resultStatus(payload),
                });
            }
            continue;
        }

        if (kind === "tool_call") {
            openByTool.set(tool, merged.length);
            merged.push({
                ...traceEntry(message.id, tool),
                args: payload.args ?? null,
            });
            continue;
        }

        const index = openByTool.get(tool);
        const outcome = { result: payload, status: resultStatus(payload) };
        if (index == null || merged[index]?.kind !== "trace") {
            merged.push({ ...traceEntry(message.id, tool), ...outcome });
            continue;
        }
        merged[index] = { ...merged[index], ...outcome };
        openByTool.delete(tool);
    }

    return merged;
};

const applyLiveStep = (base, step) => {
    if (step.type === "tool_delta") {
        return { ...base, output: step.content ?? "" };
    }
    if (step.phase === "start") {
        return { ...base, args: step.args ?? base.args, status: "running" };
    }
    if (step.phase === "progress") {
        return {
            ...base,
            status: "running",
            stage: step.stage ?? "",
            message: step.message ?? "",
        };
    }
    if (step.phase === "end") {
        return {
            ...base,
            result: step.result ?? null,
            status: resultStatus(step.result),
        };
    }
    // phase === "error"
    return {
        ...base,
        error: step.error ?? "",
        status: step.cancelled ? "cancelled" : "error",
    };
};

/**
 * 流式步骤：把同一个工具的 tool / tool_delta 事件合成一条 trace，
 * 位置取该工具第一次出现的位置，避免卡片在时间线上跳动。
 */
export const mergeLiveTraces = (steps = []) => {
    const merged = [];
    const openByTool = new Map();

    steps.forEach((step, index) => {
        if (step?.type !== "tool" && step?.type !== "tool_delta") {
            merged.push(step);
            return;
        }
        const tool = step.tool || "";
        if (tool === IMAGE_TOOL) {
            merged.push(step);
            return;
        }
        if (tool === ARTIFACT_TOOL) {
            // 同上：成功交付不留轨迹卡，失败才留，且不必等 tool_call 先建卡。
            if (step.phase === "error" || (step.phase === "end" && resultStatus(step.result) !== "done")) {
                merged.push(
                    applyLiveStep(traceEntry(`live-trace-${index}`, tool), step),
                );
            }
            return;
        }
        const slot = openByTool.get(tool);
        if (slot == null) {
            openByTool.set(tool, merged.length);
            merged.push(applyLiveStep(traceEntry(`live-trace-${index}`, tool), step));
            return;
        }
        merged[slot] = applyLiveStep(merged[slot], step);
    });

    return merged;
};

/** 详情里展示的载荷文本：对象转缩进 JSON，字符串原样，过长截断。 */
export const formatTracePayload = (value, maxChars = 4000) => {
    if (value == null || value === "") return "";
    const text =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars)}\n…（已截断，共 ${text.length} 字符）`;
};
