import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, X } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import { formatBytes } from "../utils/fileHash";

const KnowledgeFileInfoPanel = ({
    file,
    actionLoading,
    newTagInput,
    onNewTagInputChange,
    onAddTag,
    onRemoveTag,
    onReidentify,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 rounded-2xl border border-[#eef0f6] bg-white p-6">
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

            <div className="border-t border-[#eef0f6] pt-4">
                <div className="text-caption font-semibold text-[#555b7b] mb-2">
                    {t("knowledgeBase.files.manageTags", "文件关联标签")}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {(file?.tags || []).map((fileTag) => (
                        <span
                            key={fileTag.id}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption bg-[#fbfbfe] border border-[#eef0f6] text-[#111426]"
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: fileTag.color || "#6765f6" }}
                            />
                            <span>{fileTag.name}</span>
                            {fileTag.source === "AUTO" ? (
                                <span className="rounded bg-[#f2f1fd] px-1 text-micro text-[#6765f6]">
                                    自动
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onRemoveTag(fileTag.id)}
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
                            onChange={(event) => onNewTagInputChange(event.target.value)}
                            onKeyDown={onAddTag}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-[#eef0f6] pt-4 flex flex-wrap gap-3">
                <Button
                    variant="outline"
                    icon={RefreshCw}
                    loading={actionLoading}
                    onClick={onReidentify}
                >
                    {t("knowledgeBase.viewer.reidentifyBtn", "重新解析章节与正文")}
                </Button>
            </div>
        </div>
    );
};

export default KnowledgeFileInfoPanel;
