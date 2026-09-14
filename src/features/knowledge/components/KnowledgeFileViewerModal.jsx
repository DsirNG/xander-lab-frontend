import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    FileText,
    FolderTree,
    Hash,
    Network,
    Plus,
    RefreshCw,
    Sparkles,
    Tag as TagIcon,
    X,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { knowledgeBaseService } from "../services/knowledgeBaseService";
import { formatBytes } from "../utils/fileHash";

/**
 * 递归渲染知识导图节点
 */
const StructureNodeCard = ({
    node,
    depth = 0,
    onChapterClick,
}) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const badgeColor = {
        ROOT: "bg-[#7771ed] text-white shadow-xs",
        CHAPTER: "bg-[#f2f1fd] text-[#6765f6] border border-[#e2e0fb]",
        SECTION: "bg-[#fbfbfe] text-[#555b7b] border border-[#eef0f6]",
        POINT: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    }[node.nodeType] || "bg-[#fbfbfe] text-[#555b7b] border border-[#eef0f6]";

    return (
        <div className="relative my-1.5" style={{ paddingLeft: depth > 0 ? "20px" : "0px" }}>
            {depth > 0 ? (
                <div className="absolute -left-1 top-4 h-full w-px bg-[#eef0f6]" />
            ) : null}

            <div className="rounded-2xl border border-[#eef0f6] bg-white p-3 transition hover:border-[#6765f6]/40 hover:shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className="p-0.5 text-[#8e94ad] hover:text-[#111426] transition"
                            >
                                {expanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}

                        <span className={`rounded-md px-1.5 py-0.5 text-micro font-medium ${badgeColor}`}>
                            {node.nodeType}
                        </span>

                        <span className="text-body font-semibold text-[#111426]">
                            {node.title}
                        </span>
                    </div>

                    {node.chapterId ? (
                        <button
                            type="button"
                            onClick={() => onChapterClick(node.chapterId)}
                            className="text-caption text-[#6765f6] hover:underline transition"
                        >
                            定位到章节原文 →
                        </button>
                    ) : null}
                </div>

                {node.summary ? (
                    <div className="mt-2 text-caption text-[#555b7b] leading-relaxed">
                        {node.summary}
                    </div>
                ) : null}
            </div>

            {hasChildren && expanded ? (
                <div className="space-y-1">
                    {node.children.map((child) => (
                        <StructureNodeCard
                            key={child.id || child.title}
                            node={child}
                            depth={depth + 1}
                            onChapterClick={onChapterClick}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

StructureNodeCard.propTypes = {
    node: PropTypes.object.isRequired,
    depth: PropTypes.number,
    onChapterClick: PropTypes.func.isRequired,
};

const KnowledgeFileViewerModal = ({
    isOpen,
    fileId,
    onClose,
    onFileUpdated,
}) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState("chapters"); // chapters | structure | info
    const [loading, setLoading] = useState(true);
    const [previewData, setPreviewData] = useState(null);
    const [fullContent, setFullContent] = useState(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [newTagInput, setNewTagInput] = useState("");

    // 加载预览综合数据
    const loadPreview = async (signal) => {
        if (!fileId) return;
        setLoading(true);
        try {
            const data = await knowledgeBaseService.files.preview(fileId, {
                signal,
                _silent: true,
            });
            setPreviewData(data);
            if (data?.chapters?.length > 0 && !selectedChapterId) {
                setSelectedChapterId(data.chapters[0].id);
            }
        } catch {
            // error handled by UI
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && fileId) {
            setTab("chapters");
            setFullContent(null);
            setSelectedChapterId(null);
            const controller = new AbortController();
            loadPreview(controller.signal);
            return () => controller.abort();
        }
    }, [isOpen, fileId]);

    // 读取完整正文
    const handleLoadFullContent = async () => {
        if (!fileId) return;
        setContentLoading(true);
        try {
            const text = await knowledgeBaseService.files.content(fileId);
            setFullContent(text);
        } finally {
            setContentLoading(false);
        }
    };

    // 整书重新生成结构图
    const handleRegenerateStructure = async () => {
        if (!fileId) return;
        setActionLoading(true);
        try {
            const updated = await knowledgeBaseService.structure.regenerate(fileId);
            setPreviewData((prev) => ({
                ...prev,
                structure: updated,
            }));
            window.__toast?.("success", t("knowledgeBase.viewer.regenerateSuccess", "已重新生成结构导图"));
            onFileUpdated?.();
        } finally {
            setActionLoading(false);
        }
    };

    // 按章生成导图
    const handleGenerateChapterStructure = async (chapterId) => {
        if (!fileId || !chapterId) return;
        setActionLoading(true);
        try {
            const updated = await knowledgeBaseService.structure.generateChapter(fileId, chapterId);
            setPreviewData((prev) => ({
                ...prev,
                structure: updated,
            }));
            setTab("structure");
            window.__toast?.("success", t("knowledgeBase.viewer.chapterGenSuccess", "已生成本章结构图"));
            onFileUpdated?.();
        } finally {
            setActionLoading(false);
        }
    };

    // 重新识别章节与正文
    const handleReidentify = async () => {
        if (!fileId) return;
        setActionLoading(true);
        try {
            await knowledgeBaseService.files.reidentify(fileId);
            await loadPreview();
            window.__toast?.("success", t("knowledgeBase.viewer.reidentifySuccess", "重新识别完成"));
            onFileUpdated?.();
        } finally {
            setActionLoading(false);
        }
    };

    // 添加手动标签
    const handleAddTag = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const trimmed = newTagInput.trim().replace(/^#/, "");
            if (!trimmed || !fileId) return;
            try {
                const tags = await knowledgeBaseService.tags.attachToFile(fileId, [trimmed]);
                setPreviewData((prev) => ({
                    ...prev,
                    file: { ...prev.file, tags },
                }));
                setNewTagInput("");
                window.__toast?.("success", t("knowledgeBase.tags.attached", "标签已添加"));
                onFileUpdated?.();
            } catch {
                // handled
            }
        }
    };

    // 移除标签
    const handleRemoveTag = async (tagId) => {
        if (!fileId || !tagId) return;
        try {
            const tags = await knowledgeBaseService.tags.detachFromFile(fileId, tagId);
            setPreviewData((prev) => ({
                ...prev,
                file: { ...prev.file, tags },
            }));
            window.__toast?.("success", t("knowledgeBase.tags.detached", "标签已移除"));
            onFileUpdated?.();
        } catch {
            // handled
        }
    };

    // 当前选中的章节对象
    const activeChapter = useMemo(() => {
        if (!previewData?.chapters || !selectedChapterId) return null;
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
        return findInTree(previewData.chapters);
    }, [previewData, selectedChapterId]);

    // 当前章节或文档正文展示
    const displayText = useMemo(() => {
        const text = fullContent ?? previewData?.excerpt ?? "";
        if (activeChapter && activeChapter.startOffset != null && activeChapter.endOffset != null && fullContent) {
            return fullContent.substring(activeChapter.startOffset, activeChapter.endOffset);
        }
        return text;
    }, [fullContent, previewData, activeChapter]);

    const copyCurrentText = () => {
        if (!displayText) return;
        navigator.clipboard.writeText(displayText);
        window.__toast?.("success", t("common.copied", "已复制到剪贴板"));
    };

    const file = previewData?.file;
    const structure = previewData?.structure;
    const chapters = previewData?.chapters || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2 truncate">
                    <FileText className="h-5 w-5 text-[#6765f6] shrink-0" />
                    <span className="truncate font-semibold text-[#111426]">{file?.displayName || t("knowledgeBase.viewer.title", "知识结构预览")}</span>
                </div>
            }
            width="max-w-5xl"
            footer={
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-micro text-[#8e94ad]">
                        <span>{formatBytes(file?.sizeBytes)}</span>
                        <span>·</span>
                        <span>{file?.charCount ?? 0} {t("knowledgeBase.files.chars", "字")}</span>
                        <span>·</span>
                        <span>{file?.chapterCount ?? 0} {t("knowledgeBase.files.chaptersCount", "章")}</span>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        {t("common.close", "关闭")}
                    </Button>
                </div>
            }
        >
            {loading ? (
                <div className="py-24 text-center">
                    <LoadingSpinner />
                </div>
            ) : !previewData ? (
                <div className="py-12 text-center text-[#8e94ad]">
                    {t("knowledgeBase.viewer.loadFailed", "加载预览失败")}
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {/* 顶部 Tab 切换 */}
                    <div className="flex items-center justify-between border-b border-[#eef0f6] pb-3">
                        <div className="flex gap-2">
                            {[
                                { key: "structure", label: t("knowledgeBase.viewer.tabStructure", "知识结构图"), icon: Network },
                                { key: "chapters", label: t("knowledgeBase.viewer.tabChapters", "章节大纲与正文"), icon: BookOpen },
                                { key: "info", label: t("knowledgeBase.viewer.tabInfo", "文件属性与标签"), icon: TagIcon },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTab(key)}
                                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-caption font-medium transition ${
                                        tab === key
                                            ? "bg-[#f2f1fd] text-[#6765f6] font-semibold border border-[#e2e0fb] shadow-2xs"
                                            : "text-[#8e94ad] hover:bg-[#fbfbfe] hover:text-[#111426] border border-transparent"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {tab === "structure" ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon={RefreshCw}
                                    loading={actionLoading}
                                    onClick={handleRegenerateStructure}
                                >
                                    {t("knowledgeBase.viewer.regenerate", "重新生成结构图")}
                                </Button>
                            ) : null}

                            {file?.storageUrl ? (
                                <a
                                    href={file.storageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 rounded-xl border border-[#e9eaf4] bg-white px-3 py-1.5 text-caption text-[#555b7b] hover:bg-[#fbfbfe] hover:text-[#111426] transition"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>{t("knowledgeBase.viewer.rawFile", "源文件")}</span>
                                </a>
                            ) : null}
                        </div>
                    </div>

                    {/* Tab 1: 知识结构导图 */}
                    {tab === "structure" ? (
                        <div className="space-y-4">
                            {file?.structureMessage ? (
                                <div className="flex items-center gap-2 rounded-xl border border-[#7771ed]/20 bg-[#f2f1fd]/60 p-3 text-caption text-[#6765f6]">
                                    <Sparkles className="h-4 w-4 shrink-0" />
                                    <span>{file.structureMessage}</span>
                                </div>
                            ) : null}

                            {structure?.root ? (
                                <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-[#eef0f6] bg-[#fbfbfe] p-4">
                                    <StructureNodeCard
                                        node={structure.root}
                                        onChapterClick={(chapterId) => {
                                            setSelectedChapterId(chapterId);
                                            setTab("chapters");
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[#e9eaf4] bg-[#fbfbfe] p-8 text-center">
                                    <Network className="mx-auto h-10 w-10 text-[#8e94ad]" />
                                    <div className="mt-3 text-title font-medium text-[#111426]">
                                        {t("knowledgeBase.viewer.noStructureTitle", "暂无结构图")}
                                    </div>
                                    <div className="mt-1 text-caption text-[#8e94ad]">
                                        {file?.structureMessage || t("knowledgeBase.viewer.noStructureDesc", "大部头文件可进入「章节大纲」按需生成对应章节的脑图。")}
                                    </div>
                                    <Button
                                        className="mt-4"
                                        size="sm"
                                        icon={Sparkles}
                                        loading={actionLoading}
                                        onClick={handleRegenerateStructure}
                                    >
                                        {t("knowledgeBase.viewer.generateNow", "立即生成结构图")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Tab 2: 章节大纲与正文 */}
                    {tab === "chapters" ? (
                        <div className="grid min-h-[460px] gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
                            {/* 左侧章节目录树 */}
                            <div className="flex flex-col rounded-2xl border border-[#eef0f6] bg-[#fbfbfe] p-3">
                                <div className="mb-2 px-2 text-caption font-semibold text-[#8e94ad] uppercase">
                                    {t("knowledgeBase.viewer.outline", "章节目录")} ({chapters.length})
                                </div>
                                <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                                    {chapters.map((ch) => (
                                        <div
                                            key={ch.id}
                                            className={`group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-caption transition ${
                                                selectedChapterId === ch.id
                                                    ? "bg-[#f2f1fd] text-[#6765f6] font-semibold"
                                                    : "text-[#555b7b] hover:bg-white hover:text-[#111426]"
                                            }`}
                                            style={{ paddingLeft: `${Math.max(0, (ch.level || 1) - 1) * 12 + 10}px` }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedChapterId(ch.id)}
                                                className="truncate text-left flex-1"
                                                title={ch.title}
                                            >
                                                {ch.title}
                                            </button>

                                            {ch.structureStatus === "PENDING" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateChapterStructure(ch.id)}
                                                    className="rounded px-1.5 py-0.5 text-micro text-[#6765f6] hover:bg-[#6765f6] hover:text-white transition"
                                                    title={t("knowledgeBase.viewer.genChapterMindmap", "生成本章脑图")}
                                                >
                                                    出图
                                                </button>
                                            ) : ch.structureStatus === "READY" ? (
                                                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                            ) : null}
                                        </div>
                                    ))}

                                    {chapters.length === 0 ? (
                                        <div className="py-8 text-center text-caption text-[#8e94ad]">
                                            {t("knowledgeBase.viewer.noChapters", "未识别出章节")}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* 右侧正文阅读器 */}
                            <div className="flex flex-col rounded-2xl border border-[#eef0f6] bg-white p-4">
                                <div className="mb-3 flex items-center justify-between border-b border-[#eef0f6] pb-2">
                                    <div className="truncate text-body font-semibold text-[#111426]">
                                        {activeChapter?.title || t("knowledgeBase.viewer.excerptTitle", "正文节选")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon={Copy}
                                            onClick={copyCurrentText}
                                        >
                                            {t("common.copy", "复制")}
                                        </Button>
                                        {!fullContent ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                loading={contentLoading}
                                                onClick={handleLoadFullContent}
                                            >
                                                {t("knowledgeBase.viewer.loadFull", "加载全文")}
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto rounded-xl bg-[#fbfbfe] border border-[#eef0f6] p-4 text-body text-[#111426] leading-relaxed text-sm select-text">
                                    {displayText ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {displayText}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="py-12 text-center text-[#8e94ad]">
                                            {t("knowledgeBase.viewer.noContent", "暂无文本内容")}
                                        </div>
                                    )}
                                </div>

                                {previewData.excerptTruncated && !fullContent ? (
                                    <div className="mt-2 text-micro text-[#8e94ad] text-center">
                                        {t("knowledgeBase.viewer.truncatedNotice", "（首屏仅展示前 2000 字片段，点击右上角「加载全文」阅读完整正文）")}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {/* Tab 3: 文件属性与标签 */}
                    {tab === "info" ? (
                        <div className="space-y-6 rounded-2xl border border-[#eef0f6] bg-white p-6">
                            {/* 元属性网格 */}
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                <div>
                                    <span className="text-caption text-[#8e94ad]">{t("knowledgeBase.files.originalName", "原始文件名")}</span>
                                    <div className="mt-1 text-body font-medium text-[#111426] truncate">{file?.originalName}</div>
                                </div>
                                <div>
                                    <span className="text-caption text-[#8e94ad]">{t("knowledgeBase.files.size", "文件大小")}</span>
                                    <div className="mt-1 text-body font-medium text-[#111426]">{formatBytes(file?.sizeBytes)}</div>
                                </div>
                                <div>
                                    <span className="text-caption text-[#8e94ad]">{t("knowledgeBase.files.status", "知识化状态")}</span>
                                    <div className="mt-1 text-body font-medium text-[#111426]">{file?.structureStatus}</div>
                                </div>
                                <div>
                                    <span className="text-caption text-[#8e94ad]">{t("knowledgeBase.files.charCount", "提取正文字数")}</span>
                                    <div className="mt-1 text-body font-medium text-[#111426]">{file?.charCount ?? 0} 字</div>
                                </div>
                                <div>
                                    <span className="text-caption text-[#8e94ad]">{t("knowledgeBase.files.chapterCount", "识别章节数")}</span>
                                    <div className="mt-1 text-body font-medium text-[#111426]">{file?.chapterCount ?? 0} 章</div>
                                </div>
                                <div>
                                    <span className="text-caption text-[#8e94ad]">{t("knowledgeBase.files.fileHash", "SHA-256 哈希")}</span>
                                    <div className="mt-1 text-micro font-mono text-[#111426] truncate" title={file?.fileHash}>
                                        {file?.fileHash}
                                    </div>
                                </div>
                            </div>

                            {/* 标签管理 */}
                            <div className="border-t border-[#eef0f6] pt-4">
                                <div className="text-caption font-semibold text-[#555b7b] mb-2">
                                    {t("knowledgeBase.files.manageTags", "文件关联标签")}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {(file?.tags || []).map((t) => (
                                        <span
                                            key={t.id}
                                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption bg-[#fbfbfe] border border-[#eef0f6] text-[#111426]"
                                        >
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: t.color || "#6765f6" }}
                                            />
                                            <span>{t.name}</span>
                                            {t.source === "AUTO" ? (
                                                <span className="rounded bg-[#f2f1fd] px-1 text-micro text-[#6765f6]">
                                                    自动
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(t.id)}
                                                    className="text-[#8e94ad] hover:text-rose-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </span>
                                    ))}

                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            className="rounded-full border border-[#e9eaf4] bg-[#fbfbfe] px-3 py-1 text-caption text-[#111426] placeholder:text-[#8e94ad] focus:border-[#6765f6] focus:bg-white focus:outline-none transition"
                                            placeholder={t("knowledgeBase.tags.typeAndEnter", "输入标签后回车")}
                                            value={newTagInput}
                                            onChange={(e) => setNewTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 高级操作 */}
                            <div className="border-t border-[#eef0f6] pt-4 flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    icon={RefreshCw}
                                    loading={actionLoading}
                                    onClick={handleReidentify}
                                >
                                    {t("knowledgeBase.viewer.reidentifyBtn", "重新解析章节与正文")}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </Modal>
    );
};

KnowledgeFileViewerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    fileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onClose: PropTypes.func.isRequired,
    onFileUpdated: PropTypes.func,
};

export default KnowledgeFileViewerModal;
