import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import CodeBlock from "@/components/common/CodeBlock";
import Modal from "@/components/common/Modal";

/** 对话正文无需额外公式边框；展开模型常用的 \boxed{...}，避免流式渲染时出现残缺框线。 */
const unwrapBoxedExpressions = (text) => {
    let result = "";
    let cursor = 0;

    while (cursor < text.length) {
        const start = text.indexOf("\\boxed{", cursor);
        if (start < 0) return result + text.slice(cursor);

        result += text.slice(cursor, start);
        const contentStart = start + "\\boxed{".length;
        let depth = 1;
        let end = contentStart;
        for (; end < text.length && depth > 0; end += 1) {
            if (text[end] === "{") depth += 1;
            else if (text[end] === "}") depth -= 1;
        }
        if (depth > 0) return result + text.slice(start);

        result += text.slice(contentStart, end - 1);
        cursor = end;
    }

    return result;
};

/**
 * 兼容已落库的简写数学文本。模型应输出 TeX；这里只补齐无歧义的纯数字分数和根式分数，
 * 让旧消息与偶发的不规范输出仍能按数学公式展示，而不会把日期、路径或普通斜杠误当公式。
 */
const normalizeSimpleMath = (text) => text
    .replace(
        /(?<![\w$\\])√(\d+)\s*\/\s*(\d+)(?![\w$])/g,
        (_, radicand, denominator) => `$\\frac{\\sqrt{${radicand}}}{${denominator}}$`,
    )
    .replace(
        /(?<![\w$\\])(\d+)\s*\/\s*(\d+)(?![\w$])/g,
        (_, numerator, denominator) => `$\\frac{${numerator}}{${denominator}}$`,
    )
    .replace(/(?<![\w$\\])√(\d+)(?![\w$])/g, (_, radicand) => `$\\sqrt{${radicand}}$`);

/** 模型常把 Markdown 反引号写成 \` 转义，并用普通括号包裹 TeX；统一为 remark-math 可识别的定界符。 */
const normalizeAnswer = (text) => {
    if (typeof text !== "string") return text;

    return normalizeSimpleMath(unwrapBoxedExpressions(text))
        .replace(/\\`/g, "`")
        .replace(
            /\\\[([\s\S]*?)\\\]/g,
            (_, formula) => `\n$$\n${formula}\n$$\n`,
        )
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => `$${formula}$`)
        .replace(
            /(?<!\\left)\(([^()\n]*\\[a-zA-Z]+[^()\n]*)\)/g,
            (_, formula) => `$${formula}$`,
        )
        .replace(
            /\[([^\n]*\\[a-zA-Z]+[^\n]*)\]/g,
            (_, formula) => `$$${formula}$$`,
        );
};

/** 标题统一渲染为 div + 排版 token（display/heading/title → 800，body → 400/600/700），不使用 h1-h6 标签。 */
const HEADING_CLASSES = {
    h1: "mb-3 mt-4 text-display font-black text-ink",
    h2: "mb-2 mt-4 text-heading font-black text-ink",
    h3: "mb-2 mt-3 text-title font-bold text-ink",
    h4: "mb-1 mt-2 text-body font-bold text-ink",
    h5: "mb-1 mt-2 text-body font-semibold text-ink",
    h6: "mb-1 mt-2 text-body font-semibold text-ink",
};

const createMarkdownComponents = (codeAppearance) => ({
    h1({ children, ...props }) {
        return (
            <div className={HEADING_CLASSES.h1} {...props}>
                {children}
            </div>
        );
    },
    h2({ children, ...props }) {
        return (
            <div className={HEADING_CLASSES.h2} {...props}>
                {children}
            </div>
        );
    },
    h3({ children, ...props }) {
        return (
            <div className={HEADING_CLASSES.h3} {...props}>
                {children}
            </div>
        );
    },
    h4({ children, ...props }) {
        return (
            <div className={HEADING_CLASSES.h4} {...props}>
                {children}
            </div>
        );
    },
    h5({ children, ...props }) {
        return (
            <div className={HEADING_CLASSES.h5} {...props}>
                {children}
            </div>
        );
    },
    h6({ children, ...props }) {
        return (
            <div className={HEADING_CLASSES.h6} {...props}>
                {children}
            </div>
        );
    },
    p({ children, ...props }) {
        return (
            <div className="my-2 leading-6 text-ink-secondary" {...props}>
                {children}
            </div>
        );
    },
    code({ className, children, ...props }) {
        const match = /language-([\w-]+)/.exec(className || "");
        if (match) {
            return (
                <CodeBlock
                    code={String(children).replace(/\n$/, "")}
                    language={match[1]}
                    appearance={codeAppearance}
                />
            );
        }
        return (
            <code
                className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
                {...props}
            >
                {children}
            </code>
        );
    },
    a({ href, children, ...props }) {
        const external = /^(https?:)?\/\//i.test(href || "");
        return (
            <a
                href={href}
                className="font-semibold text-ink underline decoration-border-strong underline-offset-2 hover:decoration-ink"
                {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                {...props}
            >
                {children}
            </a>
        );
    },
    table({ children, ...props }) {
        return (
            <div className="my-3 overflow-x-auto rounded-lg border border-border">
                <table {...props}>{children}</table>
            </div>
        );
    },
    blockquote({ children, ...props }) {
        return (
            <blockquote
                className="border-l-4 border-border-strong pl-3 text-ink-muted"
                {...props}
            >
                {children}
            </blockquote>
        );
    },
    img({ src, alt, onImageClick, ...props }) {
        return (
            <img
                src={src}
                alt={alt}
                className="my-3 max-h-80 w-auto rounded-xl object-contain shadow-sm cursor-zoom-in transition-transform hover:opacity-90"
                onClick={() => onImageClick?.(src)}
                {...props}
            />
        );
    },
});

const AgentMarkdown = memo(({ content, codeAppearance = "conversation" }) => {
    const [previewSrc, setPreviewSrc] = useState(null);

    const components = React.useMemo(() => {
        const base = createMarkdownComponents(codeAppearance);
        return {
            ...base,
            img: (props) => base.img({ ...props, onImageClick: setPreviewSrc }),
        };
    }, [codeAppearance]);

    return (
        <>
            <div className="prose prose-sm min-w-0 max-w-none break-words prose-li:my-1.5 prose-li:leading-7 prose-li:text-ink-secondary prose-strong:text-ink prose-pre:my-3 prose-pre:bg-transparent prose-pre:p-0 prose-table:text-sm [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={components}
                >
                    {normalizeAnswer(content || "")}
                </ReactMarkdown>
            </div>
            <Modal
                isOpen={!!previewSrc}
                onClose={() => setPreviewSrc(null)}
                width="max-w-4xl"
                className="!bg-transparent !shadow-none"
                hideCloseButton
            >
                <div
                    className="flex items-center justify-center"
                    onClick={() => setPreviewSrc(null)}
                >
                    <img
                        src={previewSrc}
                        alt="Preview"
                        className="max-h-[85vh] max-w-full rounded-lg object-contain"
                    />
                </div>
            </Modal>
        </>
    );
});

AgentMarkdown.displayName = "AgentMarkdown";

export default AgentMarkdown;
