import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle, ArrowLeft, Bot, CheckCircle2, FileText, Loader2, MessageSquareText, Plus,
  Send, Sparkles, Square, Wrench, X,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AgentSessionList from '@/features/blog/components/agent/AgentSessionList';
import AgentChatMessage from '@/features/blog/components/agent/AgentChatMessage';
import AgentPreviewPanel from '@/features/blog/components/agent/AgentPreviewPanel';
import { blogAgentService } from '@/features/blog/services/blogAgentService';
import useIsMobile from '@/hooks/useIsMobile';
import { useAgentConversation, compactToolResult, toolCallSummary } from '../hooks/useAgentConversation';
import AgentMarkdown from '../components/AgentMarkdown';

const ThoughtCard = ({ content }) => (
  <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
    <span className="whitespace-pre-wrap">{content}</span>
  </div>
);

const BLOG_STAGES = ['analyze', 'research', 'write', 'illustrate', 'review'];

/** 工具执行中的分步进度面板：阶段列表 + 实时日志（对齐 blog-tool 的 AgentProcessPanel）。 */
const ToolProgressPanel = ({ logs, stage, draft = '' }) => {
  const { t } = useTranslation();
  const stageIndex = BLOG_STAGES.indexOf(stage);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-canvas shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold text-ink-secondary">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
        <span className="truncate">{t('blog.agentChat.running')}</span>
      </div>
      <div className="space-y-4 px-4 py-4">
        <ol className="space-y-3">
          {BLOG_STAGES.map((key, index) => {
            const done = stageIndex >= 0 && index < stageIndex;
            const active = stageIndex >= 0 && index === stageIndex;
            return (
              <li key={key} className="flex gap-3">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${
                    done || active ? 'bg-accent text-white' : 'bg-surface-muted text-ink-faint'
                  }`}
                >
                  {done ? '✓' : active ? <Loader2 className="h-3 w-3 animate-spin" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${active ? 'text-accent' : 'text-ink'}`}>
                    {t(`blog.agent.stages.${key}`)}
                  </p>
                  <p className="mt-0.5 text-caption leading-5 text-ink-muted">
                    {t(`blog.agent.stageDescriptions.${key}`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        {logs.length > 0 && (
          <div className="max-h-40 space-y-1.5 overflow-auto rounded-xl bg-ink p-3 text-caption leading-6 text-border-strong">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`}><span className="mr-2 text-accent">●</span>{log}</p>
            ))}
          </div>
        )}
        {draft && (
          <p className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-surface-muted p-3 text-caption leading-6 text-ink-muted">
            {draft}
          </p>
        )}
      </div>
    </div>
  );
};

const ToolStepCard = ({ step, t, onViewBlog }) => {
  const isError = step.phase === 'error';
  const blogTaskId = step.result?.taskId;
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div className={`rounded-xl border px-3 py-2 ${isError ? 'border-danger/30 bg-danger/5' : 'border-border bg-canvas'}`}>
      <div className={`flex items-center gap-2 text-xs font-bold ${isError ? 'text-danger' : 'text-ink-secondary'}`}>
        <Wrench className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{step.tool || t('blog.agentChat.unknownTool')}</span>
        {step.phase === 'start' && <span className="ml-auto font-normal text-ink-faint">{t('blog.agentChat.running')}</span>}
        {step.phase === 'end' && <Icon className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        {isError && <Icon className="ml-auto h-3.5 w-3.5 shrink-0" />}
      </div>
      {(step.result || step.error) && (
        <p className={`mt-1 whitespace-pre-wrap break-all text-xs leading-5 ${isError ? 'text-danger/90' : 'text-ink-muted'}`}>
          {compactToolResult(step.result ?? step.error)}
        </p>
      )}
      {step.phase === 'end' && blogTaskId && (
        <button
          type="button"
          onClick={() => onViewBlog(blogTaskId)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-accent/10"
        >
          <FileText className="h-3.5 w-3.5" />
          {t('blog.agentChat.viewBlog')}
        </button>
      )}
    </div>
  );
};

const MessageBubble = ({ role, content }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-6 sm:max-w-[85%] ${
      role === 'user' ? 'bg-accent text-white' : 'border border-border bg-canvas text-ink'
    }`}>
      {role === 'user' ? <span className="whitespace-pre-wrap">{content}</span> : <AgentMarkdown content={content} />}
    </div>
  </div>
);

const ThinkingIndicator = ({ label }) => (
  <div className="flex justify-start" role="status" aria-live="polite">
    <div className="flex min-h-10 items-center gap-2 rounded-2xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink-muted shadow-sm">
      <Sparkles className="h-4 w-4 animate-pulse text-accent" aria-hidden="true" />
      <span>{label}</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: `${index * 140}ms` }}
          />
        ))}
      </span>
    </div>
  </div>
);

const HistoricalToolCard = ({ message, t, onViewBlog }) => {
  const { tool, payload } = toolCallSummary(message, t);
  const blogTaskId = message.kind === 'tool_result' ? payload?.taskId : null;
  return (
    <div className="rounded-xl border border-border bg-canvas px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-bold text-ink-secondary">
        <Wrench className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{tool}</span>
        <span className="ml-auto font-normal text-ink-faint">
          {message.kind === 'tool_call' ? t('blog.agentChat.toolCalled') : t('blog.agentChat.toolResult')}
        </span>
      </div>
      {message.kind === 'tool_result' && (
        <p className="mt-1 whitespace-pre-wrap break-all text-xs leading-5 text-ink-muted">
          {compactToolResult(payload ?? message.content)}
        </p>
      )}
      {blogTaskId && (
        <button
          type="button"
          onClick={() => onViewBlog(blogTaskId)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-accent/10"
        >
          <FileText className="h-3.5 w-3.5" />
          {t('blog.agentChat.viewBlog')}
        </button>
      )}
    </div>
  );
};

const AgentChatInputBar = ({ t, input, setInput, isActive, creating, hasConversation, onSubmit, onStop }) => {
  const locked = isActive || creating;
  return (
  <div className="shrink-0 border-t border-border bg-canvas px-4 py-3 sm:px-6">
    <div className="mx-auto max-w-2xl">
      {hasConversation && !isActive && <p className="mb-2 text-xs text-ink-muted">{t('blog.agentChat.multiTurnHint')}</p>}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent focus-within:bg-canvas focus-within:ring-4 focus-within:ring-accent/10">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={locked}
          rows={2}
          placeholder={locked ? t('blog.agentChat.inputLockedPlaceholder') : t('blog.agentChat.inputPlaceholder')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
            if (!locked) onSubmit();
            }
          }}
          className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-ink-faint disabled:opacity-60"
        />
        {isActive && (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 text-sm font-black text-danger transition hover:bg-danger/10"
          >
            <Square className="h-4 w-4" />
            {t('blog.agentChat.stop')}
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={locked || !input.trim()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-black text-white transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
        >
          {locked ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {locked ? t('blog.agentChat.running') : t('blog.agentChat.send')}
        </button>
      </div>
    </div>
  </div>
  );
};

const AgentChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const blogTaskId = searchParams.get('blogTaskId');
  const toast = useToast();
  const isMobile = useIsMobile(1024);
  const [input, setInput] = useState('');
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const [artifactData, setArtifactData] = useState(null);
  const [artifactLoading, setArtifactLoading] = useState(false);
  const [artifactError, setArtifactError] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const {
    sessions, sessionsLoading, conversation, messages, loading, creating, running,
    reconnecting, errorMessage, liveSteps,
    sendMessage, cancelTurn, createConversation, reset,
  } = useAgentConversation({ conversationId });

  useEffect(() => {
    if (!blogTaskId) {
      setArtifactData(null);
      setArtifactError(null);
      setArtifactLoading(false);
      setSelectedVersionId(null);
      return undefined;
    }
    const controller = new AbortController();
    setArtifactLoading(true);
    setArtifactError(null);
    setArtifactData(null);
    blogAgentService.getTask(blogTaskId, { _silent: true, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setArtifactData(data);
        setSelectedVersionId(data?.versions?.[0]?.id ?? null);
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === 'ERR_CANCELED') return;
        setArtifactError(error.message || t('blog.agent.failed'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setArtifactLoading(false);
      });
    return () => controller.abort();
  }, [blogTaskId, t]);

  const isActive = running || conversation?.status === 'running';

  const steps = useMemo(() => {
    if (liveSteps.length === 0) return [];
    return liveSteps;
  }, [liveSteps]);

  useEffect(() => {
    if (stickToBottomRef.current) chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages, steps]);

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.warning(t('blog.agentChat.inputRequired'));
      return;
    }
    if (!conversationId) {
      try {
        const detail = await createConversation(input);
        if (!detail?.conversation?.id) return;
        navigate(`/workspace/agent/${detail.conversation.id}`, { replace: true });
        setInput('');
      } catch (error) {
        toast.error(error.message || t('blog.agentChat.sendFailed'));
      }
      return;
    }
    const submitted = input.trim();
    setInput('');
    await sendMessage(submitted);
  };

  const handleNewConversation = () => {
    reset();
    setInput('');
    navigate('/workspace/agent', { replace: true });
  };

  const handleStop = () => cancelTurn();

  const handleViewBlog = (taskId) => {
    const next = new URLSearchParams(searchParams);
    next.set('blogTaskId', String(taskId));
    setSearchParams(next, { replace: true });
  };

  const handleCloseArtifact = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('blogTaskId');
    setSearchParams(next, { replace: true });
  };

  const handlePublishArtifact = async () => {
    if (!blogTaskId) return;
    setIsPublishing(true);
    try {
      // The task endpoint reconciles uncertain/repeated publish attempts by
      // returning the post already attached to this generated artifact.
      const post = await blogAgentService.publishTask(blogTaskId, { dedupe: false });
      setArtifactData((current) => current && ({
        ...current,
        task: { ...current.task, publishedPostId: post.id },
      }));
      toast.success(t('blog.publishSuccess'));
    } catch (error) {
      toast.error(error.message || t('blog.publishError'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateArtifactDraft = () => {
    const task = artifactData?.task;
    if (!task) return;
    const version = artifactData?.versions?.find(
      (item) => String(item.id) === String(selectedVersionId),
    );
    setIsSavingDraft(true);
    try {
      localStorage.setItem('xander-lab:blog-publish-draft', JSON.stringify({
        title: task.title,
        summary: version?.summary || task.summary,
        content: version?.content || task.content,
        categoryId: task.categoryId,
        tags: artifactData.tags || [],
      }));
      toast.success(t('blog.agent.draftCreated'));
      navigate('/workspace/publish');
    } catch (error) {
      toast.error(error.message || t('blog.agent.failed'));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const navigationLocked = loading || creating || isActive;

  const toolProgress = useMemo(() => {
    const tools = new Map();
    steps.forEach((step) => {
      if (step.type === 'tool' && step.phase === 'start') {
        tools.set(step.tool || 'tool', { tool: step.tool || 'tool', active: true, logs: [], stage: undefined, draft: '' });
      } else if (step.type === 'tool' && step.phase === 'progress') {
        const key = step.tool || 'tool';
        const state = tools.get(key) || { tool: key, active: true, logs: [], stage: undefined, draft: '' };
        state.active = true;
        state.stage = step.stage || state.stage;
        if (step.message) state.logs.push(step.message);
        tools.set(key, state);
      } else if (step.type === 'tool_delta') {
        const key = step.tool || 'tool';
        const state = tools.get(key) || { tool: key, active: true, logs: [], stage: undefined, draft: '' };
        state.active = true;
        state.draft = step.content;
        tools.set(key, state);
      } else if (step.type === 'tool' && (step.phase === 'end' || step.phase === 'error')) {
        const key = step.tool || 'tool';
        const state = tools.get(key);
        if (state) state.active = false;
      }
    });
    return [...tools.values()].filter((tool) => tool.active && (tool.logs.length || tool.draft));
  }, [steps]);

  const statusLine = useMemo(() => {
    if (reconnecting) return t('blog.agentChat.reconnecting');
    if (isActive) return t('blog.agentChat.running');
    if (conversation?.status === 'failed') return conversation.errorMessage || t('blog.agentChat.failed');
    return t('blog.agentChat.ready');
  }, [reconnecting, isActive, conversation, t]);

  const showArtifact = Boolean(blogTaskId);
  const artifactTask = artifactData?.task;
  const artifactStatusText = artifactTask?.status === 'failed'
    ? artifactTask.errorMessage || t('blog.agent.failed')
    : artifactTask?.status === 'ready'
      ? t('blog.agent.ready')
      : t('blog.agent.running');
  const artifactPanel = artifactLoading ? (
    <div className="flex h-full min-h-48 items-center justify-center bg-canvas">
      <LoadingSpinner fullScreen={false} text={t('blog.agent.restoring')} />
    </div>
  ) : artifactError ? (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <AlertCircle className="h-8 w-8 text-danger" />
      <p className="text-sm font-semibold text-danger">{artifactError}</p>
      <button
        type="button"
        onClick={handleCloseArtifact}
        className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-ink-secondary"
      >
        {t('common.close')}
      </button>
    </div>
  ) : (
    <AgentPreviewPanel
      taskData={artifactData}
      selectedVersionId={selectedVersionId}
      statusText={artifactStatusText}
      isPublishing={isPublishing}
      isSavingDraft={isSavingDraft}
      onPublish={handlePublishArtifact}
      onCreateDraft={handleCreateArtifactDraft}
      onViewPublished={() => artifactTask?.publishedPostId && navigate(`/blog/${artifactTask.publishedPostId}`)}
      onSelectVersion={setSelectedVersionId}
      onClose={handleCloseArtifact}
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-surface text-ink">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-canvas/95 px-4 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('blog.agentChat.back')}
        </button>
        <div className="flex min-w-0 items-center gap-2 text-sm font-black tracking-tight">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-white">
            <Bot className="h-4 w-4" />
          </span>
          <span className="truncate">{t('blog.agentChat.title')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileSessionsOpen(true)}
            className="rounded-xl p-2 text-ink-muted hover:bg-surface-muted lg:hidden"
            aria-label={t('blog.agent.conversations')}
          >
            <MessageSquareText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNewConversation}
            disabled={navigationLocked}
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('blog.agent.newConversation')}</span>
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <AgentSessionList
            sessions={sessions.map((session) => ({ ...session, input: session.title }))}
            activeId={conversationId}
            loading={sessionsLoading}
            disableNew={navigationLocked}
            onSelect={(id) => {
              if (!navigationLocked) navigate(`/workspace/agent/${id}`);
            }}
            onNew={handleNewConversation}
          />
          {mobileSessionsOpen && (
            <div className="absolute inset-0 z-40 flex bg-ink/40 lg:hidden">
              <AgentSessionList
                mobile
                sessions={sessions.map((session) => ({ ...session, input: session.title }))}
                activeId={conversationId}
                loading={sessionsLoading}
                disableNew={navigationLocked}
                onSelect={(id) => {
                  if (navigationLocked) return;
                  setMobileSessionsOpen(false);
                  navigate(`/workspace/agent/${id}`);
                }}
                onNew={() => {
                  setMobileSessionsOpen(false);
                  handleNewConversation();
                }}
              />
              <button
                type="button"
                onClick={() => setMobileSessionsOpen(false)}
                className="m-3 grid h-10 w-10 place-items-center rounded-full bg-canvas text-ink-secondary"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <section className={`flex min-h-0 min-w-0 flex-1 flex-col ${showArtifact && !isMobile ? 'lg:max-w-[48%]' : ''}`}>
            {(reconnecting || errorMessage) && (
              <div className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-semibold ${
                errorMessage ? 'border-danger/20 bg-danger/5 text-danger' : 'border-accent/20 bg-accent/5 text-accent'
              }`}>
                {errorMessage ? <AlertCircle className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span className="truncate">{errorMessage || statusLine}</span>
              </div>
            )}

            <div
              ref={chatScrollRef}
              onScroll={(event) => {
                const element = event.currentTarget;
                stickToBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 96;
              }}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            >
              {loading ? (
                <div className="flex h-full min-h-48 items-center justify-center">
                  <LoadingSpinner fullScreen={false} text={t('blog.agentChat.restoring')} />
                </div>
              ) : messages.length === 0 && steps.length === 0 ? (
                <div className="mx-auto flex max-w-xl flex-col items-start gap-4 pt-8 sm:pt-16">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{t('blog.agentChat.headline')}</h1>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{t('blog.agentChat.description')}</p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-2xl flex-col gap-3">
                  {messages.map((message) => {
                    if (message.role === 'user') {
                      return <AgentChatMessage key={message.id} content={message.content} />;
                    }
                    if (message.kind === 'thought') {
                      return <ThoughtCard key={message.id} content={message.content} />;
                    }
                    if (message.kind === 'tool_call' || message.kind === 'tool_result') {
                      return <HistoricalToolCard key={message.id} message={message} t={t} onViewBlog={handleViewBlog} />;
                    }
                    if (message.kind === 'answer' || message.kind === 'message') {
                      return <MessageBubble key={message.id} role="assistant" content={message.content} />;
                    }
                    return null;
                  })}
                  {steps.map((step, index) => {
                    if (step.type === 'user') return <MessageBubble key={`live-${index}`} role="user" content={step.content} />;
                    if (step.type === 'thought') return <ThoughtCard key={`live-${index}`} content={step.content} />;
                    if (step.type === 'tool') {
                      // progress 步骤由下方 ToolProgressPanel 聚合展示。
                      if (step.phase === 'progress') return null;
                      return <ToolStepCard key={`live-${index}`} step={step} t={t} onViewBlog={handleViewBlog} />;
                    }
                    if (step.type === 'answer' || step.type === 'answer_delta') {
                      return <MessageBubble key={`live-${index}`} role="assistant" content={step.content} />;
                    }
                    if (step.type === 'tool_delta') return null;
                    if (step.type === 'error') {
                      return (
                        <div key={`live-${index}`} className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{step.message}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {toolProgress.map((tool) => (
                    <ToolProgressPanel
                      key={tool.tool}
                      logs={tool.logs}
                      stage={tool.stage}
                      draft={tool.draft}
                    />
                  ))}
                  {isActive && steps.length === 0 && (
                    <ThinkingIndicator label={t('blog.agentChat.running')} />
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <AgentChatInputBar
              t={t}
              input={input}
              setInput={setInput}
              isActive={isActive}
              creating={creating}
              hasConversation={Boolean(conversation)}
              onSubmit={handleSubmit}
              onStop={handleStop}
            />
          </section>

          {showArtifact && !isMobile && (
            <aside className="hidden min-h-0 w-[52%] border-l border-border lg:block">
              {artifactPanel}
            </aside>
          )}

          {showArtifact && isMobile && (
            <div className="absolute inset-0 z-30 bg-canvas">
              {artifactPanel}
            </div>
          )}
      </div>
    </div>
  );
};

export default AgentChat;
