import React from "react";
import { Clock3 } from "lucide-react";
import KnowledgeAttemptResultPanel from "./KnowledgeAttemptResultPanel";
import KnowledgeAudioTestPanel from "./KnowledgeAudioTestPanel";
import KnowledgeActions from "./KnowledgeActions";
import AgentQuizPanel from "./AgentQuizPanel";

export default function KnowledgeMirrorDetailPanel({
    activeMaterial,
    t,
    typeLabel,
    levelLabel,
    onEdit,
    onArchive,
    onDelete,
    recording,
    uploading,
    permissionOpen,
    permissionBlocked,
    onStartRecording,
    onStopRecording,
    onClosePermission,
    onRequestMicrophone,
    quiz,
    onStartQuiz,
    attempt,
    attemptPollError,
    onRetryAttempt,
}) {
    if (!activeMaterial) {
        return (
            <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-body text-ink-muted">
                {t("knowledge.archivedEmptyHint")}
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
                <div>
                    <div className="text-heading text-ink">
                        {activeMaterial.title}
                    </div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {typeLabel(activeMaterial.knowledgeType)} ·{" "}
                        {levelLabel(activeMaterial.masteryLevel)} ·{" "}
                        {t("knowledge.reviewCount", {
                            count: activeMaterial.reviewCount ?? 0,
                        })}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-accent-soft px-4 py-2 text-center">
                        <div className="text-micro text-accent">
                            {t("knowledge.mastery")}
                        </div>
                        <div className="text-heading text-accent">
                            {activeMaterial.masteryScore ?? 0}%
                        </div>
                    </div>
                    <KnowledgeActions
                        material={activeMaterial}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onDelete={onDelete}
                    />
                </div>
            </div>

            {activeMaterial.archivedAt ? (
                <div className="mt-4 rounded-2xl bg-surface-muted p-3 text-caption text-ink-muted">
                    {t("knowledge.archivedNotice")}
                </div>
            ) : null}

            <div className="mt-5 rounded-2xl bg-surface-muted p-4">
                <div className="text-caption font-semibold text-ink-secondary">
                    {t("knowledge.original")}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-body text-ink">
                    {recording
                        ? t("knowledge.originalHidden")
                        : activeMaterial.content}
                </div>
            </div>

            {activeMaterial.testMode === "AUDIO_RECITATION" ? (
                <KnowledgeAudioTestPanel
                    recording={recording}
                    uploading={uploading}
                    permissionOpen={permissionOpen}
                    permissionBlocked={permissionBlocked}
                    onStart={onStartRecording}
                    onStop={onStopRecording}
                    onClosePermission={onClosePermission}
                    onRequestMicrophone={onRequestMicrophone}
                />
            ) : (
                <AgentQuizPanel quiz={quiz} onStart={onStartQuiz} />
            )}

            <KnowledgeAttemptResultPanel
                attempt={attempt}
                pollError={attemptPollError}
                onRetry={onRetryAttempt}
            />

            {activeMaterial.nextReviewAt ? (
                <div className="mt-4 flex items-center gap-2 text-caption text-ink-muted">
                    <Clock3 className="h-4 w-4" />
                    {t("knowledge.nextReview", {
                        time: new Date(
                            activeMaterial.nextReviewAt,
                        ).toLocaleString(),
                    })}
                </div>
            ) : null}
        </div>
    );
}
