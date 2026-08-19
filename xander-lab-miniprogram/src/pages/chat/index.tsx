import { ScrollView, Text, View } from '@tarojs/components'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  agentApi,
  type AgentConversation,
  type AgentMessage,
  type ConversationSnapshot,
} from '@/api/agent'
import { connectAgentStream } from '@/api/agentSocket'
import { tokenStorage } from '@/api/http'
import { Markdown } from '@/components/Markdown'
import { TabBar } from '@/components/TabBar'
import { NavBar } from '@/components/NavBar'
import { Icon } from '@/components/Icon'
import { ensureLogin, useUserStore } from '@/store/user'
import { truncate } from '@/utils/markdown'
import { ChatComposer } from './components/ChatComposer'
import { ChatDrawer } from './components/ChatDrawer'
import './index.scss'

const ACTIVE_KEY = 'chat_active_id'
const POLL_INTERVAL = 1200

const QUICK_PROMPTS = ['写一篇技术博客', '搜索并整理资料', '我有一个问题']
const CHAT_COPY = {
  history: '最近对话',
  inputPlaceholder: '有什么问题，随时问我...',
  newChat: '新建对话',
  stop: '停止',
} as const

type MessageTurn = {
  key: string
  id: string
  role: 'user' | 'assistant'
  messages: AgentMessage[]
}

const EMPTY_MESSAGES: AgentMessage[] = []

function groupMessagesIntoTurns(messages: AgentMessage[]): MessageTurn[] {
  return messages.reduce<MessageTurn[]>((turns, message) => {
    if (message.role === 'user') {
      turns.push({
        key: `user-${message.id}`,
        id: `msg-${message.id}`,
        role: 'user',
        messages: [message],
      })
      return turns
    }

    const previous = turns[turns.length - 1]
    if (previous?.role === 'assistant') {
      previous.messages.push(message)
      previous.id = `msg-${message.id}`
      return turns
    }

    turns.push({
      key: `assistant-${message.id}`,
      id: `msg-${message.id}`,
      role: 'assistant',
      messages: [message],
    })
    return turns
  }, [])
}

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
  const [thoughtOpen, setThoughtOpen] = useState<Record<number, boolean>>({})
  const [scrollTarget, setScrollTarget] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const openDrawer = useCallback(() => {
    setShowHistory(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setShowHistory(false)
  }, [])

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeIdRef = useRef<number | null>(null)
  const closeStreamRef = useRef<(() => void) | null>(null)
  const streamRunRef = useRef<number | null>(null)
  const [streamAnswer, setStreamAnswer] = useState('')
  const [streamThought, setStreamThought] = useState('')
  const [streamTool, setStreamTool] = useState<string | null>(null)
  const messages = active?.messages ?? EMPTY_MESSAGES
  const messageTurns = useMemo(() => groupMessagesIntoTurns(messages), [messages])
  const lastMessageId = messages[messages.length - 1]?.id

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
    if (!active) return
    const timer = setTimeout(() => {
      setScrollTarget(current =>
        current === 'chat-scroll-bottom-a' ? 'chat-scroll-bottom-b' : 'chat-scroll-bottom-a',
      )
    }, 60)
    return () => clearTimeout(timer)
  }, [
    active?.conversation.id,
    lastMessageId,
    messages.length,
    running,
    streamAnswer.length,
    streamThought.length,
    streamTool,
  ])

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

  const startNewChat = () => {
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
    closeDrawer()
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
      setCreating(false)
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

  return (
    <View className="chat-page">
      <View className={`chat-main-shell ${showHistory ? 'is-drawer-open' : ''}`}>
        {active ? (
          <>
            <NavBar
              title={active.conversation.title || '智能体会话'}
              left={
                <View
                  className="chat-history-trigger chat-history-trigger-left"
                  role="button"
                  ariaRole="button"
                  ariaLabel={CHAT_COPY.history}
                  onClick={() => openDrawer()}
                >
                  <Icon name="more" />
                </View>
              }
              right={
                running ? (
                  <Text className="chat-cancel" onClick={handleCancel}>
                    {CHAT_COPY.stop}
                  </Text>
                ) : (
                  <View
                    className="chat-new-btn"
                    role="button"
                    ariaRole="button"
                    ariaLabel={CHAT_COPY.newChat}
                    onClick={startNewChat}
                  >
                    <Icon name="edit" />
                  </View>
                )
              }
            />
            <ScrollView
              scrollY
              className="chat-messages"
              scrollIntoView={scrollTarget}
              scrollWithAnimation
            >
              <View className="chat-messages-inner">
                <View className="chat-turn-list">
                  {messageTurns.map(turn => (
                    <View id={turn.id} className={`chat-turn ${turn.role}`} key={turn.key}>
                      {turn.messages.map(message => (
                        <MessagePart
                          key={message.id}
                          message={message}
                          open={Boolean(thoughtOpen[message.id])}
                          onToggleThought={() =>
                            setThoughtOpen(previous => ({
                              ...previous,
                              [message.id]: !previous[message.id],
                            }))
                          }
                        />
                      ))}
                    </View>
                  ))}
                  {streamTool || streamThought || streamAnswer || running ? (
                    <View className="chat-turn assistant is-streaming" role="status">
                      {streamTool ? (
                        <View className="msg-tool">
                          <View className="msg-tool-dot" />
                          <Text>正在使用工具：{streamTool}</Text>
                        </View>
                      ) : null}
                      {streamThought ? (
                        <View className="msg-thought">
                          <Text className="msg-thought-title">思考过程</Text>
                          <Text>{truncate(streamThought, 120)}</Text>
                        </View>
                      ) : null}
                      {streamAnswer ? (
                        <View className="msg-answer stream">
                          <Markdown content={streamAnswer} />
                          <Text className="msg-stream-cursor">▍</Text>
                        </View>
                      ) : null}
                      {running && !streamAnswer ? (
                        <View className="chat-typing">
                          <View className="dot" />
                          <View className="dot" />
                          <View className="dot" />
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                <View className="chat-scroll-sentinels">
                  <View id="chat-scroll-bottom-a" className="chat-scroll-sentinel" />
                  <View id="chat-scroll-bottom-b" className="chat-scroll-sentinel" />
                </View>
              </View>
            </ScrollView>
            <ChatComposer
              value={input}
              placeholder={CHAT_COPY.inputPlaceholder}
              sendLabel={CHAT_COPY.inputPlaceholder}
              stopLabel={CHAT_COPY.stop}
              running={running}
              creating={creating}
              onChange={setInput}
              onSubmit={() => handleSend()}
              onStop={handleCancel}
            />
          </>
        ) : (
          <>
            <NavBar
              title="DinQor"
              left={
                <View
                  className="chat-history-trigger chat-history-trigger-left"
                  role="button"
                  ariaRole="button"
                  ariaLabel={CHAT_COPY.history}
                  onClick={() => openDrawer()}
                >
                  <Icon name="more" />
                </View>
              }
            />
            <View className="chat-home-empty">
              <Text className="chat-home-title">我们先从哪里开始呢？</Text>
              <View className="chat-home-quick-list">
                {QUICK_PROMPTS.map(prompt => (
                  <View
                    key={prompt}
                    className="chat-home-quick"
                    role="button"
                    ariaRole="button"
                    ariaLabel={prompt}
                    onClick={() => setInput(prompt)}
                  >
                    <Text>{prompt}</Text>
                  </View>
                ))}
              </View>
              <ChatComposer
                home
                value={input}
                placeholder={CHAT_COPY.inputPlaceholder}
                sendLabel={CHAT_COPY.inputPlaceholder}
                stopLabel={CHAT_COPY.stop}
                running={running}
                creating={creating}
                onChange={setInput}
                onSubmit={() => handleSend()}
                onStop={handleCancel}
              />
            </View>
          </>
        )}
        <View
          className={`chat-drawer-dismiss ${showHistory ? 'show' : ''}`}
          role="button"
          ariaRole="button"
          ariaLabel={CHAT_COPY.history}
          catchMove={showHistory}
          onClick={event => {
            event.stopPropagation()
            closeDrawer()
          }}
        />
      </View>
      <ChatDrawer
        visible={showHistory}
        onClose={closeDrawer}
        conversations={conversations}
        activeId={activeIdRef.current}
        onSelect={openConversation}
        onNewChat={startNewChat}
        onNavigate={url => Taro.redirectTo({ url })}
        user={user}
      />
      <TabBar active="chat" />
    </View>
  )
}

function MessagePart({
  message,
  open,
  onToggleThought,
}: {
  message: AgentMessage
  open: boolean
  onToggleThought: () => void
}) {
  if (message.role === 'user' && message.kind === 'message') {
    return <View className="msg-bubble user">{message.content}</View>
  }
  if (message.kind === 'thought') {
    return (
      <View
        className="msg-thought"
        role="button"
        ariaRole="button"
        ariaLabel="思考过程"
        onClick={onToggleThought}
      >
        <Text className="msg-thought-title">思考过程</Text>
        <Text>{open ? message.content : truncate(message.content, 120)}</Text>
      </View>
    )
  }
  if (message.kind === 'tool_call') {
    return (
      <View className="msg-tool">
        <View className="msg-tool-dot" />
        <Text>正在使用工具：{message.toolName || '内部工具'}</Text>
      </View>
    )
  }
  if (message.kind === 'tool_result') {
    return (
      <View className="msg-tool is-complete">
        <Text>工具执行完成</Text>
      </View>
    )
  }
  return (
    <View className="msg-answer">
      <Markdown content={message.content || '（空回复）'} />
    </View>
  )
}
