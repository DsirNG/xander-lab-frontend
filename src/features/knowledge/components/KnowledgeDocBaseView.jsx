import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import KnowledgeFolderTree from "./KnowledgeFolderTree";
import KnowledgeFileList from "./KnowledgeFileList";
import KnowledgeStructurePreviewPanel from "./KnowledgeStructurePreviewPanel";
import KnowledgeFolderModal from "./KnowledgeFolderModal";
import KnowledgeMoveModal from "./KnowledgeMoveModal";
import KnowledgeUploadModal from "./KnowledgeUploadModal";
import KnowledgeFileViewerModal from "./KnowledgeFileViewerModal";
import KnowledgeBaseSkeleton from "./KnowledgeBaseSkeleton";
import KnowledgeCreateTagModal from "./KnowledgeCreateTagModal";
import KnowledgeDocHeader from "./KnowledgeDocHeader";
import useKnowledgeLibrary from "../hooks/useKnowledgeLibrary";

const KnowledgeDocBaseView = ({ onSwitchToMirror }) => {
    const { t } = useTranslation();

    const {
        folders,
        tags,
        files,
        totalFiles,
        page,
        pageSize,
        activeFolderId,
        selectedTagIds,
        keyword,
        extensionFilter,
        statusFilter,
        sortFilter,
        selectedFile,
        loading,
        filesLoading,
        folderModalOpen,
        folderModalParentId,
        editingFolder,
        folderSaving,
        moveModalOpen,
        moveTargetItem,
        moveSaving,
        uploadModalOpen,
        viewerOpen,
        viewingFileId,
        createTagModalOpen,
        newTagName,
        tagSaving,
        confirmDeleteState,
        breadcrumbs,
        currentSubfolders,
        loadFoldersAndTags,
        loadFiles,
        handleOpenCreateFolder,
        handleOpenRenameFolder,
        handleSubmitFolder,
        handleOpenMoveFolder,
        handleOpenMoveFile,
        handleSubmitMove,
        handleConfirmDelete,
        handleUploadFile,
        handleToggleTag,
        handleCreateTag,
        handleRenameFile,
        handleReidentifyFile,
        setPage,
        setPageSize,
        setActiveFolderId,
        setSelectedFile,
        setKeyword,
        setExtensionFilter,
        setStatusFilter,
        setSortFilter,
        setFolderModalOpen,
        setMoveModalOpen,
        setUploadModalOpen,
        setViewerOpen,
        setViewingFileId,
        setCreateTagModalOpen,
        setNewTagName,
        setConfirmDeleteState,
    } = useKnowledgeLibrary({ t });

    if (loading) {
        return <KnowledgeBaseSkeleton />;
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col space-y-4 overflow-hidden p-5 text-body text-[#555b7b]">
            <KnowledgeDocHeader
                onUpload={() => setUploadModalOpen(true)}
                onCreateFolder={() =>
                    handleOpenCreateFolder(activeFolderId || 0)
                }
                onRefresh={() => {
                    loadFoldersAndTags();
                    loadFiles();
                }}
                onCreateTag={() => setCreateTagModalOpen(true)}
                onSwitchToMirror={onSwitchToMirror}
            />

            {/* 下方三栏主区域 */}
            <div className="flex min-h-0 flex-1 gap-4">
                {/* 1. 左侧：知识库分类 + 标签导航 (工作台标准卡片) */}
                <div className="hidden w-64 shrink-0 flex-col rounded-2xl border border-[#e9eaf3] bg-white/70 p-4 lg:flex shadow-xs dark:border-white/5 dark:bg-surface overflow-hidden">
                    <KnowledgeFolderTree
                        folders={folders}
                        activeFolderId={activeFolderId}
                        tags={tags}
                        selectedTagIds={selectedTagIds}
                        loading={loading}
                        onToggleTag={handleToggleTag}
                        onCreateTag={() => setCreateTagModalOpen(true)}
                        onSelectFolder={(id) => {
                            setActiveFolderId(id);
                            setPage(1);
                        }}
                        onCreateFolder={handleOpenCreateFolder}
                        onRenameFolder={handleOpenRenameFolder}
                        onMoveFolder={handleOpenMoveFolder}
                        onDeleteFolder={(f) =>
                            setConfirmDeleteState({ open: true, type: "folder", item: f })
                        }
                    />
                </div>

                {/* 2. 中间：文件表格工作台 (工作台标准卡片) */}
                <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-[#e9eaf3] bg-white/70 p-4 shadow-xs dark:border-white/5 dark:bg-surface overflow-hidden">
                    <KnowledgeFileList
                        folders={folders}
                        activeFolderId={activeFolderId}
                        loading={filesLoading}
                        breadcrumbs={breadcrumbs}
                        subfolders={currentSubfolders}
                        files={files}
                        selectedFileId={selectedFile?.id}
                        onSelectFile={(file) => {
                            setSelectedFile((prev) => (prev?.id === file.id ? prev : file));
                        }}
                        total={totalFiles}
                        page={page}
                        size={pageSize}
                        keyword={keyword}
                        extensionFilter={extensionFilter}
                        onExtensionFilterChange={(val) => {
                            setExtensionFilter(val);
                            setPage(1);
                        }}
                        statusFilter={statusFilter}
                        onStatusFilterChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                        }}
                        sortFilter={sortFilter}
                        onSortFilterChange={(val) => {
                            setSortFilter(val);
                        }}
                        onSelectFolder={(id) => {
                            setActiveFolderId(id);
                            setPage(1);
                        }}
                        onCreateFolder={() => handleOpenCreateFolder(activeFolderId || 0)}
                        onRenameFolder={handleOpenRenameFolder}
                        onMoveFolder={handleOpenMoveFolder}
                        onDeleteFolder={(f) =>
                            setConfirmDeleteState({ open: true, type: "folder", item: f })
                        }
                        onPageChange={(p) => setPage(p)}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setPage(1);
                        }}
                        onSearchChange={(k) => {
                            setKeyword(k);
                            setPage(1);
                        }}
                        onPreviewFile={(id) => {
                            setViewingFileId(id);
                            setViewerOpen(true);
                        }}
                        onRenameFile={(file) => {
                            const newName = window.prompt("请输入新的文件名：", file.displayName);
                            if (newName && newName.trim() && newName.trim() !== file.displayName) {
                                handleRenameFile(file.id, newName.trim());
                            }
                        }}
                        onMoveFile={handleOpenMoveFile}
                        onDeleteFile={(file) =>
                            setConfirmDeleteState({ open: true, type: "file", item: file })
                        }
                        onReidentifyFile={handleReidentifyFile}
                        onOpenUpload={() => setUploadModalOpen(true)}
                    />
                </div>

            {/* 3. 右侧：知识结构预览面板 (Reference Image Right Panel - 点击文件后展示) */}
            {selectedFile ? (
                <KnowledgeStructurePreviewPanel
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                    onOpenFullViewer={(id) => {
                        setViewingFileId(id);
                        setViewerOpen(true);
                    }}
                />
            ) : null}
            </div>

            {/* 文件夹模态框 */}
            <KnowledgeFolderModal
                isOpen={folderModalOpen}
                onClose={() => setFolderModalOpen(false)}
                onSubmit={handleSubmitFolder}
                folder={editingFolder}
                parentId={folderModalParentId}
                loading={folderSaving}
            />

            {/* 移动文件/文件夹模态框 */}
            <KnowledgeMoveModal
                isOpen={moveModalOpen}
                onClose={() => setMoveModalOpen(false)}
                onSubmit={handleSubmitMove}
                targetItem={moveTargetItem}
                folders={folders}
                loading={moveSaving}
            />

            {/* 上传模态框 */}
            <KnowledgeUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                folders={folders}
                defaultFolderId={activeFolderId || (folders[0]?.id ?? null)}
                onUpload={handleUploadFile}
            />

            {/* 文件全景导图与正文阅览模态框 */}
            <KnowledgeFileViewerModal
                isOpen={viewerOpen}
                fileId={viewingFileId}
                onClose={() => {
                    setViewerOpen(false);
                    setViewingFileId(null);
                }}
                onFileUpdated={() => {
                    loadFiles();
                    loadFoldersAndTags();
                }}
            />

            <KnowledgeCreateTagModal
                isOpen={createTagModalOpen}
                saving={tagSaving}
                value={newTagName}
                onChange={setNewTagName}
                onClose={() => setCreateTagModalOpen(false)}
                onSubmit={handleCreateTag}
            />

            {/* 删除确认模态框 */}
            <ConfirmModal
                isOpen={confirmDeleteState.open}
                onClose={() => setConfirmDeleteState({ open: false, type: null, item: null })}
                onConfirm={handleConfirmDelete}
                title={
                    confirmDeleteState.type === "folder"
                        ? t("knowledgeBase.folders.confirmDeleteTitle", "删除文件夹")
                        : t("knowledgeBase.files.confirmDeleteTitle", "删除文件")
                }
                message={
                    confirmDeleteState.type === "folder"
                        ? t(
                              "knowledgeBase.folders.confirmDeleteMsg",
                              `确定删除文件夹「${confirmDeleteState.item?.name}」吗？其中的所有子文件夹和文档都将被彻底删除。`,
                          )
                        : t(
                              "knowledgeBase.files.confirmDeleteMsg",
                              `确定彻底删除文件「${confirmDeleteState.item?.displayName}」吗？对象存储与生成的结构导图将一并清除。`,
                          )
                }
                confirmText={t("common.delete", "彻底删除")}
                confirmVariant="danger"
            />
        </div>
    );
};

export default KnowledgeDocBaseView;
