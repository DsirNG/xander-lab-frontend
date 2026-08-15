import React from 'react';
import { Box, MessageSquareText, PenSquare, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';

const AgentSessionList = ({ sessions, activeId, loading, disableNew = false, mobile = false, onSelect, onNew, onGoHome }) => {
  const { t } = useTranslation();

  return (
    <aside className={`${mobile ? 'flex h-full w-72 max-w-[calc(100vw-5rem)]' : 'hidden min-h-0 w-[260px] lg:flex'} shrink-0 flex-col bg-surface`}>
      {/* Sidebar Header: Logo + Workspace Name */}
      <div className="flex h-14 shrink-0 items-center px-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-surface-muted"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">
            <Box className="h-4 w-4" />
          </div>
          <span className="text-sm font-black tracking-tight text-ink">{t('common.workspace', 'Xander Lab')}</span>
        </button>
      </div>

      <div className="px-3 pb-3 pt-2">
        <Button
          type="button"
          onClick={onNew}
          disabled={disableNew}
          variant="outline"
          size="sm"
          className="flex w-full items-center justify-between gap-2 rounded-xl border-transparent px-3 py-2 text-ink transition hover:bg-surface-muted disabled:cursor-wait disabled:opacity-50"
        >
          <span className="flex items-center gap-2 font-medium">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-canvas">
              <Box className="h-3.5 w-3.5 text-ink-secondary" />
            </div>
            {t('blog.agent.newConversation')}
          </span>
          <PenSquare className="h-4 w-4 text-ink-muted" />
        </Button>
      </div>
      
      <div className="px-5 py-2 text-xs font-semibold text-ink-muted">
        {t('blog.agent.conversations')}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading && !sessions.length ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-surface-muted" />)}
          </div>
        ) : sessions.length ? sessions.map((session) => (
          <Button
            key={session.id}
            type="button"
            onClick={() => onSelect(session.id)}
            variant="ghost"
            className={`group mb-0.5 flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition disabled:cursor-wait disabled:opacity-50 ${
              String(activeId) === String(session.id) ? 'bg-surface-muted text-ink' : 'text-ink-secondary hover:bg-surface-muted'
            }`}
          >
            <span className="min-w-0 flex-1 py-0.5">
              <span className="block truncate text-sm font-medium">{session.title || t('blog.agent.untitled')}</span>
              <span className="block truncate text-xs text-ink-faint group-hover:text-ink-muted">{session.input}</span>
            </span>
          </Button>
        )) : (
          <div className="px-3 py-6 text-center text-caption leading-5 text-ink-faint">{t('blog.agent.noConversations')}</div>
        )}
      </div>
    </aside>
  );
};

export default AgentSessionList;
