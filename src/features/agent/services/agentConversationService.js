/**
 * 博客智能体对话 API 封装
 * Agent conversation API wrapper
 */
import { get, post, postStream, getStream } from '@api';

const BASE = '/api/agent/conversations';

export const agentConversationService = {
  /** 新建会话，返回 { conversation, messages } */
  create: (content, config) => post(BASE, { content }, config),
  /** 会话列表 */
  list: (config) => get(BASE, undefined, config),
  /** 会话详情，返回 { conversation, messages } */
  get: (id, config) => get(`${BASE}/${id}`, undefined, config),
  /** 消息列表 */
  getMessages: (id, config) => get(`${BASE}/${id}/messages`, undefined, config),
  /** 发送消息并消费流式事件（一轮 agent loop） */
  sendMessageStream: (id, content, onEvent, config) =>
    postStream(`${BASE}/${id}/messages/stream`, { content }, { onEvent, ...config }),
  /** 订阅可续传事件流（断线恢复用），支持 Last-Event-ID 游标 */
  subscribeEvents: (id, afterEventId, onEvent, config) =>
    getStream(`${BASE}/${id}/events`, {
      ...config,
      onEvent,
      params: afterEventId ? { ...config?.params, afterEventId } : config?.params,
      headers: afterEventId
        ? { ...config?.headers, 'Last-Event-ID': String(afterEventId) }
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