/**
 * Studio 全屏页顶部栏：左上角 logo（点击返回上一页）+ 标题 + 右侧操作区。
 *
 * @module features/studio/components/StudioTopBar
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import useBack from '@/hooks/useBack';

const DEFAULT_BACK_LABEL = '返回 Studio';

export default function StudioTopBar({
  title,
  backLabel = DEFAULT_BACK_LABEL,
  showBack = true,
  fallbackTo = '/workspace/studio',
  children,
}) {
  const handleBack = useBack(fallbackTo);

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border bg-canvas px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          title={backLabel}
          aria-label={backLabel}
          className="shrink-0 rounded-lg transition-opacity hover:opacity-80"
        >
          <img
            src="/logo-512.png"
            alt="Xander Lab"
            className="h-8 w-8 rounded-lg object-cover"
          />
        </button>
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-caption font-bold text-ink-faint transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </button>
        )}
        <div className="h-5 w-px bg-border" />
        {title && <div className="min-w-0">{title}</div>}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
