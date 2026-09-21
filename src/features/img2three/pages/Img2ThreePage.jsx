import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, History } from "lucide-react";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { img2threeService } from "../services/img2threeService";
import { getLocalUserInfo } from "@features/auth";
import { useToast } from "@shared/hooks/useToast";
import Img2ThreeHistoryPanel from "../components/Img2ThreeHistoryPanel";
import Img2ThreeResultPanel from "../components/Img2ThreeResultPanel";
import Img2ThreeUploadPanel from "../components/Img2ThreeUploadPanel";
import useImg2ThreeTask from "../hooks/useImg2ThreeTask";

const ACCEPTED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

const downloadText = (
    text,
    filename,
    mimeType = "text/plain;charset=utf-8",
) => {
    downloadBlob(new Blob([text], { type: mimeType }), filename);
};

const Img2ThreePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { taskId } = useParams();
    const toast = useToast();

    const [filePreviewUrl, setFilePreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyTasks, setHistoryTasks] = useState([]);
    const [exportingGlb, setExportingGlb] = useState(false);
    const [viewerReadyTaskId, setViewerReadyTaskId] = useState(null);
    const [viewerError, setViewerError] = useState("");

    const {
        task,
        error,
        stageText,
        uploading,
        running,
        recovering,
        initialLoading,
        startTask,
        resetTask,
        clearError,
    } = useImg2ThreeTask({ taskId, t, navigate, toast });

    const viewerApiRef = useRef(null);

    const handleViewerReady = useCallback(
        (api) => {
            viewerApiRef.current = api;
            setViewerReadyTaskId(String(taskId || task?.id || ""));
            setViewerError("");
        },
        [task?.id, taskId],
    );

    const handleViewerError = useCallback(
        (viewerFailure) => {
            viewerApiRef.current = null;
            setViewerReadyTaskId(null);
            const message =
                typeof viewerFailure === "string"
                    ? viewerFailure
                    : viewerFailure?.message;
            setViewerError(message || t("img2three.previewFailed"));
        },
        [t],
    );

    useEffect(() => {
        if (!getLocalUserInfo()) {
            navigate("/login", {
                replace: true,
                state: {
                    from: taskId
                        ? `/workspace/img2three/${taskId}`
                        : "/workspace/img2three",
                },
            });
        }
    }, [navigate, taskId]);

    useEffect(
        () => () => {
            if (filePreviewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        },
        [filePreviewUrl],
    );

    const validateAndSetFile = (file) => {
        if (!file || !ACCEPTED_IMAGE_TYPES.has(file.type)) {
            toast.warning(t("img2three.invalidImage"));
            return false;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            toast.warning(t("img2three.fileTooLarge"));
            return false;
        }
        setSelectedFile(file);
        setFilePreviewUrl((current) => {
            if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
            return URL.createObjectURL(file);
        });
        clearError();
        return true;
    };

    const handleGenerate = async () => {
        if (!selectedFile) {
            toast.warning(t("img2three.chooseImage"));
            return;
        }
        await startTask(selectedFile);
    };

    const handleDownloadSpec = () => {
        if (!task?.sceneSpec) return;
        downloadText(
            JSON.stringify(task.sceneSpec, null, 2),
            "spec.json",
            "application/json;charset=utf-8",
        );
    };

    const handleDownloadFactory = () => {
        if (!task?.factoryCode) return;
        downloadText(
            task.factoryCode,
            "createModel.ts",
            "text/typescript;charset=utf-8",
        );
    };

    const handleDownloadGlb = async () => {
        if (exportingGlb) return;
        setExportingGlb(true);
        try {
            const blob = await viewerApiRef.current?.exportGlb?.();
            if (!blob) throw new Error(t("img2three.failed"));
            downloadBlob(blob, `${task?.title || "model"}.glb`);
        } catch (err) {
            toast.error(err?.message || t("img2three.failed"));
        } finally {
            setExportingGlb(false);
        }
    };

    const handleNewTask = () => {
        setSelectedFile(null);
        setFilePreviewUrl("");
        resetTask();
        viewerApiRef.current = null;
        setViewerReadyTaskId(null);
        setViewerError("");
        setExportingGlb(false);
        navigate("/workspace/img2three", { replace: true });
    };

    const handleToggleHistory = async () => {
        const nextVisible = !historyVisible;
        setHistoryVisible(nextVisible);
        if (!nextVisible) return;
        setHistoryLoading(true);
        try {
            setHistoryTasks(
                await img2threeService.listTasks({ _silent: true }),
            );
        } catch (err) {
            toast.error(err?.message || t("img2three.historyLoadFailed"));
        } finally {
            setHistoryLoading(false);
        }
    };

    if (initialLoading) {
        return <LoadingSpinner fullScreen text={t("img2three.restoring")} />;
    }

    const isReady = task?.status === "ready" && task?.sceneSpec;
    const isBusy = uploading || running || recovering;
    const viewerTaskId = String(taskId || task?.id || "");
    const viewerReady =
        Boolean(viewerTaskId) &&
        viewerReadyTaskId === viewerTaskId &&
        !viewerError;

    return (
        <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-5xl flex-col overflow-y-auto overscroll-contain px-4 py-6 px-ultra-tight sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-caption font-semibold uppercase tracking-wide text-accent">
                        {t("nav.img2three")}
                    </div>
                    <div className="mt-1 text-title font-bold text-ink">
                        {t("img2three.title")}
                    </div>
                    <div className="mt-2 max-w-2xl text-body text-ink-secondary">
                        {t("img2three.subtitle")}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleToggleHistory}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
                    >
                        <History className="h-4 w-4" aria-hidden="true" />
                        {t("img2three.history")}
                    </button>
                    {taskId ? (
                        <button
                            type="button"
                            onClick={handleNewTask}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {t("img2three.newTask")}
                        </button>
                    ) : null}
                </div>
            </div>

            {historyVisible ? (
                <Img2ThreeHistoryPanel
                    loading={historyLoading}
                    tasks={historyTasks}
                    onSelectTask={(id) =>
                        navigate(`/workspace/img2three/${id}`)
                    }
                />
            ) : null}

            {!taskId && !isReady ? (
                <Img2ThreeUploadPanel
                    filePreviewUrl={filePreviewUrl}
                    dragActive={dragActive}
                    selectedFile={selectedFile}
                    isBusy={isBusy}
                    onDragActiveChange={setDragActive}
                    onFileSelect={validateAndSetFile}
                    onGenerate={handleGenerate}
                />
            ) : null}

            {(isBusy ||
                task?.status === "running" ||
                task?.status === "created") &&
            !isReady ? (
                <section className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <LoadingSpinner
                        size="md"
                        text={stageText || t("img2three.generating")}
                    />
                    {task?.referenceMediaUrl || filePreviewUrl ? (
                        <img
                            src={task?.referenceMediaUrl || filePreviewUrl}
                            alt={t("img2three.reference")}
                            className="mx-auto mt-6 max-h-56 rounded-xl border border-border object-contain"
                        />
                    ) : null}
                </section>
            ) : null}

            {error && !isReady ? (
                <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                    {error}
                </div>
            ) : null}

            {isReady ? (
                <Img2ThreeResultPanel
                    task={task}
                    filePreviewUrl={filePreviewUrl}
                    viewerError={viewerError}
                    viewerReady={viewerReady}
                    exportingGlb={exportingGlb}
                    onDownloadSpec={handleDownloadSpec}
                    onDownloadFactory={handleDownloadFactory}
                    onDownloadGlb={handleDownloadGlb}
                    onViewerReady={handleViewerReady}
                    onViewerError={handleViewerError}
                />
            ) : null}

            <footer className="mt-10 border-t border-border pt-6 text-center text-caption text-ink-muted">
                <a
                    href="https://github.com/img2threejs/img2threejs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent hover:underline"
                >
                    {t("img2three.attribution")}
                </a>
            </footer>
        </div>
    );
};

export default Img2ThreePage;
