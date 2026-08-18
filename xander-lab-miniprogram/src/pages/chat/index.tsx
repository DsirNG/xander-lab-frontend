import { ScrollView, Text, Textarea, View } from '@tarojs/components'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  agentApi,
  type AgentConversation,
  type AgentMessage,
  type ConversationSnapshot,
} from '@/api/agent'
import { connectAgentStream } from '@/api/agentSocket'
import { authApi } from '@/api/auth'
import { tokenStorage } from '@/api/http'
import { Markdown } from '@/components/Markdown'
import { TabBar } from '@/components/TabBar'
import { Icon } from '@/components/Icon'
import { ensureLogin, useUserStore } from '@/store/user'
import { formatDateTime } from '@/utils/format'
import { truncate } from '@/utils/markdown'
import './index.scss'

const ACTIVE_KEY = 'chat_active_id'
const POLL_INTERVAL = 1200

const QUICK_PROMPTS = ['写一篇技术博客', '生成一张图片', '搜索今天的 AI 行业动态']

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

export default function Chat() {
  const user = useUserStore(state => state.user)
  const refreshUser = useUserStore(state => state.refresh)

  const [conversations, setConversations] = useState<AgentConversation[]>([])
  const [active, setActive] = useState<ConversationSnapshot | null>(null)
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [thoughtOpen, setThoughtOpen] = useState<Record<number, boolean>>({})
  const [scrollTarget, setScrollTarget] = useState('')

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeIdRef = useRef<number | null>(null)
  const closeStreamRef = useRef<(() => void) | null>(null)
  const streamRunRef = useRef<number | null>(null)
  const [streamAnswer, setStreamAnswer] = useState('')
  const [streamThought, setStreamThought] = useState('')
  const [streamTool, setStreamTool] = useState<string | null>(null)

  const closeStream = () => {
    streamRunRef.current = null
    closeStreamRef.current?.()
    closeStreamRef.current = null
  }

  const openStream = (id: number, runVersion: number) => {
    closeStream()
    setStreamAnswer('')
    setStreamThought('')
    setStreamTool(null)
    streamRunRef.current = runVersion
    // WS 推全量 thought / 增量 answer_delta；tool 过程实时渲染，终态由轮询快照接管。
    const close = connectAgentStream(id, runVersion, {
      onEvent: ev => {
        if (ev.event === 'answer_delta') {
          setStreamAnswer(prev => prev + String(ev.data ?? ''))
        } else if (ev.event === 'answer') {
          setStreamAnswer(String(ev.data ?? ''))
        } else if (ev.event === 'thought') {
          setStreamThought(String(ev.data ?? ''))
        } else if (ev.event === 'tool_start') {
          setStreamTool(String((ev.data as { tool?: string } | undefined)?.tool ?? '内部工具'))
        } else if (ev.event === 'tool_end' || ev.event === 'tool_error') {
          setStreamTool(null)
        }
      },
      onClose: () => {
        // 只清自己的引用，防止旧连接的异步回调误清新连接的句柄。
        if (closeStreamRef.current === close) closeStreamRef.current = null
      },
      onError: () => {
        if (closeStreamRef.current === close) closeStreamRef.current = null
      },
    })
    closeStreamRef.current = close
  }

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const startPolling = useCallback((id: number) => {
    const check = async () => {
      try {
        // WS 健康时轮询作为看门狗不发请求；WS 关闭/失败后由轮询接管收尾与兜底。
        if (closeStreamRef.current) return
        const snapshot = await agentApi.getConversation(id)
        if (activeIdRef.current !== id) return
        setActive(snapshot)
        setRunning(snapshot.conversation.status === 'running')
        if (snapshot.conversation.status !== 'running') {
          stopPolling()
          // 终态：快照已有完整消息，流式增量全部作废。
          setStreamAnswer('')
          setStreamThought('')
          setStreamTool(null)
          streamRunRef.current = null
          if (snapshot.conversation.status === 'failed') {
            showToast(snapshot.conversation.errorMessage || '生成失败，请重试')
          }
        } else if (
          streamRunRef.current != null &&
          snapshot.conversation.runVersion !== streamRunRef.current
        ) {
          // 事件流对应的轮次已被新轮次取代，增量作废，交给快照展示。
          setStreamAnswer('')
          setStreamThought('')
          setStreamTool(null)
        }
      } catch {
        stopPolling()
        closeStream()
        setStreamAnswer('')
        setStreamThought('')
        setStreamTool(null)
        setRunning(false)
      }
    }
    stopPolling()
    setRunning(true)
    check()
    pollTimerRef.current = setInterval(check, POLL_INTERVAL)
  }, [])

  /**
   * 恢复当前会话：进入页面 / 切 tab 回来 / 打开会话时统一走这里，
   * running 状态恢复事件流 + 轮询，避免只轮询不开流。
   */
  const resumeActive = useCallback(() => {
    const savedId = activeIdRef.current ?? Taro.getStorageSync<number>(ACTIVE_KEY)
    if (!savedId) return
    agentApi
      .getConversation(savedId)
      .then(snapshot => {
        if (activeIdRef.current != null && activeIdRef.current !== savedId) return
        activeIdRef.current = savedId
        setActive(snapshot)
        setRunning(snapshot.conversation.status === 'running')
        if (snapshot.conversation.status === 'running') {
          if (snapshot.conversation.runVersion)
            openStream(savedId, snapshot.conversation.runVersion)
          startPolling(savedId)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    return () => {
      stopPolling()
      closeStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadConversations = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) return
    try {
      const list = await agentApi.listConversations()
      setConversations(list)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '会话列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser().catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDidShow(() => {
    if (!user) {
      refreshUser().catch(() => undefined)
    }
    if (tokenStorage.getAccessToken()) {
      loadConversations()
    } else {
      setLoading(false)
    }
    resumeActive()
  })

  useDidHide(() => {
    // tab 切换只触发 hide 不卸载页面：暂停轮询与事件流，回后台后由 useDidShow 恢复。
    stopPolling()
    closeStream()
    setStreamAnswer('')
    setStreamThought('')
    setStreamTool(null)
  })

  useEffect(() => {
    const last = active?.messages?.slice(-1)[0]
    if (last) {
      const timer = setTimeout(() => setScrollTarget(`msg-${last.id}`), 60)
      return () => clearTimeout(timer)
    }
  }, [active?.messages])

  const openConversation = async (id: number) => {
    try {
      const snapshot = await agentApi.getConversation(id)
      closeStream()
      activeIdRef.current = id
      Taro.setStorageSync(ACTIVE_KEY, id)
      setActive(snapshot)
      setStreamAnswer('')
      setStreamThought('')
      setStreamTool(null)
      setRunning(snapshot.conversation.status === 'running')
      if (snapshot.conversation.status === 'running') {
        // 重新进入进行中的会话：恢复事件流，轮询作为看门狗兜底。
        if (snapshot.conversation.runVersion) openStream(id, snapshot.conversation.runVersion)
        startPolling(id)
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : '会话加载失败')
    }
  }

  const backToList = () => {
    stopPolling()
    closeStream()
    activeIdRef.current = null
    setActive(null)
    setRunning(false)
    setInput('')
    setScrollTarget('')
    setStreamAnswer('')
    setStreamThought('')
    setStreamTool(null)
    Taro.removeStorageSync(ACTIVE_KEY)
    loadConversations()
  }

  const handleSend = async (forcedContent?: string) => {
    const content = (forcedContent ?? input).trim()
    if (!content || running || creating) return
    if (!ensureLogin()) return

    const tempUser: AgentMessage = {
      id: -Date.now(),
      conversationId: 0,
      role: 'user',
      kind: 'message',
      content,
      createdAt: new Date().toISOString(),
    }

    let targetId: number
    try {
      if (!active) {
        setCreating(true)
        const snapshot = await agentApi.createConversation(content)
        targetId = snapshot.conversation.id
        activeIdRef.current = targetId
        Taro.setStorageSync(ACTIVE_KEY, targetId)
        setActive({
          conversation: snapshot.conversation,
          messages: [...snapshot.messages, tempUser],
        })
        setCreating(false)
      } else {
        targetId = active.conversation.id
        activeIdRef.current = targetId
        setActive(prev => (prev ? { ...prev, messages: [...prev.messages, tempUser] } : prev))
        Taro.setStorageSync(ACTIVE_KEY, targetId)
      }
      setInput('')
      try {
        const runVersion = await agentApi.sendMessage(targetId, content)
        if (runVersion) openStream(targetId, runVersion)
      } catch (e) {
        const message = e instanceof Error ? e.message : ''
        if (message.includes('timeout') || message.includes('超时')) {
          // 触发请求超时：服务端可能已开始执行，轮询负责收尾
        } else {
          showToast(message || '发送失败')
        }
      }
      startPolling(targetId)
    } catch (e) {
      if (creating) setCreating(false)
      showToast(e instanceof Error ? e.message : '发送失败，请重试')
    }
  }

  const handleCancel = async () => {
    if (!active) return
    try {
      await agentApi.cancel(active.conversation.id)
      showToast('已请求停止')
    } catch (e) {
      showToast(e instanceof Error ? e.message : '取消失败')
    }
  }

  const handleWechatLogin = async () => {
    try {
      const loginResult = await Taro.login()
      if (!loginResult.code) {
        showToast('获取微信登录凭证失败')
        return
      }
      const response = await authApi.wechatLogin(loginResult.code)
      useUserStore.getState().setUser(response.userInfo)
      loadConversations()
      showToast('登录成功')
    } catch (e) {
      showToast(e instanceof Error ? e.message : '登录失败，请重试')
    }
  }

  const messages = active?.messages || []

  return (
    <View className="chat-page">
      {active ? (
        <>
          <View className="chat-nav">
            <View className="chat-nav-back" onClick={backToList}>
              <Icon name="back" />
            </View>
            <Text className="chat-nav-title">{active.conversation.title || '智能体会话'}</Text>
            {running ? (
              <Text className="chat-cancel" onClick={handleCancel}>
                停止
              </Text>
            ) : null}
          </View>
          <ScrollView
            scrollY
            className="chat-messages"
            scrollIntoView={scrollTarget}
            scrollWithAnimation
          >
            <View className="chat-messages-inner">
              {messages.map(message => (
                <MessageRow
                  key={message.id}
                  message={message}
                  open={Boolean(thoughtOpen[message.id])}
                  onToggleThought={() =>
                    setThoughtOpen(prev => ({ ...prev, [message.id]: !prev[message.id] }))
                  }
                />
              ))}
              {streamTool ? (
                <View className="msg-row">
                  <View className="msg-tool">
                    <View className="msg-tool-dot" />
                    <Text>正在使用工具：{streamTool}</Text>
                  </View>
                </View>
              ) : null}
              {streamThought ? (
                <View className="msg-row">
                  <View className="msg-thought">
                    <Text className="msg-thought-title">思考过程</Text>
                    <Text>{truncate(streamThought, 120)}</Text>
                  </View>
                </View>
              ) : null}
              {streamAnswer ? (
                <View className="msg-row">
                  <View className="msg-bubble ai stream">
                    <Text>{streamAnswer}</Text>
                    <Text className="msg-stream-cursor">▍</Text>
                  </View>
                </View>
              ) : null}
              {running && !streamAnswer ? (
                <View className="msg-row">
                  <View className="chat-typing">
                    <View className="dot" />
                    <View className="dot" />
                    <View className="dot" />
                  </View>
                </View>
              ) : null}
              <View id="msg-bottom" />
            </View>
          </ScrollView>
          <View className="chat-input-bar">
            <Textarea
              className="chat-input"
              value={input}
              maxlength={4000}
              autoHeight
              placeholder="输入消息，回车发送"
              placeholderClass="chat-input-placeholder"
              onInput={e => setInput(e.detail.value)}
              confirmType="send"
              onConfirm={() => handleSend()}
              cursorSpacing={24}
            />
            <View
              className={`chat-send ${running || creating ? 'busy' : 'ready'}`}
              onClick={() => (running ? handleCancel() : handleSend())}
            >
              {running ? <View className="chat-stop" /> : <Icon name="send" />}
            </View>
          </View>
        </>
      ) : (
        <>
          <View className="chat-nav">
            <Text className="chat-nav-title">对话</Text>
            <View className="chat-new-btn" onClick={backToList}>
              <Icon name="chat" />
              <Text>智能体</Text>
            </View>
          </View>
          <ScrollView scrollY className="chat-session-list">
            {!user ? (
              <View className="chat-empty">
                <Text>登录后使用博客智能体对话</Text>
                <View className="btn btn-primary chat-login-btn" onClick={handleWechatLogin}>
                  微信一键登录
                </View>
                <Text
                  className="chat-quick"
                  onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
                >
                  使用账号密码登录
                </Text>
              </View>
            ) : null}
            {loading ? <Text className="data-state">正在加载会话...</Text> : null}
            {user && !loading && conversations.length === 0 ? (
              <View className="chat-empty">
                <Text>还没有会话，开始一次新的对话吧</Text>
                <View className="chat-quick-row">
                  {QUICK_PROMPTS.map(prompt => (
                    <Text key={prompt} className="chat-quick" onClick={() => setInput(prompt)}>
                      {prompt}
                    </Text>
                  ))}
                </View>
                <View
                  className="btn btn-primary chat-login-btn"
                  onClick={() => handleSend(input.trim() ? undefined : '请为我生成一篇技术博客')}
                >
                  发送第一条消息
                </View>
              </View>
            ) : null}
            {conversations.map(conversation => (
              <View
                className="chat-session-item"
                key={conversation.id}
                onClick={() => openConversation(conversation.id)}
              >
                <View className="chat-session-badge">{conversation.title.charAt(0) || 'A'}</View>
                <View className="chat-session-info">
                  <Text className="chat-session-title">{conversation.title}</Text>
                  <Text className="chat-session-time">
                    {formatDateTime(conversation.updatedAt)}
                    {conversation.status === 'running' ? ' · 执行中' : ''}
                  </Text>
                </View>
                <View className="chat-session-arrow">
                  <Icon name="right" />
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}
      <TabBar active="chat" />
    </View>
  )
}

function MessageRow({
  message,
  open,
  onToggleThought,
}: {
  message: AgentMessage
  open: boolean
  onToggleThought: () => void
}) {
  if (message.role === 'user' && message.kind === 'message') {
    return (
      <View className="msg-row user">
        <View className="msg-bubble user">{message.content}</View>
      </View>
    )
  }
  if (message.kind === 'thought') {
    return (
      <View className="msg-row">
        <View className="msg-thought" onClick={onToggleThought}>
          <Text className="msg-thought-title">思考过程</Text>
          <Text>{open ? message.content : truncate(message.content, 120)}</Text>
        </View>
      </View>
    )
  }
  if (message.kind === 'tool_call') {
    return (
      <View className="msg-row">
        <View className="msg-tool">
          <View className="msg-tool-dot" />
          <Text>正在使用工具：{message.toolName || '内部工具'}</Text>
        </View>
      </View>
    )
  }
  if (message.kind === 'tool_result') {
    return (
      <View className="msg-row">
        <View className="msg-tool">
          <Text>工具执行完成</Text>
        </View>
      </View>
    )
  }
  return (
    <View className="msg-row">
      <View className="msg-bubble ai">
        <Markdown content={message.content || '（空回复）'} />
      </View>
    </View>
  )
}
