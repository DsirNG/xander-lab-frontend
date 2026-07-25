import React, { useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Check, FileCode2, Play } from 'lucide-react';

const PREVIEWABLE_LANGUAGES = new Set(['html', 'htm', 'svg']);

const looksLikeFullDocument = (code) => (
    /^\s*(<!doctype\s+html|<html\b)/i.test(code)
);

const buildPreviewSrcDoc = (code, language) => {
    const raw = String(code || '');
    const lang = String(language || '').toLowerCase();

    if (lang === 'svg' && !/<svg[\s>]/i.test(raw)) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
            html,body{margin:0;padding:16px;background:#fff;font-family:system-ui,sans-serif}
            .wrap{display:grid;place-items:center;min-height:100%}
          </style></head><body><div class="wrap"><svg xmlns="http://www.w3.org/2000/svg">${raw}</svg></div></body></html>`;
    }

    if (lang === 'svg' && /<svg[\s>]/i.test(raw) && !looksLikeFullDocument(raw)) {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
            html,body{margin:0;padding:16px;background:#fff}
            .wrap{display:grid;place-items:center;min-height:100%}
            svg{max-width:100%;height:auto}
          </style></head><body><div class="wrap">${raw}</div></body></html>`;
    }

    if (looksLikeFullDocument(raw)) {
        return raw;
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body {
      margin: 0;
      padding: 16px;
      background: #fff;
      color: #0f172a;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
    }
  </style>
</head>
<body>
${raw}
</body>
</html>`;
};

/**
 * Shared code display with syntax highlighting, copy, and optional live preview.
 * Preview is available for html / htm / svg.
 */
const CodeBlock = memo(({
    code,
    children,
    language = 'javascript',
    className,
    defaultMode = 'code',
}) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [mode, setMode] = useState(defaultMode === 'preview' ? 'preview' : 'code');

    const resolvedCode = code != null ? code : String(children ?? '').replace(/\n$/, '');
    const normalizedLanguage = String(language || 'text').toLowerCase();
    const canPreview = PREVIEWABLE_LANGUAGES.has(normalizedLanguage);
    const activeMode = canPreview ? mode : 'code';
    const languageLabel = normalizedLanguage.toUpperCase();

    const previewSrcDoc = useMemo(() => {
        if (!canPreview) return '';
        return buildPreviewSrcDoc(resolvedCode, normalizedLanguage);
    }, [canPreview, normalizedLanguage, resolvedCode]);

    const handleCopy = async () => {
        if (!resolvedCode) return;
        try {
            await navigator.clipboard.writeText(resolvedCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard may be unavailable
        }
    };

    return (
        <div className={`overflow-hidden rounded-2xl border border-border bg-canvas shadow-sm ${className || ''}`}>
            <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2">
                <div className="flex min-w-0 items-center gap-1.5 text-ink-secondary">
                    <FileCode2 className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                    <span className="truncate text-caption font-bold tracking-wide">
                        {languageLabel}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => setMode('code')}
                        className={`grid h-7 w-7 place-items-center rounded-full transition ${
                            activeMode === 'code'
                                ? 'bg-border/70 text-ink'
                                : 'text-ink-faint hover:bg-surface-muted hover:text-ink-secondary'
                        }`}
                        title={t('common.codeBlock.showCode')}
                        aria-label={t('common.codeBlock.showCode')}
                        aria-pressed={activeMode === 'code'}
                    >
                        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    {canPreview ? (
                        <button
                            type="button"
                            onClick={() => setMode('preview')}
                            className={`grid h-7 w-7 place-items-center rounded-full transition ${
                                activeMode === 'preview'
                                    ? 'bg-border/70 text-ink'
                                    : 'text-ink-faint hover:bg-surface-muted hover:text-ink-secondary'
                            }`}
                            title={t('common.codeBlock.showPreview')}
                            aria-label={t('common.codeBlock.showPreview')}
                            aria-pressed={activeMode === 'preview'}
                        >
                            <Play className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="grid h-7 w-7 place-items-center rounded-full text-ink-faint transition hover:bg-surface-muted hover:text-ink-secondary"
                        title={copied ? t('common.codeBlock.copied') : t('common.codeBlock.copy')}
                        aria-label={copied ? t('common.codeBlock.copied') : t('common.codeBlock.copy')}
                    >
                        {copied
                            ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                            : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {activeMode === 'preview' ? (
                <div className="bg-canvas">
                    <iframe
                        title={t('common.codeBlock.previewFrame', { language: languageLabel })}
                        srcDoc={previewSrcDoc}
                        sandbox="allow-scripts allow-forms"
                        className="block min-h-[280px] w-full border-0 bg-canvas"
                        style={{ height: '420px' }}
                    />
                </div>
            ) : (
                <div className="overflow-auto bg-[#1e1e1e] max-h-[600px]">
                    <SyntaxHighlighter
                        language={normalizedLanguage === 'htm' ? 'html' : normalizedLanguage}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: '1.25rem 1.5rem',
                            fontSize: '0.875rem',
                            background: 'transparent',
                            lineHeight: '1.6',
                        }}
                        showLineNumbers
                    >
                        {resolvedCode}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
