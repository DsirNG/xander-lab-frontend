import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle, ArrowLeft, Bot, CheckCircle2, Loader2, MessageSquareText, Plus,
  Send, Sparkles, Wrench, X,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AgentSessionList from '@/features/blog/components/agent/AgentSessionList';
import AgentChatMessage from '@/features/blog/components/agent/AgentChatMessage';
import { useAgentConversation, compactToolResult, toolCallSummary } from '../hooks/useAgentConversation';

const ThoughtCard = ({ content }) => (
  <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
    <span className="whitespace-pre-wrap">{content}</span>
  </div>
);

const ToolStepCard = ({ step }) => {
  const { t } = useTranslation();
  if (step.phase === 'progress') {
    return (
      <div className="flex items-center gap-2 px-1 py-0.5 text-xs text-ink-muted">
        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-accent" />
        <span className="truncate">{step.message || t('blog.agentChat.working')}</span>
      </div>
    );
  }
  const isError = step.phase === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div className={`rounded-xl border px-3 py-2 ${isError ? 'border-danger/30 bg-danger/5' : 'border-border bg-canvas'}`}>
      <div className={`flex items-center gap-2 text-xs font-bold ${isError ? 'text-danger' : 'text-ink-secondary'}`}>
        <Wrench className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{step.tool || t('blog.agentChat.unknownTool')}</span>
        {step.phase === 'start' && <span className="ml-auto font-normal text-ink-faint">{t('blog.agentChat.running')}</span>}
        {step.phase === 'end' && <Icon className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        {step.phase === 'error' && <Icon className="ml-auto h-3.5 w-3.5 shrink-0" />}
      </div>
      {(step.result || step.error) && (
        <p className={`mt-1 whitespace-pre-wrap break-all text-xs leading-5 ${isError ? 'text-danger/90' : 'text-ink-muted'}`}>
          {compactToolResult(step.result ?? step.error)}
        </p>
      )}
    </div>
  );
};

const MessageBubble = ({ role, content }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 ${
      role === 'user' ? 'bg-accent text-white' : 'border border-border bg-canvas text-ink'
    }`}>
      {content}
    </div>
  </div>
);

const HistoricalToolCard = ({ message, t }) => {
  const { tool, payload } = toolCallSummary(message, t);
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
    </div>
  );
};

const AgentChatInputBar = ({ t, input, setInput, isActive, hasConversation, onSubmit }) => (
  <div className="shrink-0 border-t border-border bg-canvas px-4 py-3 sm:px-6">
    <div className="mx-auto max-w-2xl">
      {hasConversation && !isActive && <p className="mb-2 text-xs text-ink-muted">{t('blog.agentChat.multiTurnHint')}</p>}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent focus-within:bg-canvas focus-within:ring-4 focus-within:ring-accent/10">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isActive}
          rows={2}
          placeholder={isActive ? t('blog.agentChat.inputLockedPlaceholder') : t('blog.agentChat.inputPlaceholder')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (!isActive) onSubmit();
            }
          }}
          className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-ink-faint disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isActive || !input.trim()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-black text-white transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
        >
          {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isActive ? t('blog.agentChat.running') : t('blog.agentChat.send')}
        </button>
      </div>
    </div>
  </div>
);
  const AgentChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const toast = useToast();
  const [input, setInput] = useState('');
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const {
    sessions, sessionsLoading, conversation, messages, loading, running,
    reconnecting, errorMessage, liveSteps,
    sendMessage, createConversation, reset, loadSessions,
  } = useAgentConversation({ conversationId });

  useEffect(() => {
    if (conversationId) loadSessions();
  }, [conversationId, loadSessions]);

  const isActive = running || conversation?.status === 'running';

  const steps = useMemo(() => {
    if (liveSteps.length === 0) return [];
    return liveSteps;
  }, [liveSteps]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, steps.length, isActive]);

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.warning(t('blog.agentChat.inputRequired'));
      return;
    }
    if (!conversationId) {
      try {
        const detail = await createConversation(input);
        navigate(`/workspace/agent/${detail.conversation.id}`, { replace: true });
      } catch (error) {
        toast.error(error.message || t('blog.agentChat.sendFailed'));
      }
      setInput('');
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

  const statusLine = useMemo(() => {
    if (reconnecting) return t('blog.agentChat.reconnecting');
    if (isActive) return t('blog.agentChat.running');
    if (conversation?.status === 'failed') return conversation.errorMessage || t('blog.agentChat.failed');
    return t('blog.agentChat.ready');
  }, [reconnecting, isActive, conversation, t]);

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
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('blog.agent.newConversation')}</span>
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner fullScreen text={t('blog.agentChat.restoring')} />
      ) : (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <AgentSessionList
            sessions={sessions.map((session) => ({ ...session, input: session.title }))}
            activeId={conversationId}
            loading={sessionsLoading}
            disableNew={isActive}
            onSelect={(id) => navigate(`/workspace/agent/${id}`)}
            onNew={handleNewConversation}
          />
          {mobileSessionsOpen && (
            <div className="absolute inset-0 z-40 flex bg-ink/40 lg:hidden">
              <AgentSessionList
                mobile
                sessions={sessions.map((session) => ({ ...session, input: session.title }))}
                activeId={conversationId}
                loading={sessionsLoading}
                disableNew={isActive}
                onSelect={(id) => {
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

          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            {(reconnecting || errorMessage) && (
              <div className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-semibold ${
                errorMessage ? 'border-danger/20 bg-danger/5 text-danger' : 'border-accent/20 bg-accent/5 text-accent'
              }`}>
                {errorMessage ? <AlertCircle className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span className="truncate">{errorMessage || statusLine}</span>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.length === 0 && steps.length === 0 ? (
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
                      return <HistoricalToolCard key={message.id} message={message} t={t} />;
                    }
                    if (message.kind === 'answer' || message.kind === 'message') {
                      return <MessageBubble key={message.id} role="assistant" content={message.content} />;
                    }
                    return null;
                  })}
                  {steps.map((step, index) => {
                    if (step.type === 'thought') return <ThoughtCard key={`live-${index}`} content={step.content} />;
                    if (step.type === 'tool') return <ToolStepCard key={`live-${index}`} step={step} />;
                    if (step.type === 'answer') return <MessageBubble key={`live-${index}`} role="assistant" content={step.content} />;
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
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <AgentChatInputBar
              t={t}
              input={input}
              setInput={setInput}
              isActive={isActive}
              hasConversation={Boolean(conversation)}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      )}
    </div>
  );
};

export default AgentChat;