import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  File,
  Folder,
  FolderOpen,
  Loader2,
  Play,
  RefreshCw,
  Link2,
  Lock,
  Globe2,
  X,
} from 'lucide-react';
import {
  convertPreviewUrl,
  downloadPublicProjectSource,
  fetchFileContent,
  fetchFileTree,
  fetchProject,
  getStatusColor,
  getStatusLabel,
  isTerminalStatus,
  updateProjectVisibility,
} from '../services/studioService';

/**
 * 文件树节点递归组件，支持目录折叠/展开
 */
export function FileTreeNodes({ nodes, depth, activePath, onOpenFile }) {
  return (
    <>
      {nodes.map((node) => {
        const isDir = node.type === 'dir';
        const isFile = node.type === 'file';
        const isReadable = node.readable !== false;
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

/**
 * 单个文件树节点，目录支持折叠/展开
 */
function FileTreeNode({ node, depth, isActive, onOpenFile }) {
  const isDir = node.type === 'dir';
  const isFile = node.type === 'file';
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
        className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
          isActive && isFile
            ? 'bg-primary/10 font-bold text-primary'
            : 'text-slate-600 hover:bg-slate-100'
        } ${!isFile || !isReadable ? 'cursor-default' : 'cursor-pointer'}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {isDir && (
          <ChevronRight
            className={`h-3 w-3 shrink-0 text-slate-400 transition-transform duration-150 ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        )}
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">{node.name}</span>
      </button>

      {isDir && expanded && node.children?.length > 0 && (
        <FileTreeNodes
          nodes={node.children}
          depth={depth + 1}
          activePath={isActive ? '' : ''}
          onOpenFile={onOpenFile}
        />
      )}
    </>
  );
}

export default function CompilerPage() {
  const { projectId } = useParams();
  const pollRef = useRef(null);
  const [project, setProject] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const treeNodes = useMemo(() => fileTree?.children || [], [fileTree]);
  const isReady = project?.status === 'ready';
  const previewUrl = project ? convertPreviewUrl(project.previewUrl, project.id) : '';
  const visibility = project?.visibility || 'private';

  const handleVisibilityChange = async (nextVisibility) => {
    if (!project || nextVisibility === visibility) return;
    setIsUpdatingVisibility(true);
    try {
      const data = await updateProjectVisibility(project.id, nextVisibility);
      setProject(data.project);
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleShare = async () => {
    if (!project) return;
    const shareUrl = `${window.location.origin}/studio/source/${project.id}`;
    await navigator.clipboard.writeText(shareUrl);
    window.__toast?.success?.('开源访问链接已复制');
  };

  /** 项目构建完成后自动打开预览弹窗 */
  useEffect(() => {
    if (isReady) {
      setIsPreviewOpen(true);
    }
  }, [isReady]);

  const loadProject = useCallback(async () => {
    if (!projectId) return null;

    try {
      const data = await fetchProject(projectId);
      setProject(data.project);
      return data.project;
    } catch {
      return null;
    }
  }, [projectId]);

  const loadFileTree = useCallback(async () => {
    if (!projectId) return;

    try {
      const data = await fetchFileTree(projectId);
      setFileTree(data.tree);
    } catch {
      setFileTree(null);
    }
  }, [projectId]);

  const handleOpenFile = useCallback(
    async (filePath) => {
      if (!projectId) return;

      setActiveFilePath(filePath);
      setIsLoadingFile(true);

      try {
        const data = await fetchFileContent(projectId, filePath);
        setFileContent(data.content);
      } catch {
        setFileContent('文件加载失败');
      } finally {
        setIsLoadingFile(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    loadProject();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadProject]);

  useEffect(() => {
    if (!projectId || !project || isTerminalStatus(project.status)) return;

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const nextProject = await loadProject();
      if (nextProject && isTerminalStatus(nextProject.status)) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 1500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadProject, project, projectId]);

  useEffect(() => {
    if (isReady) {
      loadFileTree();
    }
  }, [isReady, loadFileTree]);

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* 顶部栏 */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回 Studio
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Code2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-950">
                {project?.name || '编译器'}
              </h1>
            </div>
            <div className="relative hidden sm:block">
              {visibility === 'private' ? <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /> : visibility === 'open' ? <Code2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /> : <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />}
              <select
                value={visibility}
                disabled={isUpdatingVisibility}
                onChange={(event) => handleVisibilityChange(event.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-bold text-slate-700 outline-none transition-colors hover:border-slate-300 disabled:opacity-50"
                aria-label="项目可见性"
              >
                <option value="private">私有</option>
                <option value="public">公开访问</option>
                <option value="open">开源（可查看并下载源码）</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {visibility === 'open' && (
              <>
                <button type="button" onClick={handleShare} className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-primary sm:inline-flex">
                  <Link2 className="h-3.5 w-3.5" /> 分享
                </button>
                <button type="button" onClick={() => downloadPublicProjectSource(project.id, project.name)} className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-primary sm:inline-flex">
                  <Download className="h-3.5 w-3.5" /> 下载源码
                </button>
              </>
            )}
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(project?.status)}`}>
              {getStatusLabel(project?.status)}
            </span>
            <button
              type="button"
              onClick={loadProject}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 - flex:1 占满剩余空间 */}
      <div className="flex min-h-0 flex-1 gap-0">
        {/* 文件树 - 固定宽度，独立滚动 */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              File Tree
            </p>
            <h2 className="text-sm font-bold text-slate-900">文件目录</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-2">
            {treeNodes.length > 0 ? (
              <FileTreeNodes
                nodes={treeNodes}
                depth={0}
                activePath={activeFilePath}
                onOpenFile={handleOpenFile}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                {isReady ? '暂无文件目录' : '构建完成后显示'}
              </div>
            )}
          </div>
        </aside>

        {/* 代码查看区 - flex:1 占满剩余空间，独立滚动 */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="shrink-0 flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <File className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-sm font-bold text-slate-800">
                {activeFilePath || '选择一个文件'}
              </span>
            </div>
            {isLoadingFile && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          <pre className="min-h-0 flex-1 overflow-auto bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
            <code className="whitespace-pre font-mono">
              {fileContent || '从左侧文件树选择一个文件后，这里会展示文件内容。'}
            </code>
          </pre>
        </section>
      </div>

      {/* 构建运行按钮 */}
      <button
        type="button"
        disabled={!isReady}
        onClick={() => setIsPreviewOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-2xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isReady ? <Play className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
        {isReady ? '预览' : '等待构建'}
      </button>

      {/* 预览弹窗 */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-[1400px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Preview
                </p>
                <h2 className="truncate text-sm font-black text-slate-900">
                  {project?.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  新窗口
                </a>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  aria-label="关闭预览"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative flex-1">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="项目预览"
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium text-slate-500">正在加载预览...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
