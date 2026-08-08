import React from 'react';
import { Loader2, Send } from 'lucide-react';

/**
 * 博客 Agent 页聊天输入栏
 */
const AgentChatInput = ({ t, input, setInput, isTaskActive, hasFinishedTurn, inputLocked, onSubmit }) => {
  return (
    <div className="shrink-0 border-t border-border bg-canvas px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {hasFinishedTurn && <p className="mb-2 text-xs text-ink-muted">{t('blog.agent.multiTurnHint')}</p>}
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent focus-within:bg-canvas focus-within:ring-4 focus-within:ring-accent/10">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={inputLocked}
            rows={2}
            placeholder={inputLocked ? t('blog.agent.inputLockedPlaceholder') : t('blog.agent.inputPlaceholder')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (!inputLocked) onSubmit();
              }
            }}
            className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-ink-faint disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={inputLocked || !input.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-black text-white transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
          >
            {isTaskActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isTaskActive
              ? t('blog.agent.running')
              : hasFinishedTurn
                ? t('blog.agent.revise')
                : t('blog.agent.generate')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatInput;
