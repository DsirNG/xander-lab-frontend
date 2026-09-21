import React, { useState } from "react";
import {
    ChevronRight,
    File,
    Folder,
    FolderOpen,
} from "lucide-react";

/**
 * 文件树节点递归组件，支持目录折叠/展开。
 *
 * 该组件只负责源码浏览的展示和选择，不了解项目请求或构建状态。
 */
export function FileTreeNodes({ nodes, depth, activePath, onOpenFile }) {
    return (
        <>
            {nodes.map((node) => {
                const isActive = node.path === activePath;

                return (
                    <FileTreeNode
                        key={node.path}
                        node={node}
                        depth={depth}
                        isActive={isActive}
                        onOpenFile={onOpenFile}
                    />
                );
            })}
        </>
    );
}

function FileTreeNode({ node, depth, isActive, onOpenFile }) {
    const isDir = node.type === "dir";
    const isFile = node.type === "file";
    const isReadable = node.readable !== false;
    const [expanded, setExpanded] = useState(true);

    const handleClick = () => {
        if (isDir) {
            setExpanded((prev) => !prev);
        } else if (isFile && isReadable) {
            onOpenFile(node.path);
        }
    };

    const Icon = isDir ? (expanded ? FolderOpen : Folder) : File;

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-body transition-colors ${
                    isActive && isFile
                        ? "bg-accent/10 font-bold text-accent"
                        : "text-ink-muted hover:bg-surface-muted"
                } ${!isFile || !isReadable ? "cursor-default" : "cursor-pointer"}`}
                style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
                {isDir && (
                    <ChevronRight
                        className={`h-3 w-3 shrink-0 text-ink-faint transition-transform duration-150 ${
                            expanded ? "rotate-90" : ""
                        }`}
                    />
                )}
                <Icon className="h-4 w-4 shrink-0 text-ink-faint" />
                <span className="truncate">{node.name}</span>
            </button>

            {isDir && expanded && node.children?.length > 0 && (
                <FileTreeNodes
                    nodes={node.children}
                    depth={depth + 1}
                    activePath=""
                    onOpenFile={onOpenFile}
                />
            )}
        </>
    );
}

export default function CompilerFileExplorer({
    nodes,
    activePath,
    isReady,
    onOpenFile,
}) {
    return (
        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-border bg-canvas lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-border px-4 py-2.5">
                <div className="text-micro font-bold uppercase tracking-widest text-ink-faint">
                    File Tree
                </div>
                <div className="text-body font-bold text-ink">文件目录</div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-2">
                {nodes.length > 0 ? (
                    <FileTreeNodes
                        nodes={nodes}
                        depth={0}
                        activePath={activePath}
                        onOpenFile={onOpenFile}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-body text-ink-faint">
                        {isReady ? "暂无文件目录" : "构建完成后显示"}
                    </div>
                )}
            </div>
        </aside>
    );
}
