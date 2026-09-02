/**
 * 博客智能体对话 API 封装
 * Agent conversation API wrapper
 */
import { delete as del, get, post, postStream, getStream, upload } from "@api";

const BASE = "/api/agent/conversations";

export const agentConversationService = {
    /** 用首条消息确定标题并创建会话壳；消息随后经 /messages/stream 执行。 */
    create: (content, config) =>
        post(BASE, { content }, { dedupe: false, ...config }),
    /** 上传一个待随消息发送的图片或文档。 */
    uploadAttachment: (file, onProgress, config) =>
        upload(`${BASE}/attachments`, file, {
            onProgress,
            config: { _silent: true, ...config },
        }),
    /** 会话列表 */
    list: (config) => get(BASE, undefined, config),
    /** 会话详情，返回 { conversation, messages } */
    get: (id, config) => get(`${BASE}/${id}`, undefined, config),
    /** 消息列表 */
    getMessages: (id, config) =>
        get(`${BASE}/${id}/messages`, undefined, config),
    /**
     * 发送消息并消费流式事件（一轮 agent loop）。
     *
     * deepThinking 打开时后端才允许为"把计划做完"多花自检轮次：更完整但更慢，
     * 所以由用户在输入框自己选，默认关闭。
     */
    sendMessageStream: (id, content, attachments, onEvent, config, deepThinking = false) =>
        postStream(
            `${BASE}/${id}/messages/stream`,
            { content, attachments, deepThinking },
            { onEvent, ...config },
        ),
    /** 请求停止当前正在执行的一轮 */
    cancel: (id, config) => post(`${BASE}/${id}/cancel`, undefined, config),
    /** 上报已读：清掉列表上的“生成完成”提醒，不改变会话排序时间 */
    markRead: (id, config) => post(`${BASE}/${id}/read`, undefined, config),
    /** 置顶会话 */
    pin: (id, config) => post(`${BASE}/${id}/pin`, undefined, config),
    /** 取消置顶 */
    unpin: (id, config) => del(`${BASE}/${id}/pin`, undefined, config),
    /** 订阅可续传事件流（断线恢复用），支持 Last-Event-ID 游标 */
    subscribeEvents: (id, afterEventId, onEvent, config) =>
        getStream(`${BASE}/${id}/events`, {
            ...config,
            onEvent,
            params: afterEventId
                ? { ...config?.params, afterEventId }
                : config?.params,
            headers: afterEventId
                ? { ...config?.headers, "Last-Event-ID": String(afterEventId) }
                : config?.headers,
        }),
};

/** 把后端消息体解析为渲染友好的对象，供页面直接使用 */
export const parseToolPayload = (content) => {
    if (!content) return null;
    try {
        return JSON.parse(content);
    } catch {
        return null;
    }
};
