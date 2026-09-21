import { Globe, Image as ImageIcon, PenLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import AgentChatInputBar from "./AgentChatInputBar";

const AgentChatEmptyState = ({
    input,
    setInput,
    attachments,
    uploading,
    isActive,
    creating,
    onFilesSelected,
    onRemoveAttachment,
    onSubmit,
    onStop,
    deepThinking,
    onToggleDeepThinking,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex h-full flex-col items-center justify-center px-4 pt-10">
            <div className="mb-8 text-display text-ink">
                {t("blog.agentChat.startHeadline")}
            </div>

            <AgentChatInputBar
                t={t}
                input={input}
                setInput={setInput}
                attachments={attachments}
                uploading={uploading}
                isActive={isActive}
                creating={creating}
                hasConversation={false}
                onFilesSelected={onFilesSelected}
                onRemoveAttachment={onRemoveAttachment}
                onSubmit={onSubmit}
                onStop={onStop}
                deepThinking={deepThinking}
                onToggleDeepThinking={onToggleDeepThinking}
            />

            <div className="mx-auto mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={() =>
                        setInput(t("blog.agentChat.quickGenerateImage"))
                    }
                    className="flex items-center gap-2 rounded-xl border border-border bg-[#ffffff] px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                >
                    <ImageIcon className="h-4 w-4 text-emerald-500" />
                    {t("blog.agentChat.quickGenerateImage")}
                </button>
                <button
                    type="button"
                    onClick={() =>
                        setInput(t("blog.agentChat.quickWritePrompt"))
                    }
                    className="flex items-center gap-2 rounded-xl border border-border bg-[#ffffff] px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                >
                    <PenLine className="h-4 w-4 text-blue-500" />
                    {t("blog.agentChat.quickWrite")}
                </button>
                <button
                    type="button"
                    onClick={() => setInput(t("blog.agentChat.quickSearch"))}
                    className="flex items-center gap-2 rounded-xl border border-border bg-[#ffffff] px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                >
                    <Globe className="h-4 w-4 text-orange-500" />
                    {t("blog.agentChat.quickSearch")}
                </button>
            </div>
        </div>
    );
};

export default AgentChatEmptyState;
