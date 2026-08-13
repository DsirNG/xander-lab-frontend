import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from '@components/common/SyntaxHighlighter';
import HtmlSandboxPreview from '@components/common/HtmlSandboxPreview';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Check, FileCode2, Play } from 'lucide-react';

const PREVIEWABLE_LANGUAGES = new Set(['html', 'htm', 'svg']);

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
    appearance = 'default',
}) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [mode, setMode] = useState(defaultMode === 'preview' ? 'preview' : 'code');

    const resolvedCode = code != null ? code : String(children ?? '').replace(/\n$/, '');
    const normalizedLanguage = String(language || 'text').toLowerCase();
    const canPreview = PREVIEWABLE_LANGUAGES.has(normalizedLanguage);
    const activeMode = canPreview ? mode : 'code';
    const languageLabel = normalizedLanguage.toUpperCase();
    const isConversation = appearance === 'conversation';

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
        <div className={`overflow-hidden border border-border bg-canvas ${
            isConversation ? 'rounded-3xl shadow-none' : 'rounded-2xl shadow-sm'
        } ${className || ''}`}>
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
                    <HtmlSandboxPreview
                        code={resolvedCode}
                        language={normalizedLanguage}
                        minHeight={280}
                        maxHeight={600}
                        title={t('common.codeBlock.previewFrame', { language: languageLabel })}
                    />
                </div>
            ) : (
                <div className={`max-h-[600px] overflow-auto ${isConversation ? 'bg-surface' : 'bg-[#1e1e1e]'}`}>
                    <SyntaxHighlighter
                        language={normalizedLanguage === 'htm' ? 'html' : normalizedLanguage}
                        style={isConversation ? oneLight : vscDarkPlus}
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
