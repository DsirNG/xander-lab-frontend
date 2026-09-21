import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    BookOpen,
    Check,
    ChevronDown,
    ChevronRight,
    Copy,
    FileText,
    Sparkles,
} from "lucide-react";
import { formatBytes } from "../utils/fileHash";

const markdownComponents = {
    h1({ children, ...props }) {
        return (
            <h1
                className="mb-2 mt-3 text-sm font-bold text-[#111426] dark:text-white"
                {...props}
            >
                {children}
            </h1>
        );
    },
    h2({ children, ...props }) {
        return (
            <h2
                className="mb-2 mt-2.5 text-xs font-bold text-[#111426] dark:text-white"
                {...props}
            >
                {children}
            </h2>
        );
    },
    h3({ children, ...props }) {
        return (
            <h3
                className="mb-1.5 mt-2 text-xs font-semibold text-[#111426] dark:text-slate-200"
                {...props}
            >
                {children}
            </h3>
        );
    },
    p({ children, ...props }) {
        return (
            <p
                className="my-1.5 text-xs leading-relaxed text-[#555b7b] dark:text-slate-300 select-text"
                {...props}
            >
                {children}
            </p>
        );
    },
    ul({ children, ...props }) {
        return (
            <ul
                className="my-1.5 list-disc list-inside space-y-0.5 text-xs text-[#555b7b] dark:text-slate-300"
                {...props}
            >
                {children}
            </ul>
        );
    },
    ol({ children, ...props }) {
        return (
            <ol
                className="my-1.5 list-decimal list-inside space-y-0.5 text-xs text-[#555b7b] dark:text-slate-300"
                {...props}
            >
                {children}
            </ol>
        );
    },
    code({ inline, children, ...props }) {
        if (inline) {
            return (
                <code
                    className="rounded bg-[#f2f1fd] dark:bg-white/10 px-1 py-0.5 font-mono text-[11px] text-[#6765f6] dark:text-blue-400"
                    {...props}
                >
                    {children}
                </code>
            );
        }
        return (
            <pre className="my-2 overflow-x-auto rounded-xl bg-[#fbfbfe] dark:bg-white/[0.03] p-2.5 font-mono text-[11px] text-[#111426] dark:text-slate-200 border border-[#eef0f6] dark:border-white/5">
                <code>{children}</code>
            </pre>
        );
    },
    blockquote({ children, ...props }) {
        return (
            <blockquote
                className="my-2 border-l-2 border-[#7771ed]/60 pl-2.5 italic text-xs text-[#8e94ad] dark:text-slate-400"
                {...props}
            >
                {children}
            </blockquote>
        );
    },
    table({ children, ...props }) {
        return (
            <div className="my-2 overflow-x-auto">
                <table
                    className="min-w-full text-[11px] border-collapse border border-[#eef0f6] dark:border-white/10"
                    {...props}
                >
                    {children}
                </table>
            </div>
        );
    },
    th({ children, ...props }) {
        return (
            <th
                className="border border-[#eef0f6] dark:border-white/10 bg-[#fbfbfe] dark:bg-white/5 px-2 py-1 text-left font-semibold text-[#111426] dark:text-slate-200"
                {...props}
            >
                {children}
            </th>
        );
    },
    td({ children, ...props }) {
        return (
            <td
                className="border border-[#eef0f6] dark:border-white/10 px-2 py-1 text-[#555b7b] dark:text-slate-300"
                {...props}
            >
                {children}
            </td>
        );
    },
};

const KnowledgePreviewContentTab = ({
    file,
    ext,
    chapters,
    summaryText,
    fullContent,
    activeChapter,
    displayText,
    isExcerptTruncated,
    contentLoading,
    copied,
    outlineExpanded,
    onToggleOutline,
    onSelectChapter,
    onLoadFullContent,
    onCopyText,
}) => (
    <div className="space-y-3.5">
        <div className="relative overflow-hidden rounded-2xl border border-[#e8e6fb] bg-[linear-gradient(105deg,#f1f0ff_0%,#f8f9ff_72%)] p-4 dark:border-white/10 dark:bg-surface">
            <div className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 rounded-full bg-[#7771ed]/10 blur-xl dark:bg-blue-500/10" />
            <div className="pointer-events-none absolute right-2.5 top-2.5 h-16 w-16 opacity-35">
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    className="h-full w-full"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#7771ed"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="26"
                        stroke="#6765f6"
                        strokeWidth="1.2"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="12"
                        fill="#7771ed"
                        fillOpacity="0.15"
                    />
                </svg>
            </div>
            <div className="relative z-10 pr-12">
                <div className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#6765f6] shadow-2xs dark:bg-white/10 dark:text-blue-400">
                    <Sparkles className="h-2.5 w-2.5 text-[#6765f6]" />
                    <span>AI 提取</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-[#111426] line-clamp-2 dark:text-white leading-snug">
                    {file.displayName}
                </h4>
                <div className="mt-1 text-[11px] text-[#8e94ad] dark:text-slate-400">
                    {ext.toUpperCase()} 文档 ·{" "}
                    {formatBytes(file.fileSize || file.sizeBytes || 0)} ·{" "}
                    {chapters.length ? `${chapters.length} 章节` : "智能提炼"}
                </div>
            </div>
        </div>

        <div className="text-[13px] leading-relaxed text-[#555b7b] dark:text-slate-300">
            {summaryText}
        </div>

        <div className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-3 dark:border-white/5 dark:bg-white/[0.02]">
            <button
                type="button"
                onClick={onToggleOutline}
                className="flex w-full cursor-pointer items-center justify-between font-semibold text-xs text-[#111426] dark:text-slate-200 select-none"
            >
                <span className="flex items-center gap-1.5">
                    <span>目录预览</span>
                    {chapters.length > 0 ? (
                        <span className="rounded-full bg-[#eef0f6] px-1.5 py-0.2 text-[10px] font-normal text-[#6765f6] dark:bg-white/10 dark:text-slate-400">
                            共 {chapters.length} 章
                        </span>
                    ) : null}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-[#8e94ad] transition-transform duration-200 ${outlineExpanded ? "rotate-180" : ""}`}
                />
            </button>

            {outlineExpanded ? (
                <div className="mt-2.5 space-y-1 border-t border-[#eef0f6] pt-1 text-xs dark:border-white/5">
                    {chapters.length > 0 ? (
                        chapters.slice(0, 6).map((chapter, index) => (
                            <button
                                key={chapter.id ?? index}
                                type="button"
                                onClick={() => {
                                    onSelectChapter(chapter.id);
                                    if (!fullContent) onLoadFullContent();
                                }}
                                className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left transition hover:bg-white hover:shadow-2xs dark:hover:bg-white/5"
                            >
                                <span className="truncate text-[#555b7b] group-hover:text-[#6765f6] dark:text-slate-300 dark:group-hover:text-blue-400">
                                    {index + 1}. {chapter.title}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8e94ad] opacity-0 transition group-hover:opacity-100 group-hover:text-[#6765f6]" />
                            </button>
                        ))
                    ) : (
                        <div className="py-2 text-center text-[11px] text-[#8e94ad]">
                            暂无独立目录结构，可直接通读全文
                        </div>
                    )}
                </div>
            ) : null}
        </div>

        <div className="rounded-xl border border-[#eef0f6] bg-white p-3 shadow-2xs dark:border-white/5 dark:bg-surface">
            <div className="flex items-center justify-between border-b border-[#eef0f6] pb-2 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111426] dark:text-slate-200">
                    <BookOpen className="h-3.5 w-3.5 text-[#6765f6]" />
                    <span>
                        {activeChapter ? activeChapter.title : "原文档正文"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {isExcerptTruncated ? (
                        <button
                            type="button"
                            disabled={contentLoading}
                            onClick={onLoadFullContent}
                            className="rounded-lg border border-[#e9eaf4] bg-white px-2 py-1 text-[11px] font-medium text-[#6765f6] transition hover:bg-[#f7f6fc] disabled:opacity-50"
                        >
                            {contentLoading ? "加载中..." : "完整全文"}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => onCopyText(displayText)}
                        className="rounded-lg p-1 text-[#8e94ad] hover:bg-[#f7f6fc] hover:text-[#111426] dark:hover:bg-white/5"
                        title="复制正文"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-2.5 max-h-56 overflow-y-auto pr-1 text-xs select-text">
                {displayText ? (
                    <>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                        >
                            {displayText}
                        </ReactMarkdown>
                        {isExcerptTruncated ? (
                            <div className="mt-3 rounded-lg border border-[#eef0f6] bg-[#fbfbfe] p-2.5 text-center text-[11px] text-[#8e94ad] dark:border-white/5 dark:bg-white/5">
                                <span>已展示首屏片段 · </span>
                                <button
                                    type="button"
                                    onClick={onLoadFullContent}
                                    className="font-medium text-[#6765f6] hover:underline"
                                >
                                    加载完整文档全文
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="py-6 text-center text-xs text-[#8e94ad]">
                        <FileText className="mx-auto mb-1.5 h-7 w-7 text-[#8e94ad]/60" />
                        <span>未提取到纯文本，可下载或在新窗口查阅原件</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

KnowledgePreviewContentTab.propTypes = {
    file: PropTypes.object.isRequired,
    ext: PropTypes.string.isRequired,
    chapters: PropTypes.array.isRequired,
    summaryText: PropTypes.string.isRequired,
    fullContent: PropTypes.string,
    activeChapter: PropTypes.object,
    displayText: PropTypes.string.isRequired,
    isExcerptTruncated: PropTypes.bool.isRequired,
    contentLoading: PropTypes.bool.isRequired,
    copied: PropTypes.bool.isRequired,
    outlineExpanded: PropTypes.bool.isRequired,
    onToggleOutline: PropTypes.func.isRequired,
    onSelectChapter: PropTypes.func.isRequired,
    onLoadFullContent: PropTypes.func.isRequired,
    onCopyText: PropTypes.func.isRequired,
};

export default KnowledgePreviewContentTab;
