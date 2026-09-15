import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Folder } from "lucide-react";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import FormField from "@components/common/FormField";

/**
 * 移动文件或文件夹的目标选择模态框
 */
const KnowledgeMoveModal = ({
    isOpen,
    onClose,
    onSubmit,
    targetItem, // { type: 'file' | 'folder', id, name, folderId?, parentId?, path? }
    folders = [],
    loading = false,
}) => {
    const { t } = useTranslation();
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const isFolder = targetItem?.type === "folder";

    // 过滤不可选目标：不能选自身或自身子目录（通过 path 判别）
    const validFolders = folders.filter((f) => {
        if (!isFolder) return true;
        if (f.id === targetItem?.id) return false;
        if (targetItem?.path && f.path?.startsWith(targetItem.path)) return false;
        return true;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFolderId && !isFolder) return;
        await onSubmit(targetItem, selectedFolderId);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                isFolder
                    ? t("knowledgeBase.folders.moveTitle", "移动文件夹")
                    : t("knowledgeBase.files.moveTitle", "移动文件到文件夹")
            }
            width="max-w-md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        {t("common.cancel", "取消")}
                    </Button>
                    <Button
                        type="submit"
                        form="move-form"
                        loading={loading}
                        disabled={selectedFolderId === null}
                    >
                        {t("common.confirm", "确定")}
                    </Button>
                </>
            }
        >
            <form id="move-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-3 text-caption text-[#8e94ad] dark:border-white/5 dark:bg-white/[0.02]">
                    {t("knowledgeBase.move.targetItem", "正在移动：")}
                    <span className="font-semibold text-[#111426] dark:text-white">
                        {targetItem?.name || targetItem?.displayName}
                    </span>
                </div>

                <FormField
                    label={t("knowledgeBase.move.selectFolder", "选择目标文件夹")}
                    required
                >
                    <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-[#eef0f6] bg-[#fbfbfe] p-2 dark:border-white/5 dark:bg-white/[0.02]">
                        {isFolder ? (
                            <button
                                type="button"
                                onClick={() => setSelectedFolderId(0)}
                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-caption transition ${
                                    selectedFolderId === 0
                                        ? "bg-[#f2f1fd] text-[#6765f6] font-semibold dark:bg-blue-950/30 dark:text-blue-400"
                                        : "text-[#555b7b] hover:bg-[#f7f6fc] dark:text-slate-300 dark:hover:bg-white/5"
                                }`}
                            >
                                <Folder className="h-4 w-4 shrink-0 text-amber-500 fill-amber-400/40" />
                                <span>{t("knowledgeBase.folders.root", "根目录")}</span>
                            </button>
                        ) : null}

                        {validFolders.map((folder) => {
                            const indent = Math.max(0, (folder.depth || 1) - 1) * 16;
                            return (
                                <button
                                    key={folder.id}
                                    type="button"
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    style={{ paddingLeft: `${indent + 12}px` }}
                                    className={`flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-caption transition ${
                                        selectedFolderId === folder.id
                                            ? "bg-[#f2f1fd] text-[#6765f6] font-semibold dark:bg-blue-950/30 dark:text-blue-400"
                                            : "text-[#555b7b] hover:bg-[#f7f6fc] dark:text-slate-300 dark:hover:bg-white/5"
                                    }`}
                                >
                                    <Folder className="h-4 w-4 shrink-0 text-amber-500 fill-amber-400/40" />
                                    <span className="truncate">{folder.name}</span>
                                    <span className="ml-auto text-micro text-[#8e94ad]">
                                        ({folder.fileCount ?? 0})
                                    </span>
                                </button>
                            );
                        })}

                        {validFolders.length === 0 && !isFolder ? (
                            <div className="py-6 text-center text-caption text-[#8e94ad]">
                                {t("knowledgeBase.folders.noValidTarget", "无可用目标文件夹")}
                            </div>
                        ) : null}
                    </div>
                </FormField>
            </form>
        </Modal>
    );
};

KnowledgeMoveModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    targetItem: PropTypes.object,
    folders: PropTypes.array,
    loading: PropTypes.bool,
};

export default KnowledgeMoveModal;
