import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Code2,
  ExternalLink,
  File,
  Folder,
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

function FileTreeNodes({ nodes, depth, activePath, onOpenFile }) {
  return (
    <>
      {nodes.map((node) => {
        const isDir = node.type === 'dir';
        const isFile = node.type === 'file';
        const isReadable = node.readable !== false;
        const isActive = node.path === activePath;
        const Icon = isDir ? Folder : File;

        return (
          <React.Fragment key={node.path}>
            <button
              type="button"
              disabled={!isFile || !isReadable}
              onClick={() => {
                if (isFile && isReadable) onOpenFile(node.path);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-slate-600 hover:bg-slate-100'
              } ${!isFile || !isReadable ? 'cursor-default hover:bg-transparent' : ''}`}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{node.name}</span>
            </button>

            {isDir && node.children?.length > 0 && (
              <FileTreeNodes
                nodes={node.children}
                depth={depth + 1}
                activePath={activePath}
                onOpenFile={onOpenFile}
              />
            )}
          </React.Fragment>
        );
      })}
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

  const treeNodes = useMemo(() => fileTree?.children || [], [fileTree]);
  const isReady = project?.status === 'ready';
  const previewUrl = project ? convertPreviewUrl(project.previewUrl, project.id) : '';

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
    <div className="min-h-screen bg-slate-50">
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

      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
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

          <pre className="m-0 min-h-[620px] max-h-[calc(100vh-220px)] overflow-auto bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
            <code className="whitespace-pre font-mono">
              {fileContent || '从左侧文件树选择一个文件后，这里会展示文件内容。'}
            </code>
          </pre>
        </section>
      </main>

      <button
        type="button"
        disabled={!isReady}
        onClick={() => setIsPreviewOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-2xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isReady ? <Play className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
        {isReady ? '构建运行' : '等待构建'}
      </button>

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
            <iframe
              src={previewUrl}
              title="项目预览"
              className="h-full w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
