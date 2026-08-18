import Taro from '@tarojs/taro'
import { tokenStorage } from './http'

export type AgentStreamEvent = {
  id?: number
  event: string
  data?: unknown
}

const HEARTBEAT_INTERVAL = 20000

export type AgentStreamHandlers = {
  onEvent: (event: AgentStreamEvent) => void
  onClose?: () => void
  onError?: () => void
}

/**
 * 订阅一轮智能体执行的事件流（WebSocket）。
 * 小程序不支持 SSE 流式读取，后端 /ws/agent 按 SSE 语义逐事件推送；
 * 客户端心跳保活，服务端推 pong 回执。返回关闭函数。
 */
export function connectAgentStream(
  conversationId: number,
  runVersion: number,
  handlers: AgentStreamHandlers,
): () => void {
  const token = tokenStorage.getAccessToken()
  let timer: ReturnType<typeof setInterval> | null = null
  let closed = false
  let socketTask: Taro.SocketTask | null = null
  const url = `wss://api.dinqor.cn/ws/agent?conversationId=${conversationId}&runVersion=${runVersion}`

  const cleanup = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  Taro.connectSocket({
    url,
    header: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then(task => {
      if (closed) {
        task.close({ code: 1000 })
        return
      }
      socketTask = task
      task.onOpen(() => {
        if (closed) return
        timer = setInterval(() => {
          task.send({ data: JSON.stringify({ event: 'ping' }) })
        }, HEARTBEAT_INTERVAL)
      })
      task.onMessage(res => {
        if (closed) return
        try {
          const payload = JSON.parse(res.data as string) as AgentStreamEvent
          if (payload.event === 'pong') return
          handlers.onEvent(payload)
        } catch {
          // 忽略畸形帧，不影响轮询兜底。
        }
      })
      task.onClose(() => {
        cleanup()
        if (!closed) handlers.onClose?.()
      })
      task.onError(() => {
        cleanup()
        if (!closed) handlers.onError?.()
      })
    })
    .catch(() => {
      cleanup()
      if (!closed) handlers.onError?.()
    })

  return () => {
    closed = true
    cleanup()
    socketTask?.close({ code: 1000 })
  }
}
