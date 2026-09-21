import { useTranslation } from "react-i18next";
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
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-12 pt-4 text-center">
            <div className="relative mb-4 flex items-center justify-center">
                <img
                    src="/assets/workspace/home/hero-orb.svg"
                    alt=""
                    className="h-28 w-28 object-contain transition-transform duration-700"
                />
            </div>

            <h1 className="text-2xl font-bold text-[#111426] sm:text-3xl">
                {t("workspace.home.welcome", "欢迎回来，")}{" "}
                <span className="text-[#6765f6]">{displayName}</span>
            </h1>

            <p className="mt-2 text-sm text-[#8b91a9]">
                {t(
                    "workspace.agent.subtitle",
                    "你的 AI 智能体伙伴，随时为你提供专业、可靠的帮助",
                )}
            </p>

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
                    showQuickActions
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
