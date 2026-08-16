import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Bot, Image as ImageIcon, Loader2, MessageSquareText, Sparkles } from 'lucide-react';
import { get } from '@api';
import AgentMarkdown from '../components/AgentMarkdown';

const IMAGE_TOOL = 'image_generate';

const HistoricalToolCard = ({ message }) => {
  let toolName = '';
  let payload = {};
  try {
    const parsed = JSON.parse(message.content || '{}');
    toolName = parsed.tool || message.toolName || '';
    payload = parsed.args || parsed;
  } catch {
    toolName = message.toolName || '';
  }
  const isImageTool = toolName === IMAGE_TOOL;
  const imageUrl = isImageTool && message.kind === 'tool_result' ? payload.url : null;
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-xs">
      <div className="flex items-center gap-2 font-semibold text-ink-secondary">
        {isImageTool
          ? <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
          : <Sparkles className="h-3.5 w-3.5 text-ink-muted" />}
        <span>{isImageTool ? 'AI 图片生成' : (toolName || '工具调用')}</span>
      </div>
      {imageUrl && (
        <a href={imageUrl} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded-lg border border-border">
          <img src={imageUrl} alt={payload.title || ''} className="max-h-56 w-full object-cover" />
        </a>
      )}
      {Object.keys(payload).length > 0 && message.kind !== 'tool_result' && (
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-ink-muted">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
};

const ConversationMessage = ({ role, content }) => (
  <div className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={role === 'user'
      ? 'max-w-[85%] rounded-3xl bg-surface-muted px-4 py-2.5 text-sm leading-6 text-ink sm:max-w-[75%]'
      : 'w-full min-w-0 py-1 text-sm leading-6 text-ink'}>
      {role === 'user' ? (
        <span className="whitespace-pre-wrap">{content}</span>
      ) : (
        <AgentMarkdown content={content} />
      )}
    </div>
  </div>
);

const AgentSharedView = () => {
  const { t } = useTranslation();
  const { shareToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!shareToken) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    get(`/api/agent/conversations/shared/${shareToken}`, { _silent: true, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setConversation(data.conversation);
        setMessages(data.messages || []);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.code === 'ERR_CANCELED') return;
        setError(err.message || t('blog.agentChat.loadFailed', '加载失败'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [shareToken, t]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
        <Bot className="h-5 w-5 text-accent" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-ink">{conversation?.title || 'DinQorGPT'}</h1>
        </div>
        <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-muted">
          {t('blog.agent.sharedView', '分享的对话')}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => {
            if (message.role === 'user') {
              return <ConversationMessage key={message.id} role="user" content={message.content} />;
            }
            if (message.kind === 'thought') {
              return (
                <div key={message.id} className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  <span className="whitespace-pre-wrap">{message.content}</span>
                </div>
              );
            }
            if (message.kind === 'tool_call' || message.kind === 'tool_result') {
              return <HistoricalToolCard key={message.id} message={message} />;
            }
            if (message.kind === 'answer' || message.kind === 'message') {
              return <ConversationMessage key={message.id} role="assistant" content={message.content} />;
            }
            return null;
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-canvas px-4 py-3 text-center text-xs text-ink-muted">
        {t('shared.readOnly', '此链接仅供查看，无法继续对话')}
      </div>
    </div>
  );
};

export default AgentSharedView;
