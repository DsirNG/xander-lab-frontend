import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  File,
  Folder,
  FolderOpen,
  Loader2,
  Play,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  convertPreviewUrl,
  fetchFileContent,
  fetchFileTree,
  fetchProject,
  getStatusColor,
  getStatusLabel,
  isTerminalStatus,
} from '../services/studioService';
import { useToast } from '@/hooks/useToast';

/**
 * 文件树节点递归组件，支持目录折叠/展开
 */
function FileTreeNodes({ nodes, depth, activePath, onOpenFile }) {
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
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const treeNodes = useMemo(() => fileTree?.children || [], [fileTree]);
  const isReady = project?.status === 'ready';
  const previewUrl = project ? convertPreviewUrl(project.previewUrl, project.id) : '';

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
    } catch (err) {
      toast.error(err.message || '加载项目失败');
      return null;
    }
  }, [projectId]);

  const loadFileTree = useCallback(async () => {
    if (!projectId) return;

    try {
      const data = await fetchFileTree(projectId);
      setFileTree(data.tree);
    } catch (err) {
      setFileTree(null);
      toast.error(err.message || '加载文件树失败');
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
      } catch (err) {
        setFileContent('文件加载失败');
        toast.error(err.message || '文件加载失败');
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
    <div className="min-h-screen bg-slate-50">
      {/* 顶部栏 */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            <Link
              to="/studio"
              className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回 Studio
            </Link>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Code2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950">
                  {project?.name || '编译器'}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  左侧文件树，右侧源码内容，运行后弹窗预览。
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(project?.status)}`}>
              {getStatusLabel(project?.status)}
            </span>
            <button
              type="button"
              onClick={loadProject}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <main className="mx-auto grid  max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        {/* 文件树 */}
        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              File Tree
            </p>
            <h2 className="mt-1 text-sm font-black text-slate-900">文件目录</h2>
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-auto p-2">
            {treeNodes.length > 0 ? (
              <FileTreeNodes
                nodes={treeNodes}
                depth={0}
                activePath={activeFilePath}
                onOpenFile={handleOpenFile}
              />
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                {isReady ? '暂无文件目录' : '构建完成后显示文件目录'}
              </div>
            )}
          </div>
        </aside>

        {/* 代码查看区 */}
        <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <File className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-sm font-black text-slate-800">
                {activeFilePath || '选择一个文件'}
              </span>
            </div>
            {isLoadingFile && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          <pre className="m-0 h-full overflow-auto bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
            <code className="whitespace-pre font-mono">
              {fileContent || '从左侧文件树选择一个文件后，这里会展示文件内容。'}
            </code>
          </pre>
        </section>
      </main>

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
