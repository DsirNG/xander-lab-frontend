import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Loader2 } from 'lucide-react';

const STAGE_KEYS = ['analyze', 'research', 'write', 'illustrate', 'review'];

const formatDuration = (ms) => {
  const totalSec = Math.max(0, Math.floor((ms || 0) / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

/**
 * 可折叠的智能体处理过程：阶段列表 + 流式日志
 */
const AgentProcessPanel = ({
  status = 'running',
  stage,
  streamText = '',
  startedAt,
  endedAt,
  errorMessage,
  logs = [],
  defaultExpanded,
}) => {
  const { t } = useTranslation();
  const isRunning = status === 'running';
  const isFailed = status === 'failed';
  const [expanded, setExpanded] = useState(defaultExpanded ?? (isRunning || isFailed));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning || !startedAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRunning, startedAt]);

  const elapsedMs = startedAt
    ? (endedAt || now) - startedAt
    : null;
  const durationLabel = elapsedMs == null ? '' : formatDuration(elapsedMs);
  const stageIndex = Math.max(0, STAGE_KEYS.indexOf(stage));
  const visibleExpanded = isRunning || expanded;
  const title = isRunning
    ? (durationLabel
      ? t('blog.agent.processing', { duration: durationLabel })
      : t('blog.agent.running'))
    : isFailed
      ? t('blog.agent.processFailed')
      : (durationLabel
        ? t('blog.agent.processed', { duration: durationLabel })
        : t('blog.agent.processedDone'));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-canvas shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-ink-secondary transition hover:bg-surface"
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
        ) : (
          <ChevronRight className={`h-4 w-4 shrink-0 text-ink-faint transition ${visibleExpanded ? 'rotate-90' : ''}`} />
        )}
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </button>

      {visibleExpanded && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <ol className="space-y-3">
            {STAGE_KEYS.map((key, index) => {
              const done = !isRunning && !isFailed ? index <= stageIndex : index < stageIndex;
              const active = isRunning && index === stageIndex;
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
                    <p className="text-sm font-bold text-ink">{t(`blog.agent.stages.${key}`)}</p>
                    <p className="mt-0.5 text-caption leading-5 text-ink-muted">{t(`blog.agent.stageDescriptions.${key}`)}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {(logs.length > 0 || streamText || isRunning) && (
            <div className="max-h-56 space-y-1.5 overflow-auto rounded-xl bg-ink p-3 text-caption leading-6 text-border-strong">
              {logs.map((log, index) => <p key={`${log}-${index}`}><span className="mr-2 text-accent">●</span>{log}</p>)}
              {isRunning && logs.length === 0 && <p className="text-ink-faint">{t('blog.agent.waitingForStage')}</p>}
              {streamText && <p className="whitespace-pre-wrap break-words text-border-strong">{streamText}</p>}
            </div>
          )}

          {isFailed && (
            <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm leading-6 text-danger-fg">
              {errorMessage || t('blog.agent.failed')}
            </p>
          )}

          <p className="text-caption leading-5 text-ink-faint">{t('blog.agent.guardrail')}</p>
        </div>
      )}
    </div>
  );
};

export default AgentProcessPanel;
