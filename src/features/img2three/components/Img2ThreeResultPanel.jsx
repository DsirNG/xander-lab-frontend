import React from "react";
import PropTypes from "prop-types";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";

const ThreeViewer = React.lazy(() => import("./ThreeViewer"));

const Img2ThreeResultPanel = ({
    task,
    filePreviewUrl,
    viewerError,
    viewerReady,
    exportingGlb,
    onDownloadSpec,
    onDownloadFactory,
    onDownloadGlb,
    onViewerReady,
    onViewerError,
}) => {
    const { t } = useTranslation();

    return (
        <section className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-title font-bold text-ink">
                        {task.title || t("img2three.preview")}
                    </div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {t("img2three.ready")}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onDownloadSpec}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {t("img2three.downloadSpec")}
                    </button>
                    <button
                        type="button"
                        onClick={onDownloadFactory}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {t("img2three.downloadFactory")}
                    </button>
                    <button
                        type="button"
                        onClick={onDownloadGlb}
                        disabled={exportingGlb || !viewerReady}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-fg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {exportingGlb ? (
                            <Loader2
                                className="h-4 w-4 animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Download
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        )}
                        {exportingGlb
                            ? t("img2three.exportingGlb")
                            : t("img2three.downloadGlb")}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-3">
                    {viewerError ? (
                        <div
                            role="alert"
                            className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
                        >
                            {viewerError}
                        </div>
                    ) : null}
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <React.Suspense
                            fallback={
                                <div className="grid h-[min(70vh,560px)] place-items-center">
                                    <LoadingSpinner
                                        size="md"
                                        text={t("img2three.preview")}
                                    />
                                </div>
                            }
                        >
                            <ThreeViewer
                                sceneSpec={task.sceneSpec}
                                className="h-[min(70vh,560px)] w-full"
                                onReady={onViewerReady}
                                onError={onViewerError}
                            />
                        </React.Suspense>
                    </div>
                </div>
                <aside className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="text-sm font-semibold text-ink">
                        {t("img2three.reference")}
                    </div>
                    <img
                        src={task.referenceMediaUrl || filePreviewUrl}
                        alt={t("img2three.reference")}
                        className="mt-3 w-full rounded-xl border border-border object-cover"
                    />
                </aside>
            </div>
        </section>
    );
};

Img2ThreeResultPanel.propTypes = {
    task: PropTypes.shape({
        title: PropTypes.string,
        sceneSpec: PropTypes.object.isRequired,
        referenceMediaUrl: PropTypes.string,
    }).isRequired,
    filePreviewUrl: PropTypes.string,
    viewerError: PropTypes.string,
    viewerReady: PropTypes.bool.isRequired,
    exportingGlb: PropTypes.bool.isRequired,
    onDownloadSpec: PropTypes.func.isRequired,
    onDownloadFactory: PropTypes.func.isRequired,
    onDownloadGlb: PropTypes.func.isRequired,
    onViewerReady: PropTypes.func.isRequired,
    onViewerError: PropTypes.func.isRequired,
};

export default Img2ThreeResultPanel;
