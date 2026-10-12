import { useTranslation } from "react-i18next";
import { FileText, PenLine, BookOpen } from "lucide-react";
import AgentComposer from "./AgentComposer";

const WorkspaceAgentWelcome = ({
    displayName,
    input,
    attachments,
    locked,
    uploadingAttachments,
    canSend,
    isActive,
    fileInputRef,
    textareaRef,
    onInputChange,
    onFilesSelected,
    onRemoveAttachment,
    onSubmit,
    onCancel,
    deepThinking,
    onToggleDeepThinking,
    plugins,
    onPluginPreview,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-12 pt-4 text-center">
            <div className="mb-5 text-micro font-medium uppercase tracking-[0.2em] text-ink-muted">
                {t("workspace.agent.livingWorkspace")}
            </div>
            <div className="text-display font-medium tracking-tight text-ink sm:text-[32px]">
                {t("workspace.agent.startWork", { name: displayName })}
            </div>
            <div className="mt-3 max-w-lg text-body leading-6 text-ink-muted">
                {t("workspace.agent.workHint")}
            </div>

            <div className="mt-8 w-full max-w-2xl px-2">
                <AgentComposer
                    input={input}
                    attachments={attachments}
                    locked={locked}
                    uploadingAttachments={uploadingAttachments}
                    canSend={canSend}
                    isActive={isActive}
                    fileInputRef={fileInputRef}
                    textareaRef={textareaRef}
                    alwaysExpanded
                    showQuickActions
                    plugins={plugins}
                    onPluginPreview={onPluginPreview}
                    quickActions={[
                        {
                            key: "writeArticle",
                            icon: PenLine,
                            iconClassName: "text-ink-secondary",
                        },
                        {
                            key: "analyzeDocument",
                            icon: FileText,
                            iconClassName: "text-ink-secondary",
                        },
                        {
                            key: "organizeKnowledge",
                            icon: BookOpen,
                            iconClassName: "text-ink-secondary",
                        },
                    ]}
                    onInputChange={onInputChange}
                    onFilesSelected={onFilesSelected}
                    onRemoveAttachment={onRemoveAttachment}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    deepThinking={deepThinking}
                    onToggleDeepThinking={onToggleDeepThinking}
                    t={t}
                />
            </div>
        </div>
    );
};

export default WorkspaceAgentWelcome;
