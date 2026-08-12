import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { agentConversationService, parseToolPayload } from '../services/agentConversationService';
import { useToast } from '@/hooks/useToast';

const LIVE_STEP_LIMIT = 80;

/**
 * 博客智能体对话状态管理：会话列表、消息、SSE 流式事件与断线续传。
 */
export const useAgentConversation = ({ conversationId }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [liveSteps, setLiveSteps] = useState([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const cursorRef = useRef(0);
  const busyRef = useRef(false);

  const pushStep = useCallback((step) => {
    setLiveSteps((current) => [...current.slice(-LIVE_STEP_LIMIT), step]);
  }, []);

  const applyEvent = useCallback(({ id, event, data }) => {
    if (id) cursorRef.current = Number(id);
    if (event === 'thought') {
      pushStep({ type: 'thought', content: data });
    } else if (event === 'tool_start') {
      pushStep({ type: 'tool', tool: data?.tool, phase: 'start' });
    } else if (event === 'tool_progress') {
      pushStep({ type: 'tool', tool: data?.tool, phase: 'progress', message: data?.message });
    } else if (event === 'tool_end') {
      pushStep({ type: 'tool', tool: data?.tool, phase: 'end', result: data?.result });
    } else if (event === 'tool_error') {
      pushStep({ type: 'tool', tool: data?.tool, phase: 'error', error: data?.error });
    } else if (event === 'answer') {
      pushStep({ type: 'answer', content: data });
    } else if (event === 'complete') {
      pushStep({ type: 'complete', data });
    } else if (event === 'error') {
      pushStep({ type: 'error', message: data });
    }
  }, [pushStep]);

  const refreshMessages = useCallback(async (id) => {
    const list = await agentConversationService.getMessages(id, { _silent: true }).catch(() => []);
    if (Array.isArray(list)) setMessages(list);
  }, []);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      setSessions(await agentConversationService.list({ _silent: true }) || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  /** 从游标续传当前一轮事件，直到 complete/error 或会话离开 running。 */
  const subscribeFrom = useCallback(async (id) => {
    try {
      await agentConversationService.subscribeEvents(
        id,
        cursorRef.current || undefined,
        (payload) => applyEvent(payload),
        { _silent: true },
      );
    } catch {
      // 服务端已断或鉴权过期：以最新快照为准。
    }
    const detail = await agentConversationService.get(id, { _silent: true }).catch(() => null);
    if (detail?.conversation) setConversation(detail.conversation);
    if (detail?.messages) setMessages(detail.messages);
    setRunning(false);
    setReconnecting(false);
  }, [applyEvent]);

  const openConversation = useCallback(async (id) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    cursorRef.current = 0;
    setErrorMessage(null);
    setLiveSteps([]);
    try {
      const detail = await agentConversationService.get(id);
      setConversation(detail?.conversation ?? null);
      setMessages(detail?.messages ?? []);
      if (detail?.conversation?.status === 'running') {
        setRunning(true);
        setReconnecting(true);
        await subscribeFrom(id);
      }
    } catch (error) {
      toast.error(error.message || t('blog.agentChat.loadFailed'));
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, [subscribeFrom, toast, t]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (conversationId) openConversation(conversationId);
  }, [conversationId, openConversation]);

  /** 发送一条消息并驱动一轮 agent loop；断线时自动续传。 */
  const sendMessage = useCallback(async (content) => {
    const text = content?.trim();
    if (!conversationId || !text || busyRef.current) return;
    busyRef.current = true;
    setRunning(true);
    setReconnecting(false);
    setErrorMessage(null);
    setLiveSteps([]);
    try {
      await agentConversationService.sendMessageStream(
        conversationId,
        text,
        (payload) => applyEvent(payload),
        { _silent: true },
      );
    } catch {
      // 连接中断后服务端的 agent loop 仍在执行：从事件游标续传。
      setReconnecting(true);
      await subscribeFrom(conversationId);
      busyRef.current = false;
      setRunning(false);
      return;
    }
    await refreshMessages(conversationId);
    busyRef.current = false;
    setRunning(false);
    loadSessions();
  }, [conversationId, applyEvent, refreshMessages, subscribeFrom, loadSessions]);

  /** 新建会话并返回详情，页面负责跳转。 */
  const createConversation = useCallback(async (content) => {
    const text = content?.trim();
    if (!text) throw new Error(t('blog.agentChat.inputRequired'));
    const detail = await agentConversationService.create(text, { dedupe: false });
    setConversation(detail?.conversation ?? null);
    setMessages(detail?.messages ?? []);
    setLiveSteps([]);
    cursorRef.current = 0;
    await loadSessions();
    return detail;
  }, [loadSessions, t]);

  const reset = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setLiveSteps([]);
    setErrorMessage(null);
    setRunning(false);
    setReconnecting(false);
    cursorRef.current = 0;
  }, []);

  return {
    sessions,
    sessionsLoading,
    conversation,
    messages,
    loading,
    running,
    reconnecting,
    errorMessage,
    liveSteps,
    loadSessions,
    openConversation,
    sendMessage,
    createConversation,
    reset,
    refreshMessages,
  };
};

/** 历史 tool 消息渲染辅助：tool_call / tool_result 的展示文本。 */
export const toolCallSummary = (message, t) => {
  const payload = parseToolPayload(message?.content);
  const tool = payload?.tool || message?.toolName || t('blog.agentChat.unknownTool');
  return { tool, payload };
};

/** 工具结果截断为短摘要。 */
export const compactToolResult = (result) => {
  const text = typeof result === 'string' ? result : JSON.stringify(result);
  if (!text || text.length <= 200) return text;
  return `${text.slice(0, 200)}…`;
};