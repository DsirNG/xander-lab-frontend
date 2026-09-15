import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    ChevronDown,
    ChevronRight,
    ExternalLink,
    FileText,
    MoreHorizontal,
    Network,
    Sparkles,
    X,
    CircleDot,
    Download,
    BookOpen,
    Copy,
    Check,
    Layers,
    Tag as TagIcon,
    Folder,
} from "lucide-react";
import Button from "@components/common/Button";
import Skeleton from "@components/common/Skeleton";
import RowActionsMenu from "@components/common/RowActionsMenu";
import { formatBytes } from "../utils/fileHash";
import { knowledgeBaseService } from "../services/knowledgeBaseService";

const EXTENSION_BADGES = {
    pdf: { label: "PDF", bg: "bg-rose-500 text-white" },
    md: { label: "MD", bg: "bg-blue-500 text-white" },
    markdown: { label: "MD", bg: "bg-blue-500 text-white" },
    docx: { label: "DOCX", bg: "bg-indigo-600 text-white" },
    doc: { label: "DOC", bg: "bg-indigo-600 text-white" },
    txt: { label: "TXT", bg: "bg-slate-500 text-white" },
    json: { label: "JSON", bg: "bg-emerald-600 text-white" },
    html: { label: "HTML", bg: "bg-teal-600 text-white" },
};

function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const TABS = [
    { key: "content", label: "内容" },
    { key: "chapters", label: "章节" },
    { key: "structure", label: "知识结构" },
    { key: "source", label: "来源" },
    { key: "relations", label: "关联" },
];

const markdownComponents = {
    h1({ children, ...props }) {
        return (
            <h1 className="mb-2 mt-3 text-sm font-bold text-[#111426] dark:text-white" {...props}>
                {children}
            </h1>
        );
    },
    h2({ children, ...props }) {
        return (
            <h2 className="mb-2 mt-2.5 text-xs font-bold text-[#111426] dark:text-white" {...props}>
                {children}
            </h2>
        );
    },
    h3({ children, ...props }) {
        return (
            <h3 className="mb-1.5 mt-2 text-xs font-semibold text-[#111426] dark:text-slate-200" {...props}>
                {children}
            </h3>
        );
    },
    p({ children, ...props }) {
        return (
            <p className="my-1.5 text-xs leading-relaxed text-[#555b7b] dark:text-slate-300 select-text" {...props}>
                {children}
            </p>
        );
    },
    ul({ children, ...props }) {
        return (
            <ul className="my-1.5 list-disc list-inside space-y-0.5 text-xs text-[#555b7b] dark:text-slate-300" {...props}>
                {children}
            </ul>
        );
    },
    ol({ children, ...props }) {
        return (
            <ol className="my-1.5 list-decimal list-inside space-y-0.5 text-xs text-[#555b7b] dark:text-slate-300" {...props}>
                {children}
            </ol>
        );
    },
    code({ inline, children, ...props }) {
        if (inline) {
            return (
                <code className="rounded bg-[#f2f1fd] dark:bg-white/10 px-1 py-0.5 font-mono text-[11px] text-[#6765f6] dark:text-blue-400" {...props}>
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
            <blockquote className="my-2 border-l-2 border-[#7771ed]/60 pl-2.5 italic text-xs text-[#8e94ad] dark:text-slate-400" {...props}>
                {children}
            </blockquote>
        );
    },
    table({ children, ...props }) {
        return (
            <div className="my-2 overflow-x-auto">
                <table className="min-w-full text-[11px] border-collapse border border-[#eef0f6] dark:border-white/10" {...props}>
                    {children}
                </table>
            </div>
        );
    },
    th({ children, ...props }) {
        return (
            <th className="border border-[#eef0f6] dark:border-white/10 bg-[#fbfbfe] dark:bg-white/5 px-2 py-1 text-left font-semibold text-[#111426] dark:text-slate-200" {...props}>
                {children}
            </th>
        );
    },
    td({ children, ...props }) {
        return (
            <td className="border border-[#eef0f6] dark:border-white/10 px-2 py-1 text-[#555b7b] dark:text-slate-300" {...props}>
                {children}
            </td>
        );
    },
};

/**
 * 右侧抽屉栏：原文档预览与知识结构面板
 */
const KnowledgeStructurePreviewPanel = ({
    file,
    onClose,
    onOpenFullViewer,
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("content");
    const [loading, setLoading] = useState(false);
    const [structureData, setStructureData] = useState(null);
    const [fullContent, setFullContent] = useState(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [outlineExpanded, setOutlineExpanded] = useState(true);
    const [viewFullText, setViewFullText] = useState(false);

    // 文件变化时重置状态并加载预览
    useEffect(() => {
        if (!file?.id) {
            setStructureData(null);
            setFullContent(null);
            setSelectedChapterId(null);
            return;
        }

        let active = true;
        setLoading(true);
        setFullContent(null);
        setSelectedChapterId(null);
        setActiveTab("content");

        knowledgeBaseService.files
            .preview(file.id, { _silent: true })
            .then((res) => {
                if (active) {
                    setStructureData(res);
                }
            })
            .catch(() => {
                if (active) setStructureData(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [file?.id]);

    // 加载完整全文
    const handleLoadFullContent = async () => {
        if (!file?.id) return;
        setContentLoading(true);
        try {
            const text = await knowledgeBaseService.files.content(file.id);
            setFullContent(text);
        } catch {
            window.__toast?.("error", "加载全文失败，源文件可能未提取出纯文本");
        } finally {
            setContentLoading(false);
        }
    };

    // 复制正文
    const handleCopyText = () => {
        if (!displayText) return;
        navigator.clipboard.writeText(displayText);
        setCopied(true);
        window.__toast?.("success", "正文内容已复制到剪贴板");
        setTimeout(() => setCopied(false), 2000);
    };

    // 整书重新生成脑图
    const handleRegenerate = async () => {
        if (!file?.id) return;
        setGenLoading(true);
        try {
            const updated = await knowledgeBaseService.structure.regenerate(file.id);
            setStructureData((prev) => ({
                ...prev,
                structure: updated,
            }));
            window.__toast?.("success", "已重新生成知识结构导图");
        } finally {
            setGenLoading(false);
        }
    };

    if (!file) return null;

    const ext = file.extension?.toLowerCase() || "file";
    const badge = EXTENSION_BADGES[ext] || {
        label: ext.toUpperCase().slice(0, 4),
        bg: "bg-slate-500 text-white",
    };

    const rootNode = structureData?.structure?.root;
    const chapters = structureData?.chapters || [];

    // 当前选中的章节
    const activeChapter = useMemo(() => {
        if (!chapters.length || !selectedChapterId) return null;
        const findInTree = (nodes) => {
            for (const n of nodes) {
                if (n.id === selectedChapterId) return n;
                if (n.children?.length) {
                    const found = findInTree(n.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInTree(chapters);
    }, [chapters, selectedChapterId]);

    // 当前应展示的正文文本
    const displayText = useMemo(() => {
        if (activeChapter && activeChapter.startOffset != null && activeChapter.endOffset != null && fullContent) {
            return fullContent.substring(activeChapter.startOffset, activeChapter.endOffset);
        }
        return fullContent ?? structureData?.excerpt ?? "";
    }, [fullContent, structureData, activeChapter]);

    const isExcerptTruncated = Boolean(structureData?.excerptTruncated && !fullContent && !activeChapter);

    // 摘要信息提取
    const summaryText =
        file.description ||
        structureData?.summary ||
        structureData?.structure?.root?.summary ||
        (displayText ? displayText.slice(0, 240).replace(/#+\s/g, "").trim() + "..." : "文档已完成智能解析与入库，点击开始阅读可查阅完整章节与原文档细节。");

    return (
        <div className="flex h-full min-h-0 w-[420px] shrink-0 flex-col justify-between rounded-2xl border border-[#e9eaf3] bg-white/85 backdrop-blur-xs p-4 shadow-xs dark:border-white/5 dark:bg-surface overflow-hidden transition-all lg:w-[460px] xl:w-[480px]">
            {/* 1. 顶部文件概要与操作区 */}
            <div className="shrink-0 border-b border-[#eef0f6] pb-3 dark:border-white/5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                            className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-[11px] tracking-tight shadow-2xs ${badge.bg}`}
                        >
                            {badge.label}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3
                                className="truncate text-xs font-bold text-[#111426] dark:text-white"
                                title={file.displayName}
                            >
                                {file.displayName}
                            </h3>
                            <div className="mt-0.5 text-[11px] text-[#8e94ad] dark:text-slate-500">
                                {formatBytes(file.fileSize || file.sizeBytes || 0)} · {formatDateTime(file.updatedAt || file.createdAt)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-[#8e94ad] dark:text-slate-500">
                        <RowActionsMenu
                            size="sm"
                            align="right"
                            actions={[
                                {
                                    key: "regenerate",
                                    label: "重构导图",
                                    icon: Sparkles,
                                    onClick: handleRegenerate,
                                },
                                {
                                    key: "fullViewer",
                                    label: "全屏大窗",
                                    icon: ExternalLink,
                                    onClick: () => onOpenFullViewer(file.id),
                                },
                            ]}
                        />

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 transition hover:bg-[#f7f6fc] hover:text-[#111426] dark:hover:bg-white/5 dark:hover:text-slate-200"
                            title="关闭"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* 2. 五大分类 Tab 导航 (内容 | 章节 | 知识结构 | 来源 | 关联) */}
                <div className="mt-3 flex items-center gap-5 text-xs">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative pb-1.5 transition font-medium ${
                                    isActive
                                        ? "text-[#6765f6] font-semibold dark:text-white"
                                        : "text-[#8e94ad] hover:text-[#555b7b] dark:text-slate-500 dark:hover:text-slate-300"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {isActive ? (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#6765f6]" />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. 中间内容视口 */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 py-3">
                {loading ? (
                    <div className="space-y-3 py-2">
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                ) : activeTab === "content" ? (
                    /* Tab 1: 内容 (工作台风格顶部高亮卡片 + 摘要 + 目录预览 + 正文阅读) */
                    <div className="space-y-3.5">
                        {/* 顶部柔和渐变高亮卡片 (与工作台卡片风格一致) */}
                        <div className="relative overflow-hidden rounded-2xl border border-[#e8e6fb] bg-[linear-gradient(105deg,#f1f0ff_0%,#f8f9ff_72%)] p-4 dark:border-white/10 dark:bg-surface">
                            {/* 右上角柔和几何光影装饰 */}
                            <div className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 rounded-full bg-[#7771ed]/10 blur-xl dark:bg-blue-500/10" />
                            <div className="pointer-events-none absolute right-2.5 top-2.5 h-16 w-16 opacity-35">
                                <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
                                    <circle cx="50" cy="50" r="40" stroke="#7771ed" strokeWidth="1.5" strokeDasharray="4 4" />
                                    <circle cx="50" cy="50" r="26" stroke="#6765f6" strokeWidth="1.2" />
                                    <circle cx="50" cy="50" r="12" fill="#7771ed" fillOpacity="0.15" />
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
                                    {ext.toUpperCase()} 文档 · {formatBytes(file.fileSize || file.sizeBytes || 0)} · {chapters.length ? `${chapters.length} 章节` : "智能提炼"}
                                </div>
                            </div>
                        </div>

                        {/* 摘要正文 */}
                        <div className="text-[13px] leading-relaxed text-[#555b7b] dark:text-slate-300">
                            {summaryText}
                        </div>

                        {/* 目录预览（折叠展开组件） */}
                        <div className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-3 dark:border-white/5 dark:bg-white/[0.02]">
                            <div
                                onClick={() => setOutlineExpanded(!outlineExpanded)}
                                className="flex cursor-pointer items-center justify-between font-semibold text-xs text-[#111426] dark:text-slate-200 select-none"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>目录预览</span>
                                    {chapters.length > 0 ? (
                                        <span className="rounded-full bg-[#eef0f6] px-1.5 py-0.2 text-[10px] font-normal text-[#6765f6] dark:bg-white/10 dark:text-slate-400">
                                            共 {chapters.length} 章
                                        </span>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-1 text-[#8e94ad]">
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${
                                            outlineExpanded ? "rotate-180" : ""
                                        }`}
                                    />
                                </div>
                            </div>

                            {outlineExpanded ? (
                                <div className="mt-2.5 space-y-1 text-xs pt-1 border-t border-[#eef0f6] dark:border-white/5">
                                    {chapters.length > 0 ? (
                                        chapters.slice(0, 6).map((ch, idx) => (
                                            <div
                                                key={ch.id ?? idx}
                                                onClick={() => {
                                                    setSelectedChapterId(ch.id);
                                                    setViewFullText(true);
                                                    if (!fullContent) handleLoadFullContent();
                                                }}
                                                className="group flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-white hover:shadow-2xs dark:hover:bg-white/5"
                                            >
                                                <span className="truncate text-[#555b7b] group-hover:text-[#6765f6] dark:text-slate-300 dark:group-hover:text-blue-400">
                                                    {idx + 1}. {ch.title}
                                                </span>
                                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8e94ad] opacity-0 transition group-hover:opacity-100 group-hover:text-[#6765f6]" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-2 text-center text-[11px] text-[#8e94ad]">
                                            暂无独立目录结构，可直接通读全文
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* 查看原文档正文折叠/阅读区 */}
                        <div className="rounded-xl border border-[#eef0f6] bg-white p-3 shadow-2xs dark:border-white/5 dark:bg-surface">
                            <div className="flex items-center justify-between pb-2 border-b border-[#eef0f6] dark:border-white/5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111426] dark:text-slate-200">
                                    <BookOpen className="h-3.5 w-3.5 text-[#6765f6]" />
                                    <span>{activeChapter ? activeChapter.title : "原文档正文"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isExcerptTruncated ? (
                                        <button
                                            type="button"
                                            disabled={contentLoading}
                                            onClick={handleLoadFullContent}
                                            className="rounded-lg border border-[#e9eaf4] bg-white px-2 py-1 text-[11px] font-medium text-[#6765f6] hover:bg-[#f7f6fc] transition disabled:opacity-50"
                                        >
                                            {contentLoading ? "加载中..." : "完整全文"}
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(displayText)}
                                        className="rounded-lg p-1 text-[#8e94ad] hover:bg-[#f7f6fc] hover:text-[#111426] dark:hover:bg-white/5"
                                        title="复制正文"
                                    >
                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2.5 max-h-56 overflow-y-auto pr-1 text-xs select-text">
                                {displayText ? (
                                    <>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                            {displayText}
                                        </ReactMarkdown>
                                        {isExcerptTruncated ? (
                                            <div className="mt-3 rounded-lg bg-[#fbfbfe] p-2.5 text-center text-[11px] text-[#8e94ad] border border-[#eef0f6] dark:bg-white/5 dark:border-white/5">
                                                <span>已展示首屏片段 · </span>
                                                <button
                                                    type="button"
                                                    onClick={handleLoadFullContent}
                                                    className="font-medium text-[#6765f6] hover:underline"
                                                >
                                                    加载完整文档全文
                                                </button>
                                            </div>
                                        ) : null}
                                    </>
                                ) : (
                                    <div className="py-6 text-center text-xs text-[#8e94ad]">
                                        <FileText className="mx-auto h-7 w-7 text-[#8e94ad]/60 mb-1.5" />
                                        <span>未提取到纯文本，可下载或在新窗口查阅原件</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === "chapters" ? (
                    /* Tab 2: 章节列表 */
                    <div className="space-y-2 text-xs">
                        {chapters.length > 0 ? (
                            chapters.map((ch, idx) => (
                                <div
                                    key={ch.id ?? idx}
                                    onClick={() => {
                                        setSelectedChapterId(ch.id);
                                        setActiveTab("content");
                                        if (!fullContent) {
                                            handleLoadFullContent();
                                        }
                                    }}
                                    className={`cursor-pointer rounded-xl border p-3 transition ${
                                        selectedChapterId === ch.id
                                            ? "border-[#6765f6] bg-[#f2f1fd] text-[#6765f6]"
                                            : "border-[#eef0f6] bg-[#fbfbfe] text-[#555b7b] hover:border-[#6765f6]/40 hover:bg-white hover:shadow-2xs dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between font-medium">
                                        <span className="truncate">第 {idx + 1} 章: {ch.title}</span>
                                        <span className="text-[11px] text-[#8e94ad] shrink-0">
                                            {ch.charCount ?? 0} 字 →
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs text-[#8e94ad]">
                                暂无独立章节划分，可直接在“内容”中通读全文
                            </div>
                        )}
                    </div>
                ) : activeTab === "structure" ? (
                    /* Tab 3: 知识结构导图 */
                    <div className="space-y-2.5">
                        {rootNode && rootNode.children?.length > 0 ? (
                            rootNode.children.map((chNode, idx) => (
                                <div
                                    key={chNode.id || idx}
                                    className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]"
                                >
                                    <div className="font-semibold text-[#111426] dark:text-slate-200">
                                        {chNode.title}
                                    </div>
                                    <div className="mt-2 space-y-1.5">
                                        {(chNode.children || []).map((point, pIdx) => (
                                            <div
                                                key={point.id || pIdx}
                                                className="flex items-center gap-1.5 text-[11px] text-[#555b7b] dark:text-slate-400"
                                            >
                                                <CircleDot className="h-2.5 w-2.5 text-[#6765f6] shrink-0" />
                                                <span className="truncate">{point.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[#e9eaf4] p-8 text-center text-xs text-[#8e94ad] dark:border-white/10">
                                <Network className="mx-auto h-8 w-8 text-[#8e94ad]/60 dark:text-slate-600" />
                                <div className="mt-2.5 font-medium text-[#111426] dark:text-slate-300">尚未生成结构导图</div>
                                <button
                                    type="button"
                                    onClick={handleRegenerate}
                                    disabled={genLoading}
                                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#7771ed] hover:bg-[#6862e3] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>{genLoading ? "生成中..." : "立即生成结构图"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : activeTab === "source" ? (
                    /* Tab 4: 来源属性 */
                    <div className="space-y-3 text-xs">
                        <div className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-3.5 space-y-2.5 dark:border-white/5 dark:bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <span className="text-[#8e94ad]">文件格式</span>
                                <span className="font-semibold uppercase text-[#111426] dark:text-slate-200">{ext}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#8e94ad]">存储大小</span>
                                <span className="font-medium text-[#111426] dark:text-slate-200">{formatBytes(file.fileSize || file.sizeBytes || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#8e94ad]">字符总数</span>
                                <span className="font-medium text-[#111426] dark:text-slate-200">{file.charCount ?? displayText?.length ?? "-"} 字</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#8e94ad]">入库时间</span>
                                <span className="font-medium text-[#111426] dark:text-slate-200">{formatDateTime(file.createdAt)}</span>
                            </div>
                            {file.fileSha256 ? (
                                <div className="pt-2 border-t border-[#eef0f6] dark:border-white/5">
                                    <div className="text-[#8e94ad] mb-0.5">SHA-256 校验和</div>
                                    <div className="font-mono text-[10px] text-[#555b7b] break-all dark:text-slate-400">
                                        {file.fileSha256}
                                    </div>
                                </div>
                            ) : null}
                            {file.storageUrl ? (
                                <div className="pt-2 border-t border-[#eef0f6] dark:border-white/5">
                                    <a
                                        href={file.storageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[#6765f6] hover:underline font-medium"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        <span>下载 / 浏览器查看源文件</span>
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    /* Tab 5: 关联 */
                    <div className="space-y-3 text-xs">
                        <div className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-3.5 space-y-3 dark:border-white/5 dark:bg-white/[0.02]">
                            <div>
                                <div className="text-[11px] font-medium text-[#8e94ad] mb-1.5 flex items-center gap-1">
                                    <Folder className="h-3.5 w-3.5" />
                                    <span>所属目录</span>
                                </div>
                                <div className="text-[#111426] dark:text-slate-200 font-medium">
                                    {file.folderName || "根目录 / 全部文档"}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-[#8e94ad] mb-1.5 flex items-center gap-1">
                                    <TagIcon className="h-3.5 w-3.5" />
                                    <span>关联标签</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {file.tags && file.tags.length > 0 ? (
                                        file.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center gap-1 rounded-md bg-white border border-[#e9eaf4] px-2 py-0.5 text-[11px] text-[#555b7b] shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                            >
                                                <span
                                                    className="h-1.5 w-1.5 rounded-full"
                                                    style={{ backgroundColor: tag.colorHex || "#7771ed" }}
                                                />
                                                <span>{tag.name}</span>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[#8e94ad] text-[11px]">暂无关联标签</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. 底部快捷操作栏 (与工作台统一按钮风格) */}
            <div className="shrink-0 border-t border-[#eef0f6] pt-3 flex items-center justify-between gap-3 dark:border-white/5">
                <button
                    type="button"
                    onClick={() => onOpenFullViewer(file.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e9eaf4] bg-white px-3.5 py-2 text-xs font-medium text-[#59617e] shadow-2xs transition hover:bg-[#f7f6fc] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                    <ExternalLink className="h-3.5 w-3.5 text-[#8e94ad]" />
                    <span>在新窗口打开</span>
                </button>

                <button
                    type="button"
                    onClick={() => onOpenFullViewer(file.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#7771ed] hover:bg-[#6862e3] px-5 py-2 text-xs font-medium text-white shadow-xs transition"
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>开始阅读</span>
                </button>
            </div>
        </div>
    );
};

KnowledgeStructurePreviewPanel.propTypes = {
    file: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onOpenFullViewer: PropTypes.func.isRequired,
};

export default KnowledgeStructurePreviewPanel;
