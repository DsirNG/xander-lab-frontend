import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/common/CodeBlock';

const markdownComponents = {
  code({ className, children, ...props }) {
    const match = /language-([\w-]+)/.exec(className || '');
    if (match) {
      return <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />;
    }
    return (
      <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-accent" {...props}>
        {children}
      </code>
    );
  },
  a({ href, children, ...props }) {
    const external = /^(https?:)?\/\//i.test(href || '');
    return (
      <a
        href={href}
        className="font-semibold text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  table({ children, ...props }) {
    return <div className="my-3 overflow-x-auto rounded-lg border border-border"><table {...props}>{children}</table></div>;
  },
  blockquote({ children, ...props }) {
    return <blockquote className="border-l-4 border-accent/40 pl-3 text-ink-muted" {...props}>{children}</blockquote>;
  },
};

const AgentMarkdown = memo(({ content }) => (
  <div className="prose prose-sm max-w-none break-words prose-headings:mb-2 prose-headings:mt-4 prose-headings:font-bold prose-headings:text-ink prose-p:my-2 prose-p:leading-6 prose-p:text-ink-secondary prose-li:my-0.5 prose-li:text-ink-secondary prose-strong:text-ink prose-pre:my-3 prose-pre:bg-transparent prose-pre:p-0 prose-table:text-sm">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content || ''}
    </ReactMarkdown>
  </div>
));

AgentMarkdown.displayName = 'AgentMarkdown';

export default AgentMarkdown;
