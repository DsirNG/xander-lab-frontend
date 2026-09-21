import { parseToolPayload } from "../services/agentConversationService";

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
