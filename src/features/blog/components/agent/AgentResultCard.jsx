import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

/**
 * 生成博客的可点击结果卡片，点击后打开右侧预览
 */
const AgentResultCard = ({ title, summary, selected = false, onSelect }) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
        selected
          ? 'border-accent bg-accent/5 shadow-sm ring-2 ring-accent/20'
          : 'border-border bg-canvas hover:border-accent/40 hover:bg-surface'
      }`}
    >
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
        <FileText className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-caption font-bold uppercase tracking-widest text-accent">
          {t('blog.agent.article')}
        </span>
        <span className="mt-1 block truncate text-sm font-black text-ink">
          {title || t('blog.agent.untitled')}
        </span>
        {summary && (
          <span className="mt-1 line-clamp-2 block text-caption leading-5 text-ink-muted">{summary}</span>
        )}
        <span className="mt-2 block text-caption font-semibold text-accent">
          {t('blog.agent.openPreview')}
        </span>
      </span>
    </button>
  );
};

export default AgentResultCard;
