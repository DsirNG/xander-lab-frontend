import React from 'react';
import { MessageSquareText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AgentSessionList = ({ sessions, activeId, loading, disabled = false, mobile = false, onSelect, onNew }) => {
  const { t } = useTranslation();

  return (
    <aside className={`${mobile ? 'flex h-full w-72' : 'hidden min-h-0 w-64 lg:flex'} shrink-0 flex-col border-r border-slate-200 bg-white`}>
      <div className="p-3">
        <button
          type="button"
          onClick={onNew}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-black text-white transition hover:bg-primary disabled:cursor-wait disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {t('blog.agent.newConversation')}
        </button>
      </div>
      <div className="border-t border-slate-100 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">
        {t('blog.agent.conversations')}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : sessions.length ? sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelect(session.id)}
            disabled={disabled}
            className={`mb-1 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-wait disabled:opacity-50 ${
              String(activeId) === String(session.id) ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{session.title || t('blog.agent.untitled')}</span>
              <span className="mt-0.5 block truncate text-xs opacity-60">{session.input}</span>
            </span>
          </button>
        )) : (
          <p className="px-3 py-6 text-center text-xs leading-5 text-slate-400">{t('blog.agent.noConversations')}</p>
        )}
      </div>
    </aside>
  );
};

export default AgentSessionList;
