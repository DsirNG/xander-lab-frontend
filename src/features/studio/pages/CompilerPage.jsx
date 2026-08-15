import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  File,
  Folder,
  FolderOpen,
  Loader2,
  Play,
  RefreshCw,
  Link2,
  X,
} from 'lucide-react';
import CustomSelect from '@components/common/CustomSelect';
import useClickOutside from '@hooks/useClickOutside';
import StudioTopBar from '../components/StudioTopBar';
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

const VISIBILITY_OPTIONS = [
  { value: 'private', label: '私有' },
  { value: 'public', label: '公开（可查看并下载源码）' },
];

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
        className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-body transition-colors ${
          isActive && isFile
            ? 'bg-accent/10 font-bold text-accent'
            : 'text-ink-muted hover:bg-surface-muted'
        } ${!isFile || !isReadable ? 'cursor-default' : 'cursor-pointer'}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {isDir && (
          <ChevronRight
            className={`h-3 w-3 shrink-0 text-ink-faint transition-transform duration-150 ${
              expanded ? 'rotate-90' : ''
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
  const shareMenuRef = useRef(null);
  const [project, setProject] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [isDownloadingSource, setIsDownloadingSource] = useState(false);

  const treeNodes = useMemo(() => fileTree?.children || [], [fileTree]);
  const isReady = project?.status === 'ready';
  const previewUrl = project ? convertPreviewUrl(project.previewUrl, project.id) : '';
  const visibility = project?.visibility || 'private';
  const shareUrl = project ? `${window.location.origin}/workspace/studio/source/${project.id}` : '';

  const closeShareMenu = useCallback(() => setIsShareOpen(false), []);
  useClickOutside(shareMenuRef, closeShareMenu, isShareOpen);

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

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setIsShareCopied(true);
      window.__toast?.success?.('分享链接已复制');
      window.setTimeout(() => setIsShareCopied(false), 1800);
    } catch {
      window.__toast?.error?.('复制链接失败，请手动复制');
    }
  };

  const handleDownloadSource = async () => {
    if (!project || isDownloadingSource) return;
    setIsDownloadingSource(true);
    try {
      await downloadPublicProjectSource(project.id, project.name);
      window.__toast?.success?.('源码 ZIP 已开始下载');
    } finally {
      setIsDownloadingSource(false);
    }
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
    <div className="flex h-dvh flex-col bg-surface">
      {/* 顶部栏 */}
      <StudioTopBar
        title={
          <>
            <div className="truncate text-base font-bold text-ink">
              {project?.name || '编译器'}
            </div>
            <div className={`hidden w-52 sm:block ${isUpdatingVisibility ? 'pointer-events-none opacity-50' : ''}`}>
              <CustomSelect
                options={VISIBILITY_OPTIONS}
                value={visibility}
                onChange={handleVisibilityChange}
                placeholder="项目权限"
              />
            </div>
          </>
        }
      >

          <div className="flex items-center gap-2">
            {visibility === 'public' && (
              <>
                <div ref={shareMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsShareOpen((open) => !open)}
                    aria-expanded={isShareOpen}
                    aria-haspopup="dialog"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-caption font-bold text-ink-muted transition-colors hover:text-accent"
                  >
                    <Link2 className="h-3.5 w-3.5" /> 分享
                  </button>
                  {isShareOpen ? (
                    <div role="dialog" aria-label="分享项目" className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-border bg-canvas p-3 shadow-xl">
                      <div className="mb-2 text-caption font-bold text-ink-secondary">公开源码链接</div>
                      <div className="flex items-center gap-2">
                        <input value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-2 text-caption text-ink-muted outline-none" aria-label="公开源码链接" />
                        <button type="button" onClick={handleCopyShareLink} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-accent px-2.5 py-2 text-caption font-bold text-white hover:bg-accent-700">
                          {isShareCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {isShareCopied ? '已复制' : '复制'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <button type="button" disabled={isDownloadingSource} onClick={handleDownloadSource} className="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-caption font-bold text-ink-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50">
                  {isDownloadingSource ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} 下载 ZIP
                </button>
              </>
            )}
            <span className={`rounded-full border px-3 py-1 text-caption font-bold ${getStatusColor(project?.status)}`}>
              {getStatusLabel(project?.status)}
            </span>
            <button
              type="button"
              onClick={loadProject}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-caption font-bold text-ink-muted transition-colors hover:text-accent"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              刷新
            </button>
          </div>
      </StudioTopBar>

      {/* 主内容区 - flex:1 占满剩余空间 */}
      <div className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row">
        {/* 文件树 - 固定宽度，独立滚动 */}
        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-border bg-canvas lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-border px-4 py-2.5">
            <div className="text-micro font-bold uppercase tracking-widest text-ink-faint">
              File Tree
            </div>
            <div className="text-body font-bold text-ink">文件目录</div>
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
              <div className="flex h-full items-center justify-center px-4 text-center text-body text-ink-faint">
                {isReady ? '暂无文件目录' : '构建完成后显示'}
              </div>
            )}
          </div>
        </aside>

        {/* 代码查看区 - flex:1 占满剩余空间，独立滚动 */}
        <section className="flex min-w-0 flex-1 flex-col bg-canvas">
          <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <File className="h-4 w-4 shrink-0 text-ink-faint" />
              <span className="truncate text-body font-bold text-ink-secondary">
                {activeFilePath || '选择一个文件'}
              </span>
            </div>
            {isLoadingFile && (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            )}
          </div>

          <pre className="min-h-0 flex-1 overflow-auto bg-ink p-5 text-body leading-6 text-surface">
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
        className="fixed bottom-6 right-6 z-30 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-body font-black text-white shadow-2xl shadow-accent/30 transition-all hover:-translate-y-0.5 hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isReady ? <Play className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
        {isReady ? '预览' : '等待构建'}
      </button>

      {/* 预览弹窗 */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 p-2 backdrop-blur-sm sm:p-4">
          <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col overflow-hidden rounded-lg bg-canvas shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <div className="text-caption font-bold uppercase tracking-widest text-ink-faint">
                  Preview
                </div>
                <div className="truncate text-body font-black text-ink">
                  {project?.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-caption font-bold text-ink-muted transition-colors hover:text-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  新窗口
                </a>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface hover:text-ink"
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
                  className="absolute inset-0 h-full w-full border-0 bg-canvas"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface">
                  <Loader2 className="h-10 w-10 animate-spin text-accent" />
                  <div className="text-body font-medium text-ink-muted">正在加载预览...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
