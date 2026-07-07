import React, { useState, memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

/**
 * Shared code display component with syntax highlighting and copy button.
 *
 * Accepts either a `code` string prop or `children` (for react-markdown integration).
 * Each consumer provides its own section header above this component.
 */
const CodeBlock = memo(({ code, children, language = 'javascript', className }) => {
    const [copied, setCopied] = useState(false);

    const resolvedCode = code != null ? code : String(children).replace(/\n$/, '');

    const handleCopy = () => {
        if (!resolvedCode) return;
        navigator.clipboard.writeText(resolvedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative group rounded-2xl overflow-hidden border border-slate-200 bg-[#1e1e1e] shadow-xl ${className || ''}`}>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Copy code"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <div className="overflow-auto max-h-[600px]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        background: 'transparent',
                        lineHeight: '1.6',
                    }}
                    showLineNumbers={true}
                >
                    {resolvedCode}
                </SyntaxHighlighter>
            </div>
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
