import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
    ChevronDown,
    ChevronRight,
    CirclePlus,
    Folder,
    FolderOpen,
    FolderPlus,
    MoreVertical,
    Move,
    Pencil,
    Plus,
    Tag,
    Trash2,
    Layers,
    Search,
} from "lucide-react";
import Skeleton from "@components/common/Skeleton";
import RowActionsMenu from "@components/common/RowActionsMenu";

const TAG_DOT_COLORS = [
    "bg-emerald-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
];

/**
 * 递归组织树形结构
 */
function buildFolderTree(flatFolders) {
    const map = new Map();
    const roots = [];

    flatFolders.forEach((f) => {
        map.set(f.id, { ...f, children: [] });
    });

    flatFolders.forEach((f) => {
        const node = map.get(f.id);
        if (f.parentId && map.has(f.parentId)) {
            map.get(f.parentId).children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

const FolderNode = ({
    node,
    activeFolderId,
    expandedMap,
    onToggleExpand,
    onSelect,
    onCreateChild,
    onRename,
    onMove,
    onDelete,
}) => {
    const { t } = useTranslation();
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedMap[node.id] !== false; // 默认展开
    const isSelected = activeFolderId === node.id;

    const folderActions = [
        {
            key: "addChild",
            label: t("knowledgeBase.folders.addChild", "新建子目录"),
            icon: FolderPlus,
            onClick: () => onCreateChild(node.id),
        },
        {
            key: "rename",
            label: t("common.rename", "重命名"),
            icon: Pencil,
            onClick: () => onRename(node),
        },
        {
            key: "move",
            label: t("knowledgeBase.folders.moveAction", "移动位置"),
            icon: Move,
            onClick: () => onMove(node),
        },
        {
            key: "delete",
            label: t("common.delete", "删除"),
            icon: Trash2,
            danger: true,
            onClick: () => onDelete(node),
        },
    ];

    return (
        <div>
            <div
                className={`group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 transition ${
                    isSelected
                        ? "bg-[#f2f1fd] text-[#6765f6] font-semibold dark:bg-blue-950/30 dark:text-blue-400"
                        : "text-[#555b7b] hover:bg-[#f7f6fc] dark:text-slate-300 dark:hover:bg-white/5"
                }`}
                style={{ paddingLeft: `${Math.max(0, (node.depth || 1) - 1) * 14 + 10}px` }}
            >
                <div
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                    onClick={() => onSelect(node.id)}
                >
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(node.id);
                            }}
                            className="p-0.5 text-[#8e94ad] hover:text-[#555b7b]"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                            )}
                        </button>
                    ) : (
                        <span className="w-3.5" />
                    )}

                    {isExpanded ? (
                        <FolderOpen className="h-4 w-4 shrink-0 text-amber-500 fill-amber-400/30" />
                    ) : (
                        <Folder className="h-4 w-4 shrink-0 text-amber-500 fill-amber-400/40" />
                    )}

                    <span className="truncate text-caption font-medium">{node.name}</span>
                    <span className="text-micro text-[#8e94ad] font-normal shrink-0">
                        ({node.fileCount ?? 0})
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-micro text-[#8e94ad] shadow-2xs group-hover:hidden dark:bg-white/10">
                        {node.fileCount ?? 0}
                    </span>

                    {/* 操作菜单浮层（使用项目 RowActionsMenu 组件） */}
                    <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <RowActionsMenu actions={folderActions} align="right" size="sm" />
                    </div>
                </div>
            </div>

            {hasChildren && isExpanded ? (
                <div className="space-y-0.5">
                    {node.children.map((child) => (
                        <FolderNode
                            key={child.id}
                            node={child}
                            activeFolderId={activeFolderId}
                            expandedMap={expandedMap}
                            onToggleExpand={onToggleExpand}
                            onSelect={onSelect}
                            onCreateChild={onCreateChild}
                            onRename={onRename}
                            onMove={onMove}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

FolderNode.propTypes = {
    node: PropTypes.object.isRequired,
    activeFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    expandedMap: PropTypes.object.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onCreateChild: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

const KnowledgeFolderTree = ({
    folders = [],
    activeFolderId = null,
    tags = [],
    selectedTagIds = [],
    loading = false,
    onToggleTag,
    onCreateTag,
    onSelectFolder,
    onCreateFolder,
    onRenameFolder,
    onMoveFolder,
    onDeleteFolder,
}) => {
    const { t } = useTranslation();
    const [expandedMap, setExpandedMap] = useState({});
    const [showAllTags, setShowAllTags] = useState(false);

    const [folderSearch, setFolderSearch] = useState("");
    const [showFolderSearch, setShowFolderSearch] = useState(false);

    const filteredFolders = useMemo(() => {
        if (!folderSearch.trim()) return folders;
        return folders.filter((f) =>
            f.name.toLowerCase().includes(folderSearch.trim().toLowerCase()),
        );
    }, [folders, folderSearch]);

    const tree = useMemo(() => buildFolderTree(filteredFolders), [filteredFolders]);

    const totalFiles = useMemo(
        () => folders.reduce((sum, f) => sum + (f.fileCount || 0), 0),
        [folders],
    );

    const toggleExpand = (id) => {
        setExpandedMap((prev) => ({
            ...prev,
            [id]: prev[id] === false ? true : false,
        }));
    };

    const visibleTags = showAllTags ? tags : tags.slice(0, 7);

    return (
        <div className="flex h-full min-h-0 flex-col justify-between space-y-4">
            {/* 上半部分：快捷视图 + 目录分类树 */}
            <div className="flex min-h-0 flex-1 flex-col">
                {/* 1. 快捷视图：全部文档 (全量文档看板入口) */}
                <div className="mb-2">
                    <button
                        type="button"
                        onClick={() => onSelectFolder(null)}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                            activeFolderId === null
                                ? "bg-[#f2f1fd] text-[#6765f6] font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                                : "text-[#555b7b] hover:bg-[#f7f6fc] dark:text-slate-300 dark:hover:bg-white/[0.03]"
                        }`}
                    >
                        <div className="flex items-center gap-2.5 truncate">
                            <Layers className="h-4 w-4 shrink-0 text-[#6765f6] dark:text-blue-400" />
                            <span className="text-caption font-medium truncate">
                                全部文档
                            </span>
                        </div>
                        <span
                            className={`rounded-full px-2 py-0.5 text-micro font-medium shrink-0 ${
                                activeFolderId === null
                                    ? "bg-[#e2e0fb] text-[#6765f6] dark:bg-blue-900/40 dark:text-blue-300"
                                    : "bg-[#f3f3f8] text-[#8e94ad] dark:bg-white/10 dark:text-slate-400"
                            }`}
                        >
                            {totalFiles}
                        </span>
                    </button>
                </div>

                {/* 2. 文件夹目录分类 (结构化文件系统) */}
                <div className="mb-2 flex items-center justify-between border-t border-[#eef0f6] px-1 pt-3 dark:border-white/5">
                    <span className="text-caption font-semibold text-[#111426] dark:text-white">
                        {t("knowledgeBase.folders.title", "目录分类")}
                    </span>
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => setShowFolderSearch((v) => !v)}
                            className="rounded-lg p-1 text-[#8e94ad] transition hover:bg-[#f7f6fc] hover:text-[#111426] dark:hover:bg-white/5"
                            title="快速检索文件夹"
                        >
                            <Search className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onCreateFolder(0)}
                            className="rounded-lg p-1 text-[#8e94ad] transition hover:bg-[#f7f6fc] hover:text-[#6765f6] dark:hover:bg-white/5"
                            title={t("knowledgeBase.folders.newRoot", "新建文件夹")}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {showFolderSearch ? (
                    <div className="mb-2 px-1">
                        <input
                            type="text"
                            placeholder="筛选文件夹..."
                            value={folderSearch}
                            onChange={(e) => setFolderSearch(e.target.value)}
                            className="w-full rounded-lg border border-[#e9eaf4] bg-white px-2 py-1 text-micro text-[#555b7b] placeholder:text-[#8e94ad] focus:border-[#6765f6] focus:outline-none focus:ring-2 focus:ring-[#6765f6]/15 transition dark:bg-white/5 dark:border-white/10"
                        />
                    </div>
                ) : null}

                <div className="flex-1 min-h-0 space-y-0.5 overflow-y-auto pr-1">
                    {/* 纯文件夹树状列表 */}
                    {loading ? (
                        <div className="space-y-1 py-1">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="flex items-center gap-2 rounded-xl px-2.5 py-2">
                                    <Skeleton className="h-4 w-4 shrink-0 rounded" />
                                    <Skeleton className="h-4 flex-1 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        tree.map((node) => (
                            <FolderNode
                                key={node.id}
                                node={node}
                                activeFolderId={activeFolderId}
                                expandedMap={expandedMap}
                                onToggleExpand={toggleExpand}
                                onSelect={onSelectFolder}
                                onCreateChild={onCreateFolder}
                                onRename={onRenameFolder}
                                onMove={onMoveFolder}
                                onDelete={onDeleteFolder}
                            />
                        ))
                    )}

                    {!loading && folders.length === 0 ? (
                        <div className="py-6 text-center text-caption text-[#8e94ad]">
                            {t("knowledgeBase.folders.empty", "暂无文件夹")}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* 中间部分：标签列表 */}
            <div className="shrink-0 border-t border-[#eef0f6] pt-3 dark:border-white/5">
                <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-caption font-semibold text-[#111426] dark:text-white">
                        {t("knowledgeBase.tags.title", "标签")}
                    </span>
                    {onCreateTag ? (
                        <button
                            type="button"
                            onClick={onCreateTag}
                            className="rounded-lg p-1 text-[#8e94ad] transition hover:bg-[#f7f6fc] hover:text-[#6765f6] dark:hover:bg-white/5"
                            title="新建标签"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                    {loading ? (
                        <div className="space-y-1 py-1">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-xl px-2.5 py-1.5"
                                >
                                    <Skeleton className="h-3.5 w-16" />
                                    <Skeleton className="h-3.5 w-6 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        visibleTags.map((tag, idx) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            const dotColor = TAG_DOT_COLORS[idx % TAG_DOT_COLORS.length];

                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => onToggleTag?.(tag.id)}
                                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-caption transition ${
                                        isSelected
                                            ? "bg-[#f2f1fd] text-[#6765f6] font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                                            : "text-[#555b7b] hover:bg-[#f7f6fc] dark:text-slate-300 dark:hover:bg-white/[0.03]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                                        <span className="truncate text-caption">{tag.name}</span>
                                    </div>
                                    <span className="text-micro text-[#8e94ad] shrink-0">
                                        ({tag.usageCount ?? 0})
                                    </span>
                                </button>
                            );
                        })
                    )}

                    {!loading && tags.length > 7 ? (
                        <button
                            type="button"
                            onClick={() => setShowAllTags((v) => !v)}
                            className="flex items-center gap-1 px-2.5 py-1 text-micro text-[#8e94ad] hover:text-[#6765f6]"
                        >
                            <span>{showAllTags ? "收起标签" : "展开更多"}</span>
                            <ChevronDown
                                className={`h-3 w-3 transition-transform ${
                                    showAllTags ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    ) : null}

                    {!loading && tags.length === 0 ? (
                        <div className="px-2 py-2 text-micro text-[#8e94ad]">
                            暂无标签
                        </div>
                    ) : null}
                </div>
            </div>

            {/* 底部部分：存储容量 */}
            <div className="shrink-0 border-t border-[#eef0f6] pt-3 dark:border-white/5">
                <div className="text-caption font-semibold text-[#111426] dark:text-white">存储容量</div>
                <div className="mt-1 text-micro text-[#8e94ad]">
                    12.6 GB / 50 GB
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#eef0f6] dark:bg-white/10 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[#7771ed] transition-all duration-500"
                        style={{ width: "25.2%" }}
                    />
                </div>
            </div>
        </div>
    );
};

KnowledgeFolderTree.propTypes = {
    folders: PropTypes.array,
    activeFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tags: PropTypes.array,
    selectedTagIds: PropTypes.array,
    onToggleTag: PropTypes.func,
    onCreateTag: PropTypes.func,
    onSelectFolder: PropTypes.func.isRequired,
    onCreateFolder: PropTypes.func.isRequired,
    onRenameFolder: PropTypes.func.isRequired,
    onMoveFolder: PropTypes.func.isRequired,
    onDeleteFolder: PropTypes.func.isRequired,
};

export default KnowledgeFolderTree;
