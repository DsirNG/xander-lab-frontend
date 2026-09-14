import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@components/common/LoadingSpinner";
import ConfirmModal from "@components/common/ConfirmModal";
import KnowledgeFolderTree from "./KnowledgeFolderTree";
import KnowledgeFileList from "./KnowledgeFileList";
import KnowledgeStructurePreviewPanel from "./KnowledgeStructurePreviewPanel";
import KnowledgeFolderModal from "./KnowledgeFolderModal";
import KnowledgeMoveModal from "./KnowledgeMoveModal";
import KnowledgeUploadModal from "./KnowledgeUploadModal";
import KnowledgeFileViewerModal from "./KnowledgeFileViewerModal";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import FormField from "@components/common/FormField";
import { formInputCls } from "@components/common/formStyles";
import RowActionsMenu from "@components/common/RowActionsMenu";
import { Plus, RefreshCw, Tag as TagIcon, Sparkles } from "lucide-react";
import KnowledgeBaseSkeleton from "./KnowledgeBaseSkeleton";
import { knowledgeBaseService } from "../services/knowledgeBaseService";

const KnowledgeDocBaseView = ({ onSwitchToMirror }) => {
    const { t } = useTranslation();

    // 状态
    const [folders, setFolders] = useState([]);
    const [tags, setTags] = useState([]);
    const [files, setFiles] = useState([]);
    const [totalFiles, setTotalFiles] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [activeFolderId, setActiveFolderId] = useState(null); // null: 全部文件
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [extensionFilter, setExtensionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortFilter, setSortFilter] = useState("recent");

    // 当前选中的文档（点击后在右侧展示知识结构预览）
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);

    // 弹窗状态
    const [folderModalOpen, setFolderModalOpen] = useState(false);
    const [folderModalParentId, setFolderModalParentId] = useState(0);
    const [editingFolder, setEditingFolder] = useState(null);
    const [folderSaving, setFolderSaving] = useState(false);

    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [moveTargetItem, setMoveTargetItem] = useState(null);
    const [moveSaving, setMoveSaving] = useState(false);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewingFileId, setViewingFileId] = useState(null);

    // 新建标签弹窗
    const [createTagModalOpen, setCreateTagModalOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [tagSaving, setTagSaving] = useState(false);

    const [confirmDeleteState, setConfirmDeleteState] = useState({
        open: false,
        type: null, // 'folder' | 'file'
        item: null,
    });

    // 1. 加载文件夹树与全局标签词表
    const loadFoldersAndTags = useCallback(async (signal) => {
        try {
            const [folderList, tagList] = await Promise.all([
                knowledgeBaseService.folders.list({ signal, _silent: true }),
                knowledgeBaseService.tags.list({ signal, _silent: true }),
            ]);
            setFolders(Array.isArray(folderList) ? folderList : []);
            setTags(Array.isArray(tagList) ? tagList : []);
        } catch {
            // silent catch
        }
    }, []);

    // 2. 加载文档列表（后端分页结构为 records / total / page / size）
    const loadFiles = useCallback(
        async (signal) => {
            setFilesLoading(true);
            try {
                const query = {
                    folderId: activeFolderId || undefined,
                    recursive: false,
                    keyword: keyword.trim() || undefined,
                    extension: extensionFilter || undefined,
                    tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
                    status: statusFilter || undefined,
                    page,
                    size: pageSize,
                };
                const result = await knowledgeBaseService.files.search(query, {
                    signal,
                    _silent: true,
                });
                if (result) {
                    let list =
                        result.records ||
                        result.items ||
                        (Array.isArray(result) ? result : []);

                    // 客户端友好排序
                    if (sortFilter === "recent") {
                        list = [...list].sort(
                            (a, b) =>
                                new Date(b.updatedAt || b.createdAt || 0) -
                                new Date(a.updatedAt || a.createdAt || 0),
                        );
                    } else if (sortFilter === "oldest") {
                        list = [...list].sort(
                            (a, b) =>
                                new Date(a.updatedAt || a.createdAt || 0) -
                                new Date(b.updatedAt || b.createdAt || 0),
                        );
                    } else if (sortFilter === "name") {
                        list = [...list].sort((a, b) =>
                            (a.displayName || "").localeCompare(b.displayName || ""),
                        );
                    } else if (sortFilter === "size") {
                        list = [...list].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
                    }

                    setFiles(list);
                    setTotalFiles(result.total ?? list.length);

                    // 如果当前选中的文件已不在列表中且不是全景查看中，保持或更新选定
                    setSelectedFile((prev) => {
                        if (!prev) return null;
                        const refreshed = list.find((f) => f.id === prev.id);
                        return refreshed || prev;
                    });
                }
            } catch {
                setFiles([]);
                setTotalFiles(0);
            } finally {
                setFilesLoading(false);
            }
        },
        [activeFolderId, keyword, extensionFilter, statusFilter, sortFilter, selectedTagIds, page, pageSize],
    );

    // 面包屑路径
    const breadcrumbs = useMemo(() => {
        if (!activeFolderId) {
            return [{ id: null, name: t("knowledgeBase.folders.allDocs", "全部文档") }];
        }
        const crumbs = [];
        let curr = folders.find((f) => f.id === activeFolderId);
        while (curr) {
            crumbs.unshift({ id: curr.id, name: curr.name });
            curr = curr.parentId && curr.parentId > 0
                ? folders.find((f) => f.id === curr.parentId)
                : null;
        }
        crumbs.unshift({ id: null, name: t("knowledgeBase.folders.allDocs", "全部文档") });
        return crumbs;
    }, [activeFolderId, folders, t]);

    // 当前选定层级下的子文件夹列表（方案一：全部文档模式下不混入文件夹，专注文档；具体文件夹下严格展示直属子目录）
    const currentSubfolders = useMemo(() => {
        if (activeFolderId === null) {
            return [];
        }
        return folders.filter((f) => (f.parentId || 0) === activeFolderId);
    }, [activeFolderId, folders]);

    // 初始化加载分类与标签
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        loadFoldersAndTags(controller.signal).finally(() => {
            setLoading(false);
        });
        return () => controller.abort();
    }, [loadFoldersAndTags]);

    // 加载文档列表（受目录、搜索、筛选及分页驱动）
    useEffect(() => {
        const controller = new AbortController();
        loadFiles(controller.signal);
        return () => controller.abort();
    }, [loadFiles]);

    // 文件夹操作
    const handleOpenCreateFolder = (parentId = 0) => {
        setEditingFolder(null);
        setFolderModalParentId(parentId);
        setFolderModalOpen(true);
    };

    const handleOpenRenameFolder = (folder) => {
        setEditingFolder(folder);
        setFolderModalParentId(folder.parentId || 0);
        setFolderModalOpen(true);
    };

    const handleSubmitFolder = async ({ id, parentId, name }) => {
        setFolderSaving(true);
        try {
            if (id) {
                await knowledgeBaseService.folders.rename(id, name);
                window.__toast?.("success", t("knowledgeBase.folders.renamed", "文件夹重命名成功"));
            } else {
                await knowledgeBaseService.folders.create({ parentId, name });
                window.__toast?.("success", t("knowledgeBase.folders.created", "文件夹新建成功"));
            }
            setFolderModalOpen(false);
            await loadFoldersAndTags();
        } finally {
            setFolderSaving(false);
        }
    };

    const handleOpenMoveFolder = (folder) => {
        setMoveTargetItem({ ...folder, type: "folder" });
        setMoveModalOpen(true);
    };

    const handleOpenMoveFile = (file) => {
        setMoveTargetItem({ ...file, type: "file" });
        setMoveModalOpen(true);
    };

    const handleSubmitMove = async (targetItem, targetFolderId) => {
        setMoveSaving(true);
        try {
            if (targetItem.type === "folder") {
                await knowledgeBaseService.folders.move(targetItem.id, targetFolderId);
                window.__toast?.("success", t("knowledgeBase.folders.moved", "文件夹移动成功"));
                await loadFoldersAndTags();
            } else {
                await knowledgeBaseService.files.move(targetItem.id, targetFolderId);
                window.__toast?.("success", t("knowledgeBase.files.moved", "文件移动成功"));
                await Promise.all([loadFoldersAndTags(), loadFiles()]);
            }
            setMoveModalOpen(false);
        } finally {
            setMoveSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        const { type, item } = confirmDeleteState;
        if (!item) return;

        try {
            if (type === "folder") {
                await knowledgeBaseService.folders.delete(item.id, true);
                window.__toast?.("success", t("knowledgeBase.folders.deleted", "文件夹已删除"));
                if (activeFolderId === item.id) {
                    setActiveFolderId(null);
                }
            } else if (type === "file") {
                await knowledgeBaseService.files.delete(item.id);
                window.__toast?.("success", t("knowledgeBase.files.deleted", "文件已删除"));
                if (selectedFile?.id === item.id) {
                    setSelectedFile(null);
                }
            }
            setConfirmDeleteState({ open: false, type: null, item: null });
            await Promise.all([loadFoldersAndTags(), loadFiles()]);
        } catch {
            // handled
        }
    };

    // 智能上传
    const handleUploadFile = async ({ file, folderId, tagNames, onProgress, signal }) => {
        const created = await knowledgeBaseService.uploadSmart({
            file,
            folderId,
            tagNames,
            onProgress,
            signal,
        });
        window.__toast?.("success", t("knowledgeBase.upload.success", "文件上传与入库成功"));
        await Promise.all([loadFoldersAndTags(), loadFiles()]);
        // 自动选中新上传的文件并在右侧预览
        if (created) {
            setSelectedFile(created);
        }
    };

    // 标签过滤与创建
    const handleToggleTag = (tagId) => {
        setSelectedTagIds((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
        );
        setPage(1);
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        const trimmed = newTagName.trim();
        if (!trimmed) return;
        setTagSaving(true);
        try {
            await knowledgeBaseService.tags.create({ name: trimmed });
            window.__toast?.("success", t("knowledgeBase.tags.created", "标签创建成功"));
            setCreateTagModalOpen(false);
            setNewTagName("");
            await loadFoldersAndTags();
        } finally {
            setTagSaving(false);
        }
    };

    if (loading) {
        return <KnowledgeBaseSkeleton />;
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col space-y-4 overflow-hidden p-5 text-body text-[#555b7b]">
            {/* 顶部标题与全局操作栏 (1:1 统一工作台设计规范) */}
            <div className="flex shrink-0 items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#111426] dark:text-white">
                        {t("knowledgeBase.title", "知识库")}
                    </h1>
                    <p className="mt-1 text-caption text-[#8b91a9]">
                        {t("knowledgeBase.subtitle", "沉淀有价值的知识，让 AI 理解你的专业")}
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setUploadModalOpen(true)}
                        className="bg-[#7771ed] hover:bg-[#6862e3] text-white rounded-xl shadow-xs"
                    >
                        上传文件
                    </Button>
                    <Button
                        variant="outline"
                        icon={Plus}
                        onClick={() => handleOpenCreateFolder(activeFolderId || 0)}
                        className="border-[#e9eaf4] bg-white/70 text-[#59617e] hover:bg-white hover:text-[#111426] rounded-xl shadow-2xs"
                    >
                        新建文件夹
                    </Button>
                    <RowActionsMenu
                        size="md"
                        align="right"
                        actions={[
                            {
                                key: "refresh",
                                label: "刷新知识库",
                                icon: RefreshCw,
                                onClick: () => {
                                    loadFoldersAndTags();
                                    loadFiles();
                                },
                            },
                            {
                                key: "createTag",
                                label: "新建标签",
                                icon: TagIcon,
                                onClick: () => setCreateTagModalOpen(true),
                            },
                            ...(onSwitchToMirror
                                ? [
                                      {
                                          key: "mirror",
                                          label: "知识镜像 / 复习",
                                          icon: Sparkles,
                                          onClick: onSwitchToMirror,
                                      },
                                  ]
                                : []),
                        ]}
                    />
                </div>
            </div>

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
                                knowledgeBaseService.files
                                    .rename(file.id, newName.trim())
                                    .then(() => {
                                        window.__toast?.("success", "重命名成功");
                                        loadFiles();
                                    });
                            }
                        }}
                        onMoveFile={handleOpenMoveFile}
                        onDeleteFile={(file) =>
                            setConfirmDeleteState({ open: true, type: "file", item: file })
                        }
                        onReidentifyFile={(fileId) => {
                            knowledgeBaseService.files.reidentify(fileId).then(() => {
                                window.__toast?.("success", "重新识别任务已完成");
                                loadFiles();
                            });
                        }}
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

            {/* 新建标签模态框 */}
            <Modal
                isOpen={createTagModalOpen}
                onClose={() => setCreateTagModalOpen(false)}
                title="新建标签"
                width="max-w-sm"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setCreateTagModalOpen(false)}
                            disabled={tagSaving}
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            form="create-tag-inline-form"
                            loading={tagSaving}
                            disabled={!newTagName.trim()}
                        >
                            确定
                        </Button>
                    </>
                }
            >
                <form id="create-tag-inline-form" onSubmit={handleCreateTag} className="space-y-4">
                    <FormField label="标签名称" required>
                        <input
                            type="text"
                            className={formInputCls}
                            placeholder="例如：AI、产品设计"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            maxLength={60}
                            autoFocus
                        />
                    </FormField>
                </form>
            </Modal>

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
