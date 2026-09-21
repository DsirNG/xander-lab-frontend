import React, { useState } from "react";
import PropTypes from "prop-types";
import { ChevronRight, Layers } from "lucide-react";
import Pagination from "@shared/ui/navigation/Pagination";
import KnowledgeFileFilterBar from "./KnowledgeFileFilterBar";
import KnowledgeFileTable from "./KnowledgeFileTable";

const KnowledgeFileList = ({
    activeFolderId = null,
    breadcrumbs = [],
    subfolders = [],
    files = [],
    loading = false,
    selectedFileId = null,
    onSelectFile,
    total = 0,
    page = 1,
    size = 20,
    keyword = "",
    extensionFilter = "",
    onExtensionFilterChange,
    statusFilter = "",
    onStatusFilterChange,
    sortFilter = "recent",
    onSortFilterChange,
    onSelectFolder,
    onRenameFolder,
    onMoveFolder,
    onDeleteFolder,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onPreviewFile,
    onRenameFile,
    onMoveFile,
    onDeleteFile,
    onReidentifyFile,
}) => {
    const [selectedItemKeys, setSelectedItemKeys] = useState(new Set());

    const allKeys = [
        ...subfolders.map((f) => `folder-${f.id}`),
        ...files.map((f) => `file-${f.id}`),
    ];
    const isAllSelected =
        allKeys.length > 0 && allKeys.every((k) => selectedItemKeys.has(k));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItemKeys(new Set());
        } else {
            setSelectedItemKeys(new Set(allKeys));
        }
    };

    const toggleItem = (key) => {
        setSelectedItemKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col justify-between space-y-3">
            {/* 1. 顶部检索与多维筛选工具栏（模块化组件） */}
            <KnowledgeFileFilterBar
                keyword={keyword}
                onSearchChange={onSearchChange}
                extensionFilter={extensionFilter}
                onExtensionFilterChange={onExtensionFilterChange}
                statusFilter={statusFilter}
                onStatusFilterChange={onStatusFilterChange}
                sortFilter={sortFilter}
                onSortFilterChange={onSortFilterChange}
            />

            {/* 2. 当前目录层级路径（面包屑导航） / 全部文档看板标题 */}
            <div className="shrink-0 flex items-center justify-between gap-2 text-caption text-[#8e94ad]">
                {activeFolderId === null ? (
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#6765f6] shrink-0" />
                        <span className="font-semibold text-[#111426]">
                            全部文档工作台
                        </span>
                        <span className="text-micro text-[#8e94ad] font-normal">
                            （跨目录汇总 · 共 {total} 篇文档）
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 truncate">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={crumb.id ?? "root"}>
                                    {idx > 0 ? (
                                        <ChevronRight className="h-3 w-3 text-[#8e94ad] shrink-0" />
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => onSelectFolder(crumb.id)}
                                        className={`truncate transition ${
                                            isLast
                                                ? "font-semibold text-[#111426] cursor-default"
                                                : "text-[#555b7b] hover:text-[#6765f6] hover:underline"
                                        }`}
                                    >
                                        {crumb.name}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>

            <KnowledgeFileTable
                activeFolderId={activeFolderId}
                subfolders={subfolders}
                files={files}
                loading={loading}
                selectedFileId={selectedFileId}
                selectedItemKeys={selectedItemKeys}
                isAllSelected={isAllSelected}
                onToggleSelectAll={toggleSelectAll}
                onToggleItem={toggleItem}
                onSelectFile={onSelectFile}
                onSelectFolder={onSelectFolder}
                onRenameFolder={onRenameFolder}
                onMoveFolder={onMoveFolder}
                onDeleteFolder={onDeleteFolder}
                onPreviewFile={onPreviewFile}
                onRenameFile={onRenameFile}
                onMoveFile={onMoveFile}
                onDeleteFile={onDeleteFile}
                onReidentifyFile={onReidentifyFile}
            />

            {/* 4. 分页栏（统一 Pagination 组件） */}
            <div className="shrink-0 border-t border-[#eef0f6] pt-1 dark:border-white/5">
                <Pagination
                    page={page}
                    pageSize={size}
                    total={total}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    hideWhenEmpty={false}
                    className="p-0"
                />
            </div>
        </div>
    );
};

KnowledgeFileList.propTypes = {
    folders: PropTypes.array,
    activeFolderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    breadcrumbs: PropTypes.array,
    subfolders: PropTypes.array,
    files: PropTypes.array,
    loading: PropTypes.bool,
    selectedFileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSelectFile: PropTypes.func.isRequired,
    total: PropTypes.number,
    page: PropTypes.number,
    size: PropTypes.number,
    keyword: PropTypes.string,
    extensionFilter: PropTypes.string,
    onExtensionFilterChange: PropTypes.func,
    statusFilter: PropTypes.string,
    onStatusFilterChange: PropTypes.func,
    sortFilter: PropTypes.string,
    onSortFilterChange: PropTypes.func,
    onSelectFolder: PropTypes.func.isRequired,
    onRenameFolder: PropTypes.func,
    onMoveFolder: PropTypes.func,
    onDeleteFolder: PropTypes.func,
    onPageChange: PropTypes.func.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onPreviewFile: PropTypes.func.isRequired,
    onRenameFile: PropTypes.func,
    onMoveFile: PropTypes.func,
    onDeleteFile: PropTypes.func,
    onReidentifyFile: PropTypes.func,
};

export default KnowledgeFileList;
