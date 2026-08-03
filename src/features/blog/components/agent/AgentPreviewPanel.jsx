import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpenCheck,
  ExternalLink,
  FileText,
  GitFork,
  ImageIcon,
  Layers,
  Loader2,
  Search,
  Send,
  X,
} from 'lucide-react';
import BlogMarkdown from '../BlogMarkdown';

const asArray = (value) => (Array.isArray(value) ? value : []);

/**
 * 右侧博客预览：正文 + 发布/编辑，以及可折叠的元信息
 */
const AgentPreviewPanel = ({
  taskData,
  selectedVersionId,
  statusText,
  isPublishing,
  isSavingDraft,
  onPublish,
  onCreateDraft,
  onViewPublished,
  onSelectVersion,
  onClose,
}) => {
  const { t } = useTranslation();
  const [metaOpen, setMetaOpen] = useState(false);
  const task = taskData?.task;
  const versions = asArray(taskData?.versions);
  const selectedVersion = versions.find((version) => String(version.id) === String(selectedVersionId));
  const article = selectedVersion || task;
  const isLatestVersion = !selectedVersion || String(selectedVersion.id) === String(versions[0]?.id);
  const contentBoundary = taskData?.contentBoundary || {};
  const knowledgeGraph = taskData?.knowledgeGraph || {};
  const graphNodes = asArray(knowledgeGraph.nodes);
  const graphEdges = asArray(knowledgeGraph.edges);
  const illustrations = asArray(taskData?.illustrations);
  const graphLabels = new Map(graphNodes.map((node) => [node.id, node.label || node.id]));

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-canvas px-6 text-center">
        <p className="text-sm font-semibold text-ink-muted">{t('blog.agent.previewEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">{t('blog.agent.article')}</p>
          <h2 className="mt-1 truncate text-lg font-black tracking-tight text-ink">
            {article.title || t('blog.agent.untitled')}
          </h2>
          {article.summary && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">{article.summary}</p>
          )}
          {versions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => onSelectVersion(version.id)}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                    String(selectedVersion?.id) === String(version.id)
                      ? 'bg-accent text-white'
                      : 'bg-surface text-ink-muted hover:bg-accent/10 hover:text-accent'
                  }`}
                  title={version.changeNote || version.createdAt}
                >
                  V{version.versionNo}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {task.publishedPostId ? (
            <button
              type="button"
              onClick={onViewPublished}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-xs font-black text-white"
            >
              {t('blog.agent.viewArticle')}
            </button>
          ) : (
            task.status === 'ready' && (
              <>
                {isLatestVersion && <button
                  type="button"
                  onClick={onCreateDraft}
                  disabled={isSavingDraft}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-black disabled:opacity-60"
                >
                  {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  {t('blog.agent.toDraft')}
                </button>}
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                >
                  {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {t('blog.agent.confirmPublish')}
                </button>
              </>
            )
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border text-ink-muted transition hover:bg-surface"
              aria-label={t('common.aria.close')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {article.content ? (
          <BlogMarkdown content={article.content} className="prose-headings:font-black" />
        ) : (
          <p className="text-sm text-ink-muted">{statusText}</p>
        )}

        <div className="mt-8 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setMetaOpen((value) => !value)}
            className="text-sm font-bold text-ink-secondary transition hover:text-accent"
          >
            {metaOpen ? t('blog.agent.hideMeta') : t('blog.agent.showMeta')}
          </button>

          {metaOpen && (
            <div className="mt-4 space-y-4">
              <section className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-sm font-black">
                  <Layers className="h-4 w-4 text-accent" />
                  {t('blog.agent.contentFocus')}
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-ink-muted">{t('blog.agent.mustCover')}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {asArray(contentBoundary.mustCover).map((item) => (
                        <span key={item} className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {asArray(contentBoundary.relatedExpansion).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-ink-muted">{t('blog.agent.relatedExpansion')}</p>
                      <p className="mt-1 text-xs leading-5 text-ink-secondary">
                        {asArray(contentBoundary.relatedExpansion).join('、')}
                      </p>
                    </div>
                  )}
                  {asArray(contentBoundary.outOfScope).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-ink-muted">{t('blog.agent.outOfScope')}</p>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">
                        {asArray(contentBoundary.outOfScope).join('、')}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {knowledgeGraph.enabled && graphNodes.length > 0 && (
                <section className="rounded-2xl border border-info/20 bg-info-soft/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-info-fg">
                    <GitFork className="h-4 w-4 text-info" />
                    {t('blog.agent.knowledgeGraph')}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-info-fg/70">{knowledgeGraph.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {graphNodes.map((node) => (
                      <span
                        key={node.id}
                        title={node.description}
                        className="rounded-lg border border-info/30 bg-canvas px-2 py-1 text-xs font-semibold text-info-fg"
                      >
                        {node.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2">
                    {graphEdges.map((edge, index) => (
                      <div
                        key={`${edge.from}-${edge.to}-${index}`}
                        className="rounded-lg bg-canvas/80 px-2.5 py-2 text-xs leading-5 text-info-fg"
                      >
                        <strong>{graphLabels.get(edge.from) || edge.from}</strong>
                        <span className="mx-1.5 text-info/60">→</span>
                        <span>{edge.relation}</span>
                        <span className="mx-1.5 text-info/60">→</span>
                        <strong>{graphLabels.get(edge.to) || edge.to}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(illustrations.length > 0 || task.illustrationStatus) && (
                <section className="rounded-2xl border border-info/20 bg-info-soft/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-info-fg">
                    <ImageIcon className="h-4 w-4 text-info" />
                    {t('blog.agent.illustrations')}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-info-fg/70">
                    {t(`blog.agent.illustrationStatuses.${task.illustrationStatus || 'none'}`)}
                  </p>
                  {illustrations.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {illustrations.map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={image.originalName}
                          className="aspect-[4/3] w-full rounded-xl bg-canvas object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                  {task.illustrationError && (
                    <p className="mt-3 text-xs leading-5 text-warning-fg">{task.illustrationError}</p>
                  )}
                </section>
              )}

              <section className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-sm font-black">
                  <Search className="h-4 w-4 text-accent" />
                  {t('blog.agent.sources')}
                </div>
                <div className="mt-3 space-y-3">
                  {taskData.sources?.length ? (
                    taskData.sources.map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl bg-canvas p-3 transition hover:bg-accent/5"
                      >
                        <p className="line-clamp-2 text-sm font-bold text-ink">{source.title}</p>
                        <p className="mt-1 text-xs text-ink-muted">{source.publisher || source.reliability}</p>
                        <ExternalLink className="mt-2 h-3.5 w-3.5 text-accent" />
                      </a>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-ink-muted">{t('blog.agent.noSources')}</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
                <div className="flex items-center gap-2 text-sm font-black text-warning-fg">
                  <BookOpenCheck className="h-4 w-4" />
                  {t('blog.agent.review')}
                </div>
                <p className="mt-3 text-sm leading-6 text-warning-fg/80">
                  {task.review || t('blog.agent.reviewPending')}
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentPreviewPanel;
