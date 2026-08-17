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

/** 小程序不支持 SSE 流式读取：触发后台执行后立即返回，以快照轮询作为状态事实来源 */

export const agentApi = {
  listConversations: () =>
    request<AgentConversation[]>('/api/agent/conversations', { method: 'GET' }),
  createConversation: (content: string) =>
    request<ConversationSnapshot>('/api/agent/conversations', {
      method: 'POST',
      data: { content },
    }),
  getConversation: (id: number) => request<ConversationSnapshot>(`/api/agent/conversations/${id}`),
  getMessages: (id: number) => request<AgentMessage[]>(`/api/agent/conversations/${id}/messages`),
  /** 触发一轮智能体后台执行（非流式端点，立即返回；结果由轮询快照读取） */
  sendMessage: (id: number, content: string) =>
    request<number>(`/api/agent/conversations/${id}/messages`, {
      method: 'POST',
      data: { content },
    }),
  cancel: (id: number) =>
    request<AgentConversation>(`/api/agent/conversations/${id}/cancel`, { method: 'POST' }),
  share: (id: number) =>
    request<string>(`/api/agent/conversations/${id}/share`, { method: 'POST' }),
}
