import { request } from './http'

export type ConversationStatus = 'ready' | 'running' | 'failed'

export type AgentConversation = {
  id: number
  userId: number
  title: string
  status: ConversationStatus
  errorMessage?: string | null
  runVersion: number
  cancelRequested?: number
  shareToken?: string | null
  createdAt: string
  updatedAt: string
}

export type AgentMessage = {
  id: number
  conversationId: number
  role: 'user' | 'assistant' | 'tool'
  kind: 'message' | 'thought' | 'answer' | 'tool_call' | 'tool_result'
  toolName?: string | null
  content: string
  createdAt: string
}

export type ConversationSnapshot = {
  conversation: AgentConversation
  messages: AgentMessage[]
}

/** 发送消息为 SSE 流式接口，小程序不支持流式读取：仅触发请求，以快照轮询作为状态事实来源 */
const STREAM_TIMEOUT = 300000

export const agentApi = {
  listConversations: () =>
    request<AgentConversation[]>('/api/agent/conversations', { method: 'GET' }),
  createConversation: (content: string) =>
    request<ConversationSnapshot>('/api/agent/conversations', {
      method: 'POST',
      data: { content },
      timeout: STREAM_TIMEOUT,
    }),
  getConversation: (id: number) => request<ConversationSnapshot>(`/api/agent/conversations/${id}`),
  getMessages: (id: number) => request<AgentMessage[]>(`/api/agent/conversations/${id}/messages`),
  /** 触发一轮智能体执行（流式响应被丢弃，轮询快照作为事实来源） */
  sendMessage: (id: number, content: string) =>
    request<void>(`/api/agent/conversations/${id}/messages/stream`, {
      method: 'POST',
      data: { content },
      timeout: STREAM_TIMEOUT,
      _stream: true,
    }),
  cancel: (id: number) =>
    request<AgentConversation>(`/api/agent/conversations/${id}/cancel`, { method: 'POST' }),
  share: (id: number) =>
    request<string>(`/api/agent/conversations/${id}/share`, { method: 'POST' }),
}
