import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/common/CodeBlock';

/** 模型常把 Markdown 反引号写成 \` 转义，CommonMark 会把它渲染成裸反引号；这里还原为真正的反引号。 */
const normalizeAnswer = (text) => (
  typeof text === 'string' && text.includes('\\`') ? text.replace(/\\`/g, '`') : text
);

/** 标题统一渲染为 div + 排版 token（display/heading/title → 800，body → 400/600/700），不使用 h1-h6 标签。 */
const HEADING_CLASSES = {
  h1: 'mb-3 mt-4 text-display font-black text-ink',
  h2: 'mb-2 mt-4 text-heading font-black text-ink',
  h3: 'mb-2 mt-3 text-title font-bold text-ink',
  h4: 'mb-1 mt-2 text-body font-bold text-ink',
  h5: 'mb-1 mt-2 text-body font-semibold text-ink',
  h6: 'mb-1 mt-2 text-body font-semibold text-ink',
};

const createMarkdownComponents = (codeAppearance) => ({
  h1({ children, ...props }) {
    return <div className={HEADING_CLASSES.h1} {...props}>{children}</div>;
  },
  h2({ children, ...props }) {
    return <div className={HEADING_CLASSES.h2} {...props}>{children}</div>;
  },
  h3({ children, ...props }) {
    return <div className={HEADING_CLASSES.h3} {...props}>{children}</div>;
  },
  h4({ children, ...props }) {
    return <div className={HEADING_CLASSES.h4} {...props}>{children}</div>;
  },
  h5({ children, ...props }) {
    return <div className={HEADING_CLASSES.h5} {...props}>{children}</div>;
  },
  h6({ children, ...props }) {
    return <div className={HEADING_CLASSES.h6} {...props}>{children}</div>;
  },
  p({ children, ...props }) {
    return <div className="my-2 leading-6 text-ink-secondary" {...props}>{children}</div>;
  },
  code({ className, children, ...props }) {
    const match = /language-([\w-]+)/.exec(className || '');
    if (match) {
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
          language={match[1]}
          appearance={codeAppearance}
        />
      );
    }
    return (
      <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-ink" {...props}>
        {children}
      </code>
    );
  },
  a({ href, children, ...props }) {
    const external = /^(https?:)?\/\//i.test(href || '');
    return (
      <a
        href={href}
        className="font-semibold text-ink underline decoration-border-strong underline-offset-2 hover:decoration-ink"
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
    return <blockquote className="border-l-4 border-border-strong pl-3 text-ink-muted" {...props}>{children}</blockquote>;
  },
});

const AgentMarkdown = memo(({ content, codeAppearance = 'conversation' }) => (
  <div className="prose prose-sm max-w-none break-words prose-li:my-0.5 prose-li:text-ink-secondary prose-strong:text-ink prose-pre:my-3 prose-pre:bg-transparent prose-pre:p-0 prose-table:text-sm">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={createMarkdownComponents(codeAppearance)}>
      {normalizeAnswer(content || '')}
    </ReactMarkdown>
  </div>
));

AgentMarkdown.displayName = 'AgentMarkdown';

export default AgentMarkdown;
