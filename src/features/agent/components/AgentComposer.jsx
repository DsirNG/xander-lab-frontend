import {
    BookOpen,
    FileText,
    Globe,
    Image as ImageIcon,
    Loader2,
    Mic,
    Paperclip,
    PenLine,
    Send,
    Square,
    X,
} from "lucide-react";

const ACCEPTED_ATTACHMENT_TYPES =
    "image/png,image/jpeg,image/webp,image/gif,.pdf,.txt,.md,.json,.html,.xml,.doc,.docx,.rtf,.odt,.ppt,.pptx,.csv,.xls,.xlsx,.tsv,.java,.js,.jsx,.ts,.tsx,.py,.css";

const QUICK_ACTIONS = [
    {
        key: "generateImage",
        icon: ImageIcon,
        iconClassName: "bg-emerald-50 text-emerald-500",
    },
    {
        key: "searchWeb",
        icon: Globe,
        iconClassName: "bg-orange-50 text-orange-500",
    },
    {
        key: "generatePractice",
        icon: PenLine,
        iconClassName: "bg-blue-50 text-blue-500",
    },
    {
        key: "importKnowledge",
        icon: BookOpen,
        iconClassName: "bg-purple-50 text-purple-500",
    },
];

const AttachmentPreview = ({ attachment, onRemove }) => (
    <div className="group relative">
        {attachment.contentType.startsWith("image/") ? (
            <img
                src={attachment.url}
                alt={attachment.name}
                className="h-16 w-16 rounded-xl border border-[#e5e7f2] object-cover"
            />
        ) : (
            <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e5e7f2] px-3 text-xs text-[#242741]">
                <FileText className="h-4 w-4 text-[#8e94aa]" />
                <span className="max-w-40 truncate">{attachment.name}</span>
            </div>
        )}
        <button
            type="button"
            onClick={() => onRemove(attachment.url)}
            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#111426] text-white"
        >
            <X className="h-3 w-3" />
        </button>
    </div>
);

const AgentComposer = ({
    input,
    attachments,
    locked,
    uploadingAttachments,
    canSend,
    isActive,
    fileInputRef,
    textareaRef,
    showQuickActions = false,
    onInputChange,
    onFilesSelected,
    onRemoveAttachment,
    onSubmit,
    onCancel,
    t,
}) => (
    <>
        <div className="relative rounded-[1.75rem] border border-[#e5e7f2] bg-white p-1 shadow-[0_4px_20px_rgba(103,101,246,0.04)] transition-all focus-within:border-[#817bf2] focus-within:ring-2 focus-within:ring-[#817bf2]/20">
            {attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2 px-2 pb-2">
                    {attachments.map((attachment) => (
                        <AttachmentPreview
                            key={attachment.url}
                            attachment={attachment}
                            onRemove={onRemoveAttachment}
                        />
                    ))}
                </div>
            ) : null}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={locked || uploadingAttachments}
                    className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6] disabled:opacity-50"
                    title={t("blog.agentChat.addAttachment", "添加附件")}
                >
                    {uploadingAttachments ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Paperclip className="h-5 w-5" />
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept={ACCEPTED_ATTACHMENT_TYPES}
                    onChange={(event) => {
                        onFilesSelected(Array.from(event.target.files || []));
                        event.target.value = "";
                    }}
                />

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(event) => onInputChange(event.target.value)}
                    disabled={locked}
                    placeholder={
                        locked
                            ? t(
                                  "blog.agentChat.inputLockedPlaceholder",
                                  "执行中，请稍候",
                              )
                            : t(
                                  "workspace.agent.inputPlaceholder",
                                  "告诉 DinQor 你想做什么...",
                              )
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            if (!locked && canSend) onSubmit();
                        }
                    }}
                    className="min-h-[40px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#111426] outline-none placeholder:text-[#a0a5ba] disabled:opacity-60"
                />

                <button
                    type="button"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6]"
                >
                    <Mic className="h-5 w-5" />
                </button>

                {isActive ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111426] text-white transition-colors hover:bg-[#2e334e]"
                    >
                        <Square className="h-3.5 w-3.5 fill-current" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={locked || !canSend}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5d55fa] text-white transition-colors hover:bg-[#4d44f3] disabled:opacity-40"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>

        {showQuickActions ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                {QUICK_ACTIONS.map(({ key, icon: Icon, iconClassName }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() =>
                            onInputChange(t(`workspace.agent.actions.${key}`))
                        }
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#ececf4] bg-white px-3.5 py-2 text-xs font-semibold text-[#33364d] transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                    >
                        <span
                            className={`grid h-5 w-5 place-items-center rounded-md ${iconClassName}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span>{t(`workspace.agent.actions.${key}`)}</span>
                    </button>
                ))}
            </div>
        ) : null}
    </>
);

export default AgentComposer;
