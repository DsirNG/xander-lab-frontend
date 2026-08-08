import React from 'react';
import { ArrowLeft, Bot, MessageSquareText, Plus } from 'lucide-react';

/**
 * 博客 Agent 页顶栏：返回、标题、会话与新建任务
 */
const AgentHeader = ({ t, onBack, onNewTask, onOpenSessions }) => {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-canvas/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('blog.agent.back')}
      </button>
      <div className="flex items-center gap-2 text-sm font-black tracking-tight">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
          <Bot className="h-4 w-4" />
        </span>
        {t('blog.agent.title')}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onOpenSessions} className="rounded-xl p-2 text-ink-muted hover:bg-surface-muted lg:hidden" aria-label={t('blog.agent.conversations')}>
          <MessageSquareText className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('blog.agent.newTask')}</span>
        </button>
      </div>
    </header>
  );
};

export default AgentHeader;
