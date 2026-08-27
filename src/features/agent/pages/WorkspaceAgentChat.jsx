import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  PenLine,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@components/common/Modal';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import { useAgentConversation } from '../hooks/useAgentConversation';
import { agentConversationService, parseToolPayload } from '../services/agentConversationService';
import AgentMarkdown from '../components/AgentMarkdown';
import {
  ImageToolProgressPanel,
  ImageToolResult,
  PlanCard,
  ReflectionCard,
  ThinkingIndicator,
} from './AgentChat';

const IMAGE_TOOL = 'image_generate';

const imageToolResult = (message) => {
  if (message?.kind !== 'tool_result') return null;
  const payload = parseToolPayload(message.content);
  const tool = payload?.tool || message.toolName;
  return tool === IMAGE_TOOL && payload?.url ? payload : null;
};

const containsResultUrl = (content, urls) => {
  if (!content || urls.size === 0) return false;
  for (const url of urls) {
    if (content.includes(url)) return true;
  }
  return false;
};

const ThoughtCard = ({ content }) => (
  <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
    <span className="whitespace-pre-wrap">{content}</span>
  </div>
);

const MessageAttachments = ({ attachments = [] }) =>
  attachments.length ? (
    <div className="mb-2 flex max-w-full flex-wrap gap-2">
      {attachments.map((attachment) =>
        attachment.contentType?.startsWith('image/') ? (
          <a
            key={`${attachment.url}-${attachment.name}`}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <img
              src={attachment.url}
              alt={attachment.name}
              className="h-20 w-20 rounded-2xl border border-border object-cover"
            />
          </a>
        ) : (
          <a
            key={`${attachment.url}-${attachment.name}`}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="flex max-w-64 items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-caption text-ink hover:bg-surface-muted"
          >
            <FileText className="h-4 w-4 shrink-0 text-ink-muted" />
            <span className="truncate">{attachment.name}</span>
          </a>
        )
      )}
    </div>
  ) : null;

const cleanImageMarkdown = (text) => {
  if (!text) return text;
  const imageMatch = text.match(/!\[.*?\]\([^)]+\)/);
  if (imageMatch) return imageMatch[0];
  return text;
};

const ConversationMessage = ({ role, content, attachments, isStreaming }) => (
  <div className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={
        role === 'user'
          ? 'max-w-[85%] rounded-3xl bg-[#5d55fa] px-4 py-2.5 text-sm leading-6 text-white sm:max-w-[75%]'
          : 'w-full min-w-0 py-1 text-sm leading-6 text-[#242741]'
      }
    >
      {role === 'user' ? (
        <>
          <MessageAttachments attachments={attachments} />
          <span className="whitespace-pre-wrap">{content}</span>
        </>
      ) : isStreaming ? (
        content ? (
          <div className="flex items-start gap-0.5">
            <div className="min-w-0 flex-1">
              <AgentMarkdown content={cleanImageMarkdown(content)} />
            </div>
            <span
              className="mt-1.5 inline-block h-4 w-[3px] shrink-0 animate-pulse rounded-sm bg-current align-middle"
              aria-hidden="true"
            />
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-1" role="status" aria-live="polite">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-70"
                style={{ animationDelay: `${index * 140}ms` }}
              />
            ))}
          </span>
        )
      ) : (
        <AgentMarkdown content={cleanImageMarkdown(content)} />
      )}
    </div>
  </div>
);

const formatSessionTime = (dateStr, t) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const time = date.getTime();

  if (time >= todayStart) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (time >= yesterdayStart) {
    return t('workspace.agent.groups.yesterday', '昨天');
  }
  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
};

const WorkspaceAgentChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q');
  const toast = useToast();
  const { userInfo } = useAuthSession();

  const displayName = userInfo?.nickname || userInfo?.username || 'XanderDING';

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPinned, setExpandedPinned] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const pendingQueryRef = useRef(null);

  const {
    sessions,
    conversation,
    messages,
    loading,
    creating,
    running,
    reconnecting,
    errorMessage,
    liveSteps,
    sendMessage,
    cancelTurn,
    createConversation,
    reset,
  } = useAgentConversation({ conversationId });

  const closeSearchModal = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const isActive = running || conversation?.status === 'running';
  const locked = isActive || creating;

  const steps = useMemo(() => {
    if (liveSteps.length === 0) return [];
    return liveSteps;
  }, [liveSteps]);

  const streamingAnswer = useMemo(
    () => steps.some((step) => step.type === 'answer' || step.type === 'answer_delta'),
    [steps],
  );

  const activeImageGeneration = useMemo(() => {
    let active = false;
    let message = '';
    steps.forEach((step) => {
      if (step.type !== 'tool' || step.tool !== IMAGE_TOOL) return;
      if (step.phase === 'start') {
        active = true;
        message = '';
      } else if (step.phase === 'progress') {
        active = true;
        message = step.message || message;
      } else if (step.phase === 'end' || step.phase === 'error') {
        active = false;
      }
    });
    return active ? { message } : null;
  }, [steps]);

  const historicalImageUrls = useMemo(() => {
    const urls = new Set();
    messages.forEach((message) => {
      const result = imageToolResult(message);
      if (result?.url) urls.add(result.url);
    });
    return urls;
  }, [messages]);

  const liveImageUrls = useMemo(
    () =>
      new Set(
        steps
          .filter((step) => step.type === 'tool' && step.tool === IMAGE_TOOL && step.phase === 'end' && step.result?.url)
          .map((step) => step.result.url),
      ),
    [steps],
  );

  useEffect(() => {
    if (stickToBottomRef.current) chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages, steps]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [input]);

  const submitText = useCallback(
    async (text, selectedAttachments = []) => {
      const trimmed = text.trim() || t('blog.agentChat.analyzeAttachments');
      if (!trimmed && selectedAttachments.length === 0) return;
      stickToBottomRef.current = true;
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 10);

      if (!conversationId) {
        try {
          const detail = await createConversation(trimmed, selectedAttachments);
          if (!detail?.conversation?.id) return;
          navigate(`/workspace/ai/${detail.conversation.id}`, { replace: true });
          setInput('');
          setAttachments([]);
        } catch (error) {
          toast.error(error.message || t('blog.agentChat.sendFailed'));
        }
        return;
      }
      setInput('');
      setAttachments([]);
      await sendMessage(trimmed, { attachments: selectedAttachments });
    },
    [conversationId, createConversation, navigate, sendMessage, t, toast],
  );

  const handleSubmit = async () => {
    if (!input.trim() && attachments.length === 0) {
      toast.warning(t('blog.agentChat.inputRequired'));
      return;
    }
    await submitText(input, attachments);
  };

  const handleFilesSelected = useCallback(
    async (files) => {
      const remaining = Math.max(0, 5 - attachments.length);
      if (!remaining) {
        toast.warning(t('blog.agentChat.attachmentLimit'));
        return;
      }
      const selected = files.slice(0, remaining);
      const valid = selected.filter((file) => {
        if (file.size <= 20 * 1024 * 1024) return true;
        toast.warning(t('blog.agentChat.attachmentTooLarge', { name: file.name }));
        return false;
      });
      if (!valid.length) return;
      setUploadingAttachments(true);
      try {
        const settled = await Promise.allSettled(
          valid.map((file) => agentConversationService.uploadAttachment(file)),
        );
        const uploaded = settled.filter((item) => item.status === 'fulfilled').map((item) => item.value);
        if (uploaded.length) setAttachments((current) => [...current, ...uploaded].slice(0, 5));
        if (settled.some((item) => item.status === 'rejected')) {
          toast.error(t('blog.agentChat.attachmentUploadFailed'));
        }
      } finally {
        setUploadingAttachments(false);
      }
    },
    [attachments.length, t, toast],
  );

  const handleNewConversation = () => {
    reset();
    setInput('');
    setAttachments([]);
    navigate('/workspace/ai', { replace: true });
  };

  useEffect(() => {
    if (!queryParam || conversationId || creating || pendingQueryRef.current === queryParam) return;
    pendingQueryRef.current = queryParam;
    setInput(queryParam);
    (async () => {
      try {
        await submitText(queryParam);
        const next = new URLSearchParams(searchParams);
        next.delete('q');
        setSearchParams(next, { replace: true });
      } catch (error) {
        toast.error(error.message || t('blog.agentChat.sendFailed'));
      }
    })();
  }, [queryParam, conversationId, creating, submitText, searchParams, setSearchParams, t, toast]);

  // 分组逻辑：置顶 (pinned) 与 最近 (recent)
  const { pinnedSessions, recentSessions } = useMemo(() => {
    const pinned = sessions.filter((s) => s.isPinned);
    const recent = sessions.filter((s) => !s.isPinned);

    // 如果数据中没有显式 isPinned，则将前 3 条划分至置顶组，后续归为最近组
    if (pinned.length === 0 && sessions.length > 0) {
      return {
        pinnedSessions: sessions.slice(0, 3),
        recentSessions: sessions.slice(3),
      };
    }

    return { pinnedSessions: pinned, recentSessions: recent };
  }, [sessions]);

  // 搜索弹窗过滤结果
  const searchFilteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(query) ||
        (s.lastMessage || s.summary || '').toLowerCase().includes(query),
    );
  }, [sessions, searchQuery]);

  const visiblePinnedSessions = useMemo(() => {
    if (expandedPinned || pinnedSessions.length <= 3) {
      return pinnedSessions;
    }
    return pinnedSessions.slice(0, 3);
  }, [pinnedSessions, expandedPinned]);

  const hiddenPinnedCount = pinnedSessions.length - 3;

  const canSend = Boolean(input.trim() || attachments.length) && !uploadingAttachments;

  const renderSessionItem = (session) => {
    const isActiveSession = String(conversationId) === String(session.id);
    const formattedTime = formatSessionTime(session.updatedAt || session.createdAt, t);
    const previewText = session.lastMessage || session.summary || session.title || '';

    return (
      <button
        key={session.id}
        type="button"
        onClick={() => navigate(`/workspace/ai/${session.id}`)}
        className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-3 text-left transition-colors ${
          isActiveSession ? 'bg-[#f2f1fd]' : 'hover:bg-[#f7f6fc]'
        }`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0effe] text-[#6055f6]">
          <CheckSquare className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate text-sm font-bold ${isActiveSession ? 'text-[#6055f6]' : 'text-[#1a1c2e]'}`}>
              {session.title || t('blog.agent.untitled', '未命名对话')}
            </span>
            {formattedTime && (
              <span className="shrink-0 text-xs text-[#9ea3b9]">
                {formattedTime}
              </span>
            )}
          </div>
          {previewText && (
            <div className="mt-0.5 truncate text-xs text-[#9ea3b9]">
              {previewText}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="relative flex h-full w-full min-w-0 overflow-hidden bg-[#fafafa]">
      {/* AI 会话 Side Drawer */}
      {drawerOpen && (
        <aside className="relative flex h-full w-[310px] shrink-0 flex-col border-r border-[#ececf4] bg-[#fcfcfd] p-4">
          {/* Drawer Title */}
          <div className="px-1 pt-1 pb-2">
            <h2 className="text-xl font-bold text-[#111426]">
              {t('workspace.agent.drawerTitle', 'AI 会话')}
            </h2>
          </div>

          {/* Top Actions: + 新建对话 & 搜索 Icon Button */}
          <div className="mt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={locked}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#5d55fa] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4d44f3] active:scale-[0.98] disabled:opacity-50"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>{t('workspace.agent.newConversation', '新建对话')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#ececf4] bg-white text-[#6c7293] transition-colors hover:bg-[#f7f6fc] hover:border-[#dcd9fc]"
              title={t('blog.agentChat.searchPlaceholder', '搜索会话...')}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Grouped Session List */}
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {/* 置顶 Sessions */}
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <div className="px-1 text-xs font-semibold text-[#8e94aa] mb-2">
                  {t('workspace.agent.groups.pinned', '置顶')}
                </div>
                {visiblePinnedSessions.map(renderSessionItem)}

                {/* 折叠/展开 “加载更多 (N) ∨” */}
                {!expandedPinned && hiddenPinnedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpandedPinned(true)}
                    className="my-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[#6055f6] hover:opacity-80 transition-opacity"
                  >
                    <span className="text-[#ececf4]">-------</span>
                    <span>{t('workspace.agent.loadMore', { count: hiddenPinnedCount })}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span className="text-[#ececf4]">-------</span>
                  </button>
                )}
              </div>
            )}

            {/* 最近 Sessions */}
            {recentSessions.length > 0 && (
              <div className="space-y-1 mt-4">
                <div className="px-1 text-xs font-semibold text-[#8e94aa] mb-2">
                  {t('workspace.agent.groups.recent', '最近')}
                </div>
                {recentSessions.map(renderSessionItem)}
              </div>
            )}

            {pinnedSessions.length === 0 && recentSessions.length === 0 && (
              <div className="py-8 text-center text-xs text-[#a0a5ba]">
                {t('blog.agent.noConversations', '暂无会话记录')}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Toggle Arrow Button */}
      <button
        type="button"
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="absolute top-1/2 -translate-y-1/2 z-30 flex h-8 w-5 items-center justify-center rounded-r-lg border border-[#ececf4] bg-white text-[#7771ed] transition-all hover:bg-[#f5f2ff]"
        style={{ left: drawerOpen ? '310px' : '0px' }}
        title={drawerOpen ? t('workspace.agent.collapseDrawer', '收起对话框') : t('workspace.agent.expandDrawer', '展开对话框')}
        aria-label={drawerOpen ? t('workspace.agent.collapseDrawer', '收起对话框') : t('workspace.agent.expandDrawer', '展开对话框')}
      >
        {drawerOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Main Chat Content Area */}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#fdfdfe]">
        {/* Top Right Header Controls */}
        <header className="flex h-12 shrink-0 items-center justify-end px-5">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-[#8e94aa] hover:bg-[#f5f4fb] hover:text-[#5f6286] transition-colors"
            title="Layout"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </header>

        {(reconnecting || errorMessage) && (
          <div
            className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-semibold ${
              errorMessage
                ? 'border-danger/20 bg-danger/5 text-danger'
                : 'border-border bg-surface-muted text-ink-secondary'
            }`}
          >
            {errorMessage ? <AlertCircle className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span className="truncate">{errorMessage || (reconnecting ? t('blog.agentChat.reconnecting') : '')}</span>
          </div>
        )}

        {messages.length === 0 && steps.length === 0 && !loading ? (
          /* Empty / Welcome State */
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-12 pt-4 text-center">
            {/* Workbench hero orb graphic */}
            <div className="relative mb-4 flex items-center justify-center">
              <img
                src="/assets/workspace/home/hero-orb.svg"
                alt=""
                className="h-28 w-28 object-contain transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Greeting */}
            <h1 className="text-2xl font-bold text-[#111426] sm:text-3xl">
              {t('workspace.home.welcome', '欢迎回来，')}{' '}
              <span className="text-[#6765f6]">{displayName}</span>
            </h1>

            <p className="mt-2 text-sm text-[#8b91a9]">
              {t('workspace.agent.subtitle', '你的 AI 智能体伙伴，随时为你提供专业、可靠的帮助')}
            </p>

            {/* Workbench Input Container */}
            <div className="mt-8 w-full max-w-2xl px-2">
              <div className="relative rounded-[1.75rem] border border-[#e5e7f2] bg-white p-3 shadow-[0_4px_20px_rgba(103,101,246,0.04)] focus-within:border-[#817bf2] focus-within:ring-2 focus-within:ring-[#817bf2]/20 transition-all">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-2 pb-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.url} className="group relative">
                        {attachment.contentType.startsWith('image/') ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="h-16 w-16 rounded-xl border border-[#e5e7f2] object-cover"
                          />
                        ) : (
                          <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e7f2] px-3 text-xs text-[#242741]">
                            <FileText className="h-4 w-4 text-[#8e94aa]" />
                            <span className="truncate max-w-40">{attachment.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setAttachments((current) => current.filter((a) => a.url !== attachment.url))}
                          className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#111426] text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={locked || uploadingAttachments}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6] disabled:opacity-50"
                    title={t('blog.agentChat.addAttachment', '添加附件')}
                  >
                    {uploadingAttachments ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.txt,.md,.json,.html,.xml,.doc,.docx,.rtf,.odt,.ppt,.pptx,.csv,.xls,.xlsx,.tsv,.java,.js,.jsx,.ts,.tsx,.py,.css"
                    onChange={(event) => {
                      handleFilesSelected(Array.from(event.target.files || []));
                      event.target.value = '';
                    }}
                  />

                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={locked}
                    placeholder={
                      locked
                        ? t('blog.agentChat.inputLockedPlaceholder', '执行中，请稍候')
                        : t('workspace.agent.inputPlaceholder', '告诉 DinQor 你想做什么...')
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!locked && canSend) handleSubmit();
                      }
                    }}
                    className="min-h-[40px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#111426] outline-none placeholder:text-[#a0a5ba] disabled:opacity-60"
                  />

                  <button
                    type="button"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6]"
                    title="Voice input"
                  >
                    <Mic className="h-5 w-5" />
                  </button>

                  {isActive ? (
                    <button
                      type="button"
                      onClick={cancelTurn}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111426] text-white transition-colors hover:bg-[#2e334e]"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={locked || !canSend}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5d55fa] text-white transition-colors hover:bg-[#4d44f3] disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Chips below Input Bar */}
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInput(t('workspace.agent.actions.generateImage', '生成图片'))}
                  className="flex items-center gap-2 rounded-xl border border-[#ececf4] bg-white px-3.5 py-2 text-xs font-semibold text-[#33364d] transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-50 text-emerald-500">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>{t('workspace.agent.actions.generateImage', '生成图片')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInput(t('workspace.agent.actions.searchWeb', '搜索网页'))}
                  className="flex items-center gap-2 rounded-xl border border-[#ececf4] bg-white px-3.5 py-2 text-xs font-semibold text-[#33364d] transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-orange-50 text-orange-500">
                    <Globe className="h-3.5 w-3.5" />
                  </span>
                  <span>{t('workspace.agent.actions.searchWeb', '搜索网页')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInput(t('workspace.agent.actions.generatePractice', '生成练习'))}
                  className="flex items-center gap-2 rounded-xl border border-[#ececf4] bg-white px-3.5 py-2 text-xs font-semibold text-[#33364d] transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-blue-50 text-blue-500">
                    <PenLine className="h-3.5 w-3.5" />
                  </span>
                  <span>{t('workspace.agent.actions.generatePractice', '生成练习')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInput(t('workspace.agent.actions.importKnowledge', '导入知识'))}
                  className="flex items-center gap-2 rounded-xl border border-[#ececf4] bg-white px-3.5 py-2 text-xs font-semibold text-[#33364d] transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-purple-50 text-purple-500">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  <span>{t('workspace.agent.actions.importKnowledge', '导入知识')}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Stream State */
          <>
            <div
              ref={chatScrollRef}
              onScroll={(event) => {
                const element = event.currentTarget;
                stickToBottomRef.current =
                  element.scrollHeight - element.scrollTop - element.clientHeight < 96;
              }}
              className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 sm:px-8"
            >
              {loading && !creating && !running && steps.length === 0 && messages.length === 0 ? (
                <div className="flex h-full min-h-48 items-center justify-center">
                  <LoadingSpinner fullScreen={false} text={t('blog.agentChat.restoring')} />
                </div>
              ) : (
                <div className="mx-auto flex max-w-3xl flex-col gap-5">
                  {messages.map((message) => {
                    if (message.role === 'user') {
                      return (
                        <ConversationMessage
                          key={message.id}
                          role="user"
                          content={message.content}
                          attachments={message.attachments}
                        />
                      );
                    }
                    if (message.kind === 'thought') {
                      return <ThoughtCard key={message.id} content={message.content} />;
                    }
                    if (message.kind === 'reflection') {
                      return <ReflectionCard key={message.id} content={message.content} />;
                    }
                    if (message.kind === 'tool_result') {
                      const result = imageToolResult(message);
                      return result ? (
                        <ImageToolResult key={message.id} url={result.url} title={result.title} />
                      ) : null;
                    }
                    if (message.kind === 'answer' || message.kind === 'message') {
                      if (containsResultUrl(message.content, historicalImageUrls)) return null;
                      return (
                        <ConversationMessage
                          key={message.id}
                          role="assistant"
                          content={message.content}
                        />
                      );
                    }
                    return null;
                  })}
                  {steps.map((step, index) => {
                    if (step.type === 'user')
                      return (
                        <ConversationMessage
                          key={`live-${index}`}
                          role="user"
                          content={step.content}
                          attachments={step.attachments}
                        />
                      );
                    if (step.type === 'thought')
                      return <ThoughtCard key={`live-${index}`} content={step.content} />;
                    if (step.type === 'plan')
                      return <PlanCard key={`live-${index}`} items={step.items} />;
                    if (step.type === 'reflection')
                      return (
                        <ReflectionCard
                          key={`live-${index}`}
                          content={step.content}
                          round={step.round}
                        />
                      );
                    if (step.type === 'tool') {
                      if (step.tool === IMAGE_TOOL && step.phase === 'end' && step.result?.url) {
                        return (
                          <ImageToolResult
                            key={`live-${index}`}
                            url={step.result.url}
                            title={step.result.title}
                          />
                        );
                      }
                      return null;
                    }
                    if (step.type === 'answer' || step.type === 'answer_delta') {
                      if (containsResultUrl(step.content, liveImageUrls)) return null;
                      return (
                        <ConversationMessage
                          key={`live-${index}`}
                          role="assistant"
                          content={step.content}
                          isStreaming={step.type === 'answer_delta'}
                        />
                      );
                    }
                    if (step.type === 'error') {
                      return (
                        <div
                          key={`live-${index}`}
                          className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{step.message}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {activeImageGeneration ? (
                    <ImageToolProgressPanel message={activeImageGeneration.message} />
                  ) : null}
                  {(isActive || creating || (loading && steps.length > 0)) &&
                    !streamingAnswer &&
                    !activeImageGeneration && (
                      <ThinkingIndicator label={t('blog.agentChat.thinking')} />
                    )}
                  <div ref={chatEndRef} className="h-2" />
                </div>
              )}
            </div>

            {/* Bottom Input Bar for Active Chat */}
            <div className="shrink-0 bg-gradient-to-t from-[#fdfdfe] via-[#fdfdfe]/90 to-transparent p-4">
              <div className="mx-auto w-full max-w-3xl">
                <div className="relative rounded-[1.75rem] border border-[#e5e7f2] bg-white p-3 shadow-[0_4px_20px_rgba(103,101,246,0.04)] focus-within:border-[#817bf2] focus-within:ring-2 focus-within:ring-[#817bf2]/20 transition-all">
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2 pb-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.url} className="group relative">
                          {attachment.contentType.startsWith('image/') ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="h-16 w-16 rounded-xl border border-[#e5e7f2] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e7f2] px-3 text-xs text-[#242741]">
                              <FileText className="h-4 w-4 text-[#8e94aa]" />
                              <span className="truncate max-w-40">{attachment.name}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setAttachments((current) => current.filter((a) => a.url !== attachment.url))
                            }
                            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#111426] text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={locked || uploadingAttachments}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6] disabled:opacity-50"
                      title={t('blog.agentChat.addAttachment', '添加附件')}
                    >
                      {uploadingAttachments ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Paperclip className="h-5 w-5" />
                      )}
                    </button>

                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={locked}
                      placeholder={
                        locked
                          ? t('blog.agentChat.inputLockedPlaceholder', '执行中，请稍候')
                          : t('workspace.agent.inputPlaceholder', '告诉 DinQor 你想做什么...')
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!locked && canSend) handleSubmit();
                        }
                      }}
                      className="min-h-[40px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#111426] outline-none placeholder:text-[#a0a5ba] disabled:opacity-60"
                    />

                    <button
                      type="button"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6]"
                    >
                      <Mic className="h-5 w-5" />
                    </button>

                    {isActive ? (
                      <button
                        type="button"
                        onClick={cancelTurn}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111426] text-white transition-colors hover:bg-[#2e334e]"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={locked || !canSend}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5d55fa] text-white transition-colors hover:bg-[#4d44f3] disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1.5 text-center text-micro text-[#a0a5ba]">
                  {t('blog.agentChat.multiTurnHint', 'DinQor 也会犯错，请注意甄别。')}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 复用项目通用 Modal 组件实现的搜索弹窗 */}
      <Modal
        isOpen={searchOpen}
        onClose={closeSearchModal}
        title={t('blog.agentChat.searchPlaceholder', '搜索会话')}
        width="max-w-lg"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-[#ececf4] bg-[#f9f9fc] px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-[#8e94aa]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('blog.agentChat.searchPlaceholder', '搜索会话...')}
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111426] outline-none placeholder:text-[#a0a5ba]"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4 text-[#8e94aa] hover:text-[#111426]" />
              </button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <div className="px-1 py-1 text-xs font-semibold text-[#8e94aa]">
              {t('blog.agentChat.recentChats', '最近聊天')}
            </div>
            {searchFilteredSessions.length > 0 ? (
              searchFilteredSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    closeSearchModal();
                    navigate(`/workspace/ai/${session.id}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[#f2f1fd]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f0effe] text-[#6055f6]">
                    <CheckSquare className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[#111426]">
                      {session.title || t('blog.agent.untitled', '未命名对话')}
                    </div>
                    {(session.lastMessage || session.summary) && (
                      <div className="truncate text-xs text-[#8e94aa]">
                        {session.lastMessage || session.summary}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#8e94aa]">
                {searchQuery
                  ? t('blog.agentChat.searchNoMatches', '没有找到匹配的会话')
                  : t('blog.agentChat.noSessions', '暂无会话记录')}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkspaceAgentChat;
