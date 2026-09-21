import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useParams } from "react-router-dom";
import {
    Check,
    Copy,
    Download,
    File,
    Loader2,
    Play,
    RefreshCw,
    Link2,
} from "lucide-react";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import Button from "@shared/ui/primitives/Button";
import useClickOutside from "@shared/hooks/useClickOutside";
import CompilerFileExplorer from "../components/CompilerFileExplorer";
import CompilerPreviewModal from "../components/CompilerPreviewModal";
import StudioTopBar from "../components/StudioTopBar";
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
} from "../services/studioService";

const VISIBILITY_OPTIONS = [
    { value: "private", label: "私有" },
    { value: "public", label: "公开（可查看并下载源码）" },
];

export default function CompilerPage() {
    const { projectId } = useParams();
    const pollRef = useRef(null);
    const shareMenuRef = useRef(null);
    const [project, setProject] = useState(null);
    const [fileTree, setFileTree] = useState(null);
    const [activeFilePath, setActiveFilePath] = useState("");
    const [fileContent, setFileContent] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [isDownloadingSource, setIsDownloadingSource] = useState(false);

    const treeNodes = useMemo(() => fileTree?.children || [], [fileTree]);
    const isReady = project?.status === "ready";
    const previewUrl = project
        ? convertPreviewUrl(project.previewUrl, project.id)
        : "";
    const visibility = project?.visibility || "private";
    const shareUrl = project
        ? `${window.location.origin}/workspace/studio/source/${project.id}`
        : "";

    const closeShareMenu = useCallback(() => setIsShareOpen(false), []);
    useClickOutside(shareMenuRef, closeShareMenu, isShareOpen);

    const handleVisibilityChange = async (nextVisibility) => {
        if (!project || nextVisibility === visibility) return;
        setIsUpdatingVisibility(true);
        try {
            const data = await updateProjectVisibility(
                project.id,
                nextVisibility,
            );
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
                const input = document.createElement("textarea");
                input.value = shareUrl;
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                document.body.removeChild(input);
            }
            setIsShareCopied(true);
            window.__toast?.success?.("分享链接已复制");
            window.setTimeout(() => setIsShareCopied(false), 1800);
        } catch {
            window.__toast?.error?.("复制链接失败，请手动复制");
        }
    };

    const handleDownloadSource = async () => {
        if (!project || isDownloadingSource) return;
        setIsDownloadingSource(true);
        try {
            await downloadPublicProjectSource(project.id, project.name);
            window.__toast?.success?.("源码 ZIP 已开始下载");
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
                setFileContent("文件加载失败");
            } finally {
                setIsLoadingFile(false);
            }
        },
        [projectId],
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
                            {project?.name || "编译器"}
                        </div>
                        <div
                            className={`hidden w-52 sm:block ${isUpdatingVisibility ? "pointer-events-none opacity-50" : ""}`}
                        >
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
                    {visibility === "public" && (
                        <>
                            <div ref={shareMenuRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsShareOpen((open) => !open)
                                    }
                                    aria-expanded={isShareOpen}
                                    aria-haspopup="dialog"
                                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-caption font-bold text-ink-muted transition-colors hover:text-accent"
                                >
                                    <Link2 className="h-3.5 w-3.5" /> 分享
                                </button>
                                {isShareOpen ? (
                                    <div
                                        role="dialog"
                                        aria-label="分享项目"
                                        className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-border bg-canvas p-3 shadow-xl"
                                    >
                                        <div className="mb-2 text-caption font-bold text-ink-secondary">
                                            公开源码链接
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={shareUrl}
                                                readOnly
                                                onFocus={(event) =>
                                                    event.currentTarget.select()
                                                }
                                                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-2 text-caption text-ink-muted outline-none"
                                                aria-label="公开源码链接"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleCopyShareLink}
                                                variant="primary"
                                                size="sm"
                                                className="shrink-0 font-bold"
                                            >
                                                {isShareCopied ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                                {isShareCopied
                                                    ? "已复制"
                                                    : "复制"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <Button
                                type="button"
                                disabled={isDownloadingSource}
                                loading={isDownloadingSource}
                                onClick={handleDownloadSource}
                                variant="outline"
                                size="sm"
                                icon={Download}
                                className="font-bold"
                            >
                                下载 ZIP
                            </Button>
                        </>
                    )}
                    <span
                        className={`rounded-full border px-3 py-1 text-caption font-bold ${getStatusColor(project?.status)}`}
                    >
                        {getStatusLabel(project?.status)}
                    </span>
                    <Button
                        type="button"
                        onClick={loadProject}
                        variant="outline"
                        size="sm"
                        icon={RefreshCw}
                        className="font-bold"
                    >
                        刷新
                    </Button>
                </div>
            </StudioTopBar>

            {/* 主内容区 - flex:1 占满剩余空间 */}
            <div className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row">
                <CompilerFileExplorer
                    nodes={treeNodes}
                    activePath={activeFilePath}
                    isReady={isReady}
                    onOpenFile={handleOpenFile}
                />

                {/* 代码查看区 - flex:1 占满剩余空间，独立滚动 */}
                <section className="flex min-w-0 flex-1 flex-col bg-canvas">
                    <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                            <File className="h-4 w-4 shrink-0 text-ink-faint" />
                            <span className="truncate text-body font-bold text-ink-secondary">
                                {activeFilePath || "选择一个文件"}
                            </span>
                        </div>
                        {isLoadingFile && (
                            <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        )}
                    </div>

                    <pre className="min-h-0 flex-1 overflow-auto bg-ink p-5 text-body leading-6 text-surface">
                        <code className="whitespace-pre font-mono">
                            {fileContent ||
                                "从左侧文件树选择一个文件后，这里会展示文件内容。"}
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
                {isReady ? (
                    <Play className="h-4 w-4" />
                ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isReady ? "预览" : "等待构建"}
            </button>

            <CompilerPreviewModal
                open={isPreviewOpen}
                projectName={project?.name}
                previewUrl={previewUrl}
                onClose={() => setIsPreviewOpen(false)}
            />
        </div>
    );
}
