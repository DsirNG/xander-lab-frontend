import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { AgentPreviewPanel } from "@features/blog";

const AgentArtifactPanel = ({
    loading,
    error,
    taskData,
    selectedVersionId,
    isPublishing,
    isSavingDraft,
    onPublish,
    onCreateDraft,
    onViewPublished,
    onSelectVersion,
    onClose,
}) => {
    const { t } = useTranslation();
    const task = taskData?.task;
    const statusText =
        task?.status === "failed"
            ? task.errorMessage || t("blog.agent.failed")
            : task?.status === "ready"
              ? t("blog.agent.ready")
              : t("blog.agent.running");

    if (loading) {
        return (
            <div className="flex h-full min-h-48 items-center justify-center bg-canvas">
                <LoadingSpinner
                    fullScreen={false}
                    text={t("blog.agent.restoring")}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
                <AlertCircle className="h-8 w-8 text-danger" />
                <div className="text-sm font-semibold text-danger">{error}</div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-ink-secondary"
                >
                    {t("common.close")}
                </button>
            </div>
        );
    }

    return (
        <AgentPreviewPanel
            taskData={taskData}
            selectedVersionId={selectedVersionId}
            statusText={statusText}
            isPublishing={isPublishing}
            isSavingDraft={isSavingDraft}
            onPublish={onPublish}
            onCreateDraft={onCreateDraft}
            onViewPublished={onViewPublished}
            onSelectVersion={onSelectVersion}
            onClose={onClose}
        />
    );
};

export default AgentArtifactPanel;
