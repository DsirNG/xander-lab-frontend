import { useCallback, useEffect, useMemo, useState } from "react";
import { knowledgeBaseService } from "../services/knowledgeBaseService";

export default function useKnowledgeLibrary({ t }) {
    const [folders, setFolders] = useState([]);
    const [tags, setTags] = useState([]);
    const [files, setFiles] = useState([]);
    const [totalFiles, setTotalFiles] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [activeFolderId, setActiveFolderId] = useState(null);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [extensionFilter, setExtensionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortFilter, setSortFilter] = useState("recent");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);

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
    const [createTagModalOpen, setCreateTagModalOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [tagSaving, setTagSaving] = useState(false);
    const [confirmDeleteState, setConfirmDeleteState] = useState({
        open: false,
        type: null,
        item: null,
    });

    const loadFoldersAndTags = useCallback(async (signal) => {
        try {
            const [folderList, tagList] = await Promise.all([
                knowledgeBaseService.folders.list({ signal, _silent: true }),
                knowledgeBaseService.tags.list({ signal, _silent: true }),
            ]);
            setFolders(Array.isArray(folderList) ? folderList : []);
            setTags(Array.isArray(tagList) ? tagList : []);
        } catch {
            // The page keeps its current data when the background refresh fails.
        }
    }, []);

    const loadFiles = useCallback(
        async (signal) => {
            setFilesLoading(true);
            try {
                const query = {
                    folderId: activeFolderId || undefined,
                    recursive: false,
                    keyword: keyword.trim() || undefined,
                    extension: extensionFilter || undefined,
                    tagIds:
                        selectedTagIds.length > 0 ? selectedTagIds : undefined,
                    status: statusFilter || undefined,
                    page,
                    size: pageSize,
                };
                const result = await knowledgeBaseService.files.search(query, {
                    signal,
                    _silent: true,
                });
                if (!result) return;

                let list =
                    result.records ||
                    result.items ||
                    (Array.isArray(result) ? result : []);
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
                        (a.displayName || "").localeCompare(
                            b.displayName || "",
                        ),
                    );
                } else if (sortFilter === "size") {
                    list = [...list].sort(
                        (a, b) => (b.fileSize || 0) - (a.fileSize || 0),
                    );
                }

                setFiles(list);
                setTotalFiles(result.total ?? list.length);
                setSelectedFile((previous) => {
                    if (!previous) return null;
                    return (
                        list.find((file) => file.id === previous.id) || previous
                    );
                });
            } catch {
                setFiles([]);
                setTotalFiles(0);
            } finally {
                setFilesLoading(false);
            }
        },
        [
            activeFolderId,
            extensionFilter,
            keyword,
            page,
            pageSize,
            selectedTagIds,
            sortFilter,
            statusFilter,
        ],
    );

    const breadcrumbs = useMemo(() => {
        if (!activeFolderId) {
            return [
                {
                    id: null,
                    name: t("knowledgeBase.folders.allDocs", "全部文档"),
                },
            ];
        }
        const crumbs = [];
        let current = folders.find((folder) => folder.id === activeFolderId);
        while (current) {
            crumbs.unshift({ id: current.id, name: current.name });
            current =
                current.parentId && current.parentId > 0
                    ? folders.find((folder) => folder.id === current.parentId)
                    : null;
        }
        crumbs.unshift({
            id: null,
            name: t("knowledgeBase.folders.allDocs", "全部文档"),
        });
        return crumbs;
    }, [activeFolderId, folders, t]);

    const currentSubfolders = useMemo(() => {
        if (activeFolderId === null) return [];
        return folders.filter(
            (folder) => (folder.parentId || 0) === activeFolderId,
        );
    }, [activeFolderId, folders]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        loadFoldersAndTags(controller.signal).finally(() => setLoading(false));
        return () => controller.abort();
    }, [loadFoldersAndTags]);

    useEffect(() => {
        const controller = new AbortController();
        loadFiles(controller.signal);
        return () => controller.abort();
    }, [loadFiles]);

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
                window.__toast?.(
                    "success",
                    t("knowledgeBase.folders.renamed", "文件夹重命名成功"),
                );
            } else {
                await knowledgeBaseService.folders.create({ parentId, name });
                window.__toast?.(
                    "success",
                    t("knowledgeBase.folders.created", "文件夹新建成功"),
                );
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
                await knowledgeBaseService.folders.move(
                    targetItem.id,
                    targetFolderId,
                );
                window.__toast?.(
                    "success",
                    t("knowledgeBase.folders.moved", "文件夹移动成功"),
                );
                await loadFoldersAndTags();
            } else {
                await knowledgeBaseService.files.move(
                    targetItem.id,
                    targetFolderId,
                );
                window.__toast?.(
                    "success",
                    t("knowledgeBase.files.moved", "文件移动成功"),
                );
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
                window.__toast?.(
                    "success",
                    t("knowledgeBase.folders.deleted", "文件夹已删除"),
                );
                if (activeFolderId === item.id) setActiveFolderId(null);
            } else if (type === "file") {
                await knowledgeBaseService.files.delete(item.id);
                window.__toast?.(
                    "success",
                    t("knowledgeBase.files.deleted", "文件已删除"),
                );
                if (selectedFile?.id === item.id) setSelectedFile(null);
            }
            setConfirmDeleteState({ open: false, type: null, item: null });
            await Promise.all([loadFoldersAndTags(), loadFiles()]);
        } catch {
            // The request layer already handles the user-facing error.
        }
    };

    const handleUploadFile = async ({
        file,
        folderId,
        tagNames,
        onProgress,
        signal,
    }) => {
        const created = await knowledgeBaseService.uploadSmart({
            file,
            folderId,
            tagNames,
            onProgress,
            signal,
        });
        window.__toast?.(
            "success",
            t("knowledgeBase.upload.success", "文件上传与入库成功"),
        );
        await Promise.all([loadFoldersAndTags(), loadFiles()]);
        if (created) setSelectedFile(created);
    };

    const handleToggleTag = (tagId) => {
        setSelectedTagIds((previous) =>
            previous.includes(tagId)
                ? previous.filter((id) => id !== tagId)
                : [...previous, tagId],
        );
        setPage(1);
    };

    const handleCreateTag = async (event) => {
        event.preventDefault();
        const trimmed = newTagName.trim();
        if (!trimmed) return;
        setTagSaving(true);
        try {
            await knowledgeBaseService.tags.create({ name: trimmed });
            window.__toast?.(
                "success",
                t("knowledgeBase.tags.created", "标签创建成功"),
            );
            setCreateTagModalOpen(false);
            setNewTagName("");
            await loadFoldersAndTags();
        } finally {
            setTagSaving(false);
        }
    };

    const handleRenameFile = async (fileId, displayName) => {
        await knowledgeBaseService.files.rename(fileId, displayName);
        window.__toast?.("success", "重命名成功");
        await loadFiles();
    };

    const handleReidentifyFile = async (fileId) => {
        await knowledgeBaseService.files.reidentify(fileId);
        window.__toast?.("success", "重新识别任务已完成");
        await loadFiles();
    };

    return {
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
        setSelectedTagIds,
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
    };
}
