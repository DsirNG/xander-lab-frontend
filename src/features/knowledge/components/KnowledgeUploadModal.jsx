import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { UploadCloud, File, X, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import FormField from "@components/common/FormField";
import CustomSelect from "@components/common/CustomSelect";
import { formInputCls } from "@components/common/formStyles";
import { formatBytes } from "../utils/fileHash";

const ALLOWED_EXTENSIONS = [
    "txt", "md", "markdown", "html", "htm", "csv", "json", "log", "pdf", "doc", "docx"
];

const MAX_BYTES = 50 * 1024 * 1024; // 50MB

const KnowledgeUploadModal = ({
    isOpen,
    onClose,
    folders = [],
    defaultFolderId = null,
    onUpload, // async ({ file, folderId, tagNames, onProgress, signal }) => void
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const abortRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [targetFolderId, setTargetFolderId] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stageText, setStageText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setTagInput("");
            setTags([]);
            setUploading(false);
            setProgress(0);
            setStageText("");
            setErrorMessage("");
            // 自动选中有效文件夹（根目录不能放文件，必须 > 0）
            if (defaultFolderId && defaultFolderId > 0) {
                setTargetFolderId(defaultFolderId);
            } else if (folders.length > 0) {
                setTargetFolderId(folders[0].id);
            } else {
                setTargetFolderId("");
            }
        }
    }, [isOpen, defaultFolderId, folders]);

    const handleFileChange = (file) => {
        setErrorMessage("");
        if (!file) return;

        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setErrorMessage(
                t(
                    "knowledgeBase.upload.unsupportedExt",
                    `不支持该文件类型（仅支持 ${ALLOWED_EXTENSIONS.slice(0, 6).join(", ")} 等）`,
                ),
            );
            return;
        }

        if (file.size > MAX_BYTES) {
            setErrorMessage(
                t(
                    "knowledgeBase.upload.tooLarge",
                    `文件过大（不能超过 ${formatBytes(MAX_BYTES)}）`,
                ),
            );
            return;
        }

        setSelectedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleAddTag = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^#/, "");
            if (trimmed && !tags.includes(trimmed)) {
                setTags([...tags, trimmed]);
                setTagInput("");
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile || !targetFolderId || uploading) return;

        setUploading(true);
        setProgress(0);
        setStageText(t("knowledgeBase.upload.preparing", "正在准备上传..."));
        setErrorMessage("");

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            await onUpload({
                file: selectedFile,
                folderId: Number(targetFolderId),
                tagNames: tags,
                onProgress: (pct, stage) => {
                    setProgress(pct);
                    if (stage) setStageText(stage);
                },
                signal: controller.signal,
            });
            onClose();
        } catch (err) {
            if (controller.signal.aborted) {
                setErrorMessage(t("knowledgeBase.upload.cancelled", "已取消上传"));
            } else {
                setErrorMessage(err.message || t("knowledgeBase.upload.failed", "上传失败"));
            }
        } finally {
            setUploading(false);
            abortRef.current = null;
        }
    };

    const handleCancel = () => {
        if (uploading && abortRef.current) {
            abortRef.current.abort();
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title={t("knowledgeBase.upload.title", "上传文档到知识库")}
            width="max-w-lg"
            footer={
                <>
                    <Button variant="ghost" onClick={handleCancel} disabled={uploading}>
                        {t("common.cancel", "取消")}
                    </Button>
                    <Button
                        type="submit"
                        form="upload-form"
                        loading={uploading}
                        disabled={!selectedFile || !targetFolderId || folders.length === 0}
                    >
                        {uploading
                            ? t("knowledgeBase.upload.uploadingBtn", "正在上传...")
                            : t("knowledgeBase.upload.submitBtn", "开始上传")}
                    </Button>
                </>
            }
        >
            <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
                {errorMessage ? (
                    <div className="flex items-center gap-2 rounded-xl bg-danger-soft p-3 text-caption text-danger">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                ) : null}

                {/* 目标文件夹选择 */}
                <FormField
                    label={t("knowledgeBase.upload.targetFolder", "存储目标文件夹")}
                    required
                >
                    {folders.length === 0 ? (
                        <div className="rounded-xl border border-warning/30 bg-warning-soft p-3 text-caption text-warning-fg">
                            {t(
                                "knowledgeBase.upload.needFolderFirst",
                                "请先在左侧新建至少一个分类文件夹，根目录不可直接放置文件。",
                            )}
                        </div>
                    ) : (
                        <CustomSelect
                            size="sm"
                            variant="outline"
                            options={folders.map((f) => ({
                                value: String(f.id),
                                label: `${"— ".repeat(Math.max(0, (f.depth || 1) - 1))}${f.name}`,
                            }))}
                            value={String(targetFolderId)}
                            onChange={(val) => setTargetFolderId(Number(val) || val)}
                            disabled={uploading}
                            triggerClassName="!border-[#e9eaf4] !bg-white !text-[#555b7b] hover:!border-[#6765f6] hover:!bg-[#fbfbfe] rounded-xl"
                            dropdownClassName="!border-[#eef0f6] !bg-white !shadow-xl !shadow-[#111426]/8 rounded-xl"
                        />
                    )}
                </FormField>

                {/* 拖拽放置区 / 文件选择 */}
                <FormField
                    label={t("knowledgeBase.upload.selectFileLabel", "选择文件")}
                    required
                >
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                            isDragOver
                                ? "border-[#6765f6] bg-[#f2f1fd]/50"
                                : "border-[#e9eaf4] hover:border-[#6765f6]/60 hover:bg-[#fbfbfe]"
                        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0])}
                            accept=".txt,.md,.markdown,.html,.htm,.csv,.json,.log,.pdf,.doc,.docx"
                        />

                        {selectedFile ? (
                            <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#eef0f6] bg-white p-3 text-left shadow-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <File className="h-5 w-5 text-[#6765f6] shrink-0" />
                                    <div className="truncate">
                                        <div className="truncate text-body font-medium text-[#111426]">
                                            {selectedFile.name}
                                        </div>
                                        <div className="text-micro text-[#8e94ad]">
                                            {formatBytes(selectedFile.size)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }}
                                    className="rounded-lg p-1 text-[#8e94ad] hover:bg-[#fbfbfe] hover:text-[#111426]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="h-10 w-10 text-[#6765f6]/80 transition group-hover:scale-110" />
                                <div className="mt-2 text-body font-medium text-[#111426]">
                                    {t("knowledgeBase.upload.dragHint", "拖拽文件到这里，或点击浏览")}
                                </div>
                                <div className="mt-1 text-caption text-[#8e94ad]">
                                    {t(
                                        "knowledgeBase.upload.supportHint",
                                        "支持 Markdown、PDF、Word、TXT、JSON、HTML 等格式（单文件最大 50MB）",
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </FormField>

                {/* 附加手动标签 */}
                <FormField
                    label={t("knowledgeBase.upload.tagsLabel", "附加标签（可选）")}
                >
                    <div className="space-y-2">
                        <input
                            type="text"
                            className={formInputCls}
                            placeholder={t(
                                "knowledgeBase.upload.tagsPlaceholder",
                                "输入标签名后按回车添加",
                            )}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            disabled={uploading}
                        />
                        {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 rounded-full bg-[#f2f1fd] border border-[#e2e0fb] px-2.5 py-0.5 text-caption text-[#6765f6]"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-[#8e94ad] hover:text-[#111426]"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </FormField>

                {/* 上传与智能结构化进度条 */}
                {uploading ? (
                    <div className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-4">
                        <div className="flex items-center justify-between text-caption font-medium text-[#111426]">
                            <span>{stageText}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eef0f6]">
                            <div
                                className="h-full rounded-full bg-[#6765f6] transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-2 text-micro text-[#8e94ad]">
                            {t(
                                "knowledgeBase.upload.progressDesc",
                                "文件入库后将自动抽取正文并识别章节与知识图谱节点...",
                            )}
                        </div>
                    </div>
                ) : null}
            </form>
        </Modal>
    );
};

KnowledgeUploadModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    folders: PropTypes.array,
    defaultFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onUpload: PropTypes.func.isRequired,
};

export default KnowledgeUploadModal;
