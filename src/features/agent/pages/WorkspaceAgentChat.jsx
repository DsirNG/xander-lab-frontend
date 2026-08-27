import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  FileText,
  Loader2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import { useAgentConversation } from '../hooks/useAgentConversation';
import { agentConversationService, parseToolPayload } from '../services/agentConversationService';
import AgentMarkdown from '../components/AgentMarkdown';
import AgentComposer from '../components/AgentComposer';
import WorkspaceAgentSidebar from '../components/WorkspaceAgentSidebar';
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
          ? 'max-w-[85%] rounded-3xl bg-[#f2f1fd] px-4 py-2.5 text-sm leading-6 text-black sm:max-w-[75%]'
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const canSend = Boolean(input.trim() || attachments.length) && !uploadingAttachments;

  return (
    <div className="relative flex h-full w-full min-w-0 overflow-hidden bg-[#fafafa]">
      <WorkspaceAgentSidebar
        open={drawerOpen}
        sessions={sessions}
        activeConversationId={conversationId}
        locked={locked}
        onOpenChange={setDrawerOpen}
        onNewConversation={handleNewConversation}
        onSelectConversation={(sessionId) => navigate(`/workspace/ai/${sessionId}`)}
        t={t}
      />

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
                className="h-28 w-28 object-contain transition-transform duration-700"
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
              <AgentComposer
                input={input}
                attachments={attachments}
                locked={locked}
                uploadingAttachments={uploadingAttachments}
                canSend={canSend}
                isActive={isActive}
                fileInputRef={fileInputRef}
                textareaRef={textareaRef}
                showQuickActions
                onInputChange={setInput}
                onFilesSelected={handleFilesSelected}
                onRemoveAttachment={(url) =>
                  setAttachments((current) => current.filter((attachment) => attachment.url !== url))
                }
                onSubmit={handleSubmit}
                onCancel={cancelTurn}
                t={t}
              />
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
                <AgentComposer
                  input={input}
                  attachments={attachments}
                  locked={locked}
                  uploadingAttachments={uploadingAttachments}
                  canSend={canSend}
                  isActive={isActive}
                  fileInputRef={fileInputRef}
                  textareaRef={textareaRef}
                  onInputChange={setInput}
                  onFilesSelected={handleFilesSelected}
                  onRemoveAttachment={(url) =>
                    setAttachments((current) => current.filter((attachment) => attachment.url !== url))
                  }
                  onSubmit={handleSubmit}
                  onCancel={cancelTurn}
                  t={t}
                />
                <div className="mt-1.5 text-center text-micro text-[#a0a5ba]">
                  {t('blog.agentChat.multiTurnHint', 'DinQor 也会犯错，请注意甄别。')}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
};

export default WorkspaceAgentChat;
