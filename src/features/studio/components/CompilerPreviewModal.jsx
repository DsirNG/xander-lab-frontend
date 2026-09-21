import React from "react";
import { ExternalLink, Loader2, X } from "lucide-react";

export default function CompilerPreviewModal({
    open,
    projectName,
    previewUrl,
    onClose,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-ink/60 p-2 backdrop-blur-sm sm:p-4">
            <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col overflow-hidden rounded-lg bg-canvas shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <div className="min-w-0">
                        <div className="text-caption font-bold uppercase tracking-widest text-ink-faint">
                            Preview
                        </div>
                        <div className="truncate text-body font-black text-ink">
                            {projectName}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-caption font-bold text-ink-muted transition-colors hover:text-accent"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            新窗口
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                            aria-label="关闭预览"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="relative flex-1">
                    {previewUrl ? (
                        <iframe
                            src={previewUrl}
                            title="项目预览"
                            className="absolute inset-0 h-full w-full border-0 bg-canvas"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface">
                            <Loader2 className="h-10 w-10 animate-spin text-accent" />
                            <div className="text-body font-medium text-ink-muted">
                                正在加载预览...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
