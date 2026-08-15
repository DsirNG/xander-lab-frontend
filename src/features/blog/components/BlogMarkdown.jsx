import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/common/CodeBlock';

const markdownComponents = {
    /** 标题/段落统一渲染为 div + 排版 token，不使用 h1-h6 / p 标签。 */
    h1({ children, ...props }) { return <div className="mb-4 mt-8 text-display font-black tracking-tight text-ink" {...props}>{children}</div>; },
    h2({ children, ...props }) { return <div className="mb-3 mt-8 text-heading font-bold tracking-tight text-ink" {...props}>{children}</div>; },
    h3({ children, ...props }) { return <div className="mb-2 mt-6 text-title font-bold text-ink" {...props}>{children}</div>; },
    h4({ children, ...props }) { return <div className="mb-1 mt-4 text-body font-bold text-ink" {...props}>{children}</div>; },
    h5({ children, ...props }) { return <div className="mb-1 mt-4 text-body font-semibold text-ink" {...props}>{children}</div>; },
    h6({ children, ...props }) { return <div className="mb-1 mt-4 text-body font-semibold text-ink" {...props}>{children}</div>; },
    p({ children, ...props }) { return <div className="my-3 leading-relaxed text-ink-secondary" {...props}>{children}</div>; },
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        if (match) {
            return <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />;
        }
        return <code className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[0.85em] font-medium text-accent" {...props}>{children}</code>;
    },
    a({ href, children, ...props }) {
        const isExternal = href && (href.startsWith('http') || href.startsWith('//'));
        return <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:text-accent-fg hover:decoration-accent" {...props}>{children}</a>;
    },
    img({ src, alt, ...props }) {
        return (
            <figure className="my-6">
                <img src={src} alt={alt || ''} loading="lazy" decoding="async" className="w-full rounded-xl border border-border shadow-sm" {...props} />
                {alt && <figcaption className="mt-2 text-center text-caption text-ink-faint">{alt}</figcaption>}
            </figure>
        );
    },
    table({ children, ...props }) {
        return <div className="my-4 overflow-x-auto rounded-lg border border-border"><table {...props}>{children}</table></div>;
    },
    blockquote({ children, ...props }) {
        return <blockquote className="my-4 rounded-r-lg border-l-4 border-accent/50 bg-accent/5 py-2 pl-4 text-ink-secondary [&>div]:my-1" {...props}>{children}</blockquote>;
    },
};

const BlogMarkdown = ({ content, className = '' }) => (
    <div className={`prose prose-sm max-w-none break-words min-w-0 sm:prose-base prose-li:leading-relaxed prose-li:text-ink-secondary prose-strong:text-ink prose-li:my-0.5 prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content || ''}</ReactMarkdown>
    </div>
);

export default BlogMarkdown;
