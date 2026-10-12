import { parseToolPayload } from "../services/agentConversationService";

const object = (value) =>
    typeof value === "string" ? parseToolPayload(value) : value;
const positiveId = (value) =>
    /^\d+$/.test(String(value)) && Number(value) > 0 ? String(value) : null;

/** Read actual durable and live tool outcomes; never infer work from answer text. */
export const workspaceOutputs = (messages = [], persisted = [], live = []) => {
    const results = [
        ...messages
            .filter((message) => message.kind === "tool_result")
            .map((message) => ({
                ...object(message.content),
                tool: object(message.content)?.tool || message.toolName,
            })),
        ...persisted.map((entry) => object(entry.dataContent)),
        ...live
            .filter((step) => step.type === "tool" && step.phase === "end")
            .map((step) => ({ tool: step.tool, result: step.result })),
    ];
    let article = null;
    const memories = new Map();
    const publications = new Map();
    for (const entry of results) {
        const result = object(entry?.result) || entry;
        if (!result) continue;
        if (
            entry.tool === "publish_post" &&
            result.ok !== false &&
            !result.error &&
            ["csdn", "juejin"].includes(result.platform) &&
            typeof result.externalId === "string" &&
            result.externalId
        ) {
            publications.set(`${result.platform}:${result.externalId}`, {
                ...result,
                ok: true,
            });
        }
        if (entry.tool === "publish_post" && result.ok === false) {
            publications.set(
                `failed:${entry.invocationId || result.error}`,
                result,
            );
        }
        if (result.ok !== true) continue;
        if (entry.tool === "blog_generate" && positiveId(result.taskId))
            article = { ...result, taskId: positiveId(result.taskId) };
        if (entry.tool === "recall_memory" && Array.isArray(result.items)) {
            for (const item of result.items) {
                if (
                    typeof item?.memoryKey === "string" &&
                    typeof item?.content === "string"
                )
                    memories.set(item.memoryKey, item);
            }
        }
        if (entry.tool === "remember") {
            if (result.action === "delete" && result.removed)
                memories.clear(); // delete responses do not identify the deleted key
            else if (result.memoryKey) memories.delete(result.memoryKey); // an old recalled snapshot is no longer current
        }
    }
    return {
        article,
        memories: [...memories.values()],
        publications: [...publications.values()],
    };
};
