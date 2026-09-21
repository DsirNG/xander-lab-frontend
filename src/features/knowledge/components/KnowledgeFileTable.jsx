import React from "react";
import { useTranslation } from "react-i18next";
import {
    Eye,
    FileText,
    Folder,
    Move,
    Pencil,
    RefreshCw,
    Trash2,
} from "lucide-react";
import { TableSkeleton } from "@shared/ui/feedback/Skeleton";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import { formatBytes } from "../utils/fileHash";
import { formatKnowledgeDateTime } from "../utils/knowledgePreview";

const EXTENSION_BADGES = {
    pdf: { label: "PDF", bg: "bg-[#ef4444] text-white" },
    md: { label: "MD", bg: "bg-[#3b82f6] text-white" },
    markdown: { label: "MD", bg: "bg-[#3b82f6] text-white" },
    docx: { label: "DOCX", bg: "bg-[#4f46e5] text-white" },
    doc: { label: "DOC", bg: "bg-[#4f46e5] text-white" },
    txt: { label: "TXT", bg: "bg-[#64748b] text-white" },
    json: { label: "JSON", bg: "bg-[#10b981] text-white" },
    html: { label: "HTML", bg: "bg-[#0d9488] text-white" },
};

function renderStatusBadge(status) {
    if (status === "READY") {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-micro font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                已解析
            </span>
        );
    }
    if (status === "CHAPTER_ON_DEMAND" || status === "PENDING") {
        return (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-micro font-medium text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                解析中
            </span>
        );
    }
    if (status === "FAILED") {
        return (
            <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-micro font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                失败
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-micro font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            未解析
        </span>
    );
}

export default function KnowledgeFileTable({
    activeFolderId,
    subfolders,
    files,
    loading,
    selectedFileId,
    selectedItemKeys,
    isAllSelected,
    onToggleSelectAll,
    onToggleItem,
    onSelectFile,
    onSelectFolder,
    onRenameFolder,
    onMoveFolder,
    onDeleteFolder,
    onPreviewFile,
    onRenameFile,
    onMoveFile,
    onDeleteFile,
    onReidentifyFile,
}) {
    const { t } = useTranslation();
    const isEmpty = !loading && subfolders.length === 0 && files.length === 0;

    return (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            {loading ? (
                <TableSkeleton rows={6} />
            ) : (
                <table className="w-full text-left text-caption">
                    <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-xs dark:bg-surface">
                        <tr className="border-b border-[#eef0f6] text-micro font-medium text-[#8e94ad] dark:border-white/5 dark:text-slate-500">
                            <th className="w-9 pl-3 pb-3">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={onToggleSelectAll}
                                    className="h-3.5 w-3.5 rounded border-[#d1d5db] text-[#7771ed] focus:ring-[#7771ed] dark:border-white/20"
                                />
                            </th>
                            <th className="pb-3 px-2 font-medium text-[#8e94ad]">
                                文件名
                            </th>
                            <th className="pb-3 px-3 font-medium text-[#8e94ad]">
                                类型
                            </th>
                            <th className="pb-3 px-3 font-medium text-[#8e94ad]">
                                大小
                            </th>
                            <th className="pb-3 px-3 font-medium text-[#8e94ad]">
                                更新时间
                            </th>
                            <th className="pb-3 px-3 font-medium text-[#8e94ad]">
                                状态
                            </th>
                            <th className="pb-3 pr-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef0f6] dark:divide-white/[0.03]">
                        {subfolders.map((folder) => {
                            const key = `folder-${folder.id}`;
                            const isChecked = selectedItemKeys.has(key);

                            return (
                                <tr
                                    key={key}
                                    onClick={() => onSelectFolder(folder.id)}
                                    className="group cursor-pointer transition-colors hover:bg-[#f7f6fc] dark:hover:bg-white/[0.02]"
                                >
                                    <td className="py-3 pl-3">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            onChange={() => onToggleItem(key)}
                                            className="h-3.5 w-3.5 rounded border-[#d1d5db] text-[#7771ed] focus:ring-[#7771ed] dark:border-white/20"
                                        />
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-6 w-7 shrink-0 items-center justify-center text-amber-500">
                                                <Folder className="h-5 w-5 fill-amber-400 text-amber-500" />
                                            </div>
                                            <span className="truncate text-caption font-medium text-[#111426] group-hover:text-[#6765f6] dark:text-slate-200">
                                                {folder.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-[#8e94ad] text-caption">
                                        文件夹
                                    </td>
                                    <td className="py-3 px-3 text-[#8e94ad] text-caption">
                                        -
                                    </td>
                                    <td className="py-3 px-3 text-[#8e94ad] text-caption">
                                        {formatKnowledgeDateTime(
                                            folder.updatedAt ||
                                                folder.createdAt,
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-[#8e94ad] text-caption">
                                        -
                                    </td>
                                    <td
                                        className="py-3 pr-3 text-right"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <div className="flex items-center justify-end">
                                            <RowActionsMenu
                                                size="sm"
                                                align="right"
                                                actions={[
                                                    {
                                                        key: "rename",
                                                        label: t(
                                                            "common.rename",
                                                            "重命名",
                                                        ),
                                                        icon: Pencil,
                                                        onClick: () =>
                                                            onRenameFolder(
                                                                folder,
                                                            ),
                                                    },
                                                    {
                                                        key: "move",
                                                        label: t(
                                                            "knowledgeBase.folders.moveAction",
                                                            "移动位置",
                                                        ),
                                                        icon: Move,
                                                        onClick: () =>
                                                            onMoveFolder(
                                                                folder,
                                                            ),
                                                    },
                                                    {
                                                        key: "delete",
                                                        label: t(
                                                            "common.delete",
                                                            "删除",
                                                        ),
                                                        icon: Trash2,
                                                        danger: true,
                                                        onClick: () =>
                                                            onDeleteFolder(
                                                                folder,
                                                            ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {files.map((file) => {
                            const ext = file.extension?.toLowerCase() || "file";
                            const badge = EXTENSION_BADGES[ext] || {
                                label: ext.toUpperCase().slice(0, 4),
                                bg: "bg-slate-500 text-white",
                            };
                            const isSelected = selectedFileId === file.id;
                            const key = `file-${file.id}`;
                            const isChecked = selectedItemKeys.has(key);

                            return (
                                <tr
                                    key={key}
                                    onClick={() => onSelectFile(file)}
                                    className={`group cursor-pointer transition-colors ${
                                        isSelected
                                            ? "bg-[#f2f1fd]/60 dark:bg-blue-950/20"
                                            : "hover:bg-[#f7f6fc] dark:hover:bg-white/[0.02]"
                                    }`}
                                >
                                    <td className="py-3 pl-3">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            onChange={() => onToggleItem(key)}
                                            className="h-3.5 w-3.5 rounded border-[#d1d5db] text-[#7771ed] focus:ring-[#7771ed] dark:border-white/20"
                                        />
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={`flex h-6 w-8 shrink-0 items-center justify-center rounded-md font-bold text-[10px] tracking-tight shadow-2xs ${badge.bg}`}
                                            >
                                                {badge.label}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div
                                                    className="truncate text-caption font-medium text-[#111426] group-hover:text-[#6765f6] dark:text-slate-200"
                                                    title={file.displayName}
                                                >
                                                    {file.displayName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 uppercase text-[#8e94ad] text-caption">
                                        {ext}
                                    </td>
                                    <td className="py-3 px-3 text-[#8e94ad] text-caption">
                                        {formatBytes(
                                            file.fileSize ||
                                                file.sizeBytes ||
                                                0,
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-[#8e94ad] text-caption">
                                        {formatKnowledgeDateTime(
                                            file.updatedAt || file.createdAt,
                                        )}
                                    </td>
                                    <td className="py-3 px-3">
                                        {renderStatusBadge(
                                            file.knowledgeState || file.status,
                                        )}
                                    </td>
                                    <td
                                        className="py-3 pr-3 text-right"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <div className="flex items-center justify-end">
                                            <RowActionsMenu
                                                size="sm"
                                                align="right"
                                                actions={[
                                                    {
                                                        key: "preview",
                                                        label: "全屏预览",
                                                        icon: Eye,
                                                        onClick: () =>
                                                            onPreviewFile(
                                                                file.id,
                                                            ),
                                                    },
                                                    {
                                                        key: "rename",
                                                        label: t(
                                                            "common.rename",
                                                            "重命名",
                                                        ),
                                                        icon: Pencil,
                                                        onClick: () =>
                                                            onRenameFile(file),
                                                    },
                                                    {
                                                        key: "move",
                                                        label: "移动",
                                                        icon: Move,
                                                        onClick: () =>
                                                            onMoveFile(file),
                                                    },
                                                    {
                                                        key: "reidentify",
                                                        label: "重新识别",
                                                        icon: RefreshCw,
                                                        onClick: () =>
                                                            onReidentifyFile(
                                                                file.id,
                                                            ),
                                                    },
                                                    {
                                                        key: "delete",
                                                        label: t(
                                                            "common.delete",
                                                            "删除",
                                                        ),
                                                        icon: Trash2,
                                                        danger: true,
                                                        onClick: () =>
                                                            onDeleteFile(file),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {isEmpty ? (
                <div className="py-16 text-center text-caption text-[#8e94ad]">
                    <FileText className="mx-auto h-10 w-10 text-[#8e94ad]/60" />
                    <div className="mt-3 text-body font-medium text-[#111426] dark:text-white">
                        {activeFolderId === null
                            ? "暂无文档"
                            : "当前文件夹为空"}
                    </div>
                    <div className="mt-1 text-caption text-[#8e94ad]">
                        {activeFolderId === null
                            ? "可以点击上方上传新文档并归类至指定目录"
                            : "可以点击上方新建子文件夹或上传新文档"}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
