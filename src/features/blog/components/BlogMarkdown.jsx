import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/common/CodeBlock';

const markdownComponents = {
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        if (match) {
            return <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />;
        }
        return <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.85em] font-medium text-primary" {...props}>{children}</code>;
    },
    a({ href, children, ...props }) {
        const isExternal = href && (href.startsWith('http') || href.startsWith('//'));
        return <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dark hover:decoration-primary" {...props}>{children}</a>;
    },
    img({ src, alt, ...props }) {
        return (
            <figure className="my-6">
                <img src={src} alt={alt || ''} loading="lazy" decoding="async" className="w-full rounded-xl border border-slate-200 shadow-sm" {...props} />
                {alt && <figcaption className="mt-2 text-center text-xs text-slate-400">{alt}</figcaption>}
            </figure>
        );
    },
    table({ children, ...props }) {
        return <div className="my-4 overflow-x-auto rounded-lg border border-slate-200"><table {...props}>{children}</table></div>;
    },
    blockquote({ children, ...props }) {
        return <blockquote className="my-4 rounded-r-lg border-l-4 border-primary/50 bg-primary/5 py-2 pl-4 text-slate-600 [&>p]:my-1" {...props}>{children}</blockquote>;
    },
};

const BlogMarkdown = ({ content, className = '' }) => (
    <div className={`prose prose-slate prose-sm max-w-none sm:prose-base prose-headings:font-bold prose-headings:tracking-tight prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-lg prose-li:leading-relaxed prose-p:leading-relaxed prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content || ''}</ReactMarkdown>
    </div>
);

export default BlogMarkdown;
