import React from 'react';
import { MessageSquareText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';

const AgentSessionList = ({ sessions, activeId, loading, disableNew = false, mobile = false, onSelect, onNew }) => {
  const { t } = useTranslation();

  return (
    <aside className={`${mobile ? 'flex h-full w-72 max-w-[calc(100vw-5rem)]' : 'hidden min-h-0 w-64 lg:flex'} shrink-0 flex-col border-r border-border bg-canvas`}>
      <div className="p-3">
        <Button
          type="button"
          onClick={onNew}
          disabled={disableNew}
          variant="ink"
          size="sm"
          icon={Plus}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-black transition hover:bg-accent disabled:cursor-wait disabled:opacity-50"
        >
          {t('blog.agent.newConversation')}
        </Button>
      </div>
      <div className="border-t border-border px-3 py-2 text-caption font-black uppercase tracking-widest text-ink-faint">
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
            className={`mb-1 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-wait disabled:opacity-50 ${
              String(activeId) === String(session.id) ? 'bg-accent/10 text-accent' : 'text-ink-secondary hover:bg-surface'
            }`}
          >
            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{session.title || t('blog.agent.untitled')}</span>
              <span className="mt-0.5 block truncate text-caption opacity-60">{session.input}</span>
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
