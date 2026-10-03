import { useEffect, useMemo, useRef, useState } from "react";
import {
    AtSign,
    Blocks,
    BookOpen,
    Brain,
    FileText,
    Globe,
    Image as ImageIcon,
    Loader2,
    Mic,
    PenLine,
    Plus,
    Send,
    Square,
    Target,
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
    deepThinking = false,
    onInputChange,
    onFilesSelected,
    onRemoveAttachment,
    onSubmit,
    onCancel,
    onToggleDeepThinking,
    plugins = [],
    onPluginPreview,
    t,
}) => {
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
    const [recentPluginIds, setRecentPluginIds] = useState(() => {
        try {
            return JSON.parse(
                window.localStorage.getItem("agent.recentPlugins") || "[]",
            );
        } catch {
            return [];
        }
    });
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutside = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                setAddMenuOpen(false);
                setMentionMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const orderedPlugins = useMemo(() => {
        const rank = new Map(recentPluginIds.map((id, index) => [id, index]));
        return [...plugins].sort(
            (a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999),
        );
    }, [plugins, recentPluginIds]);

    const rememberPlugin = (plugin) => {
        const next = [
            plugin.id,
            ...recentPluginIds.filter((id) => id !== plugin.id),
        ].slice(0, 6);
        setRecentPluginIds(next);
        try {
            window.localStorage.setItem(
                "agent.recentPlugins",
                JSON.stringify(next),
            );
        } catch {
            /* local preference is optional */
        }
        const baseInput = input.endsWith("@") ? input.slice(0, -1) : input;
        onInputChange(
            `${baseInput}${baseInput && !baseInput.endsWith(" ") ? " " : ""}@${plugin.key} `,
        );
        setAddMenuOpen(false);
        setMentionMenuOpen(false);
    };

    const previewPlugin = (plugin) => {
        if (onPluginPreview) {
            onPluginPreview(plugin);
            setAddMenuOpen(false);
            setMentionMenuOpen(false);
            return;
        }
        rememberPlugin(plugin);
    };

    const pluginIcon = (plugin) =>
        plugin.type === "mcp" ? (
            <Target className="h-4 w-4" aria-hidden="true" />
        ) : (
            <Blocks className="h-4 w-4" aria-hidden="true" />
        );

    return (
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

                <div ref={menuRef} className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setAddMenuOpen((open) => !open);
                            setMentionMenuOpen(false);
                        }}
                        disabled={locked || uploadingAttachments}
                        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6] disabled:opacity-50"
                        title={t("blog.agentChat.addAttachment", "添加")}
                    >
                        {uploadingAttachments ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Plus className="h-5 w-5" />
                        )}
                    </button>

                    {addMenuOpen ? (
                        <div className="absolute bottom-12 left-0 z-30 w-72 overflow-hidden rounded-xl border border-[#e5e7f2] bg-white p-1.5 text-left shadow-[0_12px_32px_rgba(17,20,38,0.12)]">
                            <div className="px-2 py-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-[#8e94aa]">
                                {t("workspace.agent.addSection", "添加")}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setAddMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-[#242741] hover:bg-[#f5f4fb]"
                            >
                                <span className="grid h-6 w-6 place-items-center rounded-md bg-[#f2f1fd] text-[#6765f6]">
                                    +
                                </span>
                                <span>
                                    {t(
                                        "workspace.agent.addFiles",
                                        "文件和文件夹",
                                    )}
                                </span>
                            </button>
                            <button
                                type="button"
                                disabled
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-[#a0a5ba]"
                            >
                                <Target
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>
                                    {t("workspace.agent.addGoal", "目标")}
                                </span>
                                <span className="text-micro">
                                    {t(
                                        "workspace.agent.comingSoon",
                                        "即将推出",
                                    )}
                                </span>
                            </button>
                            <button
                                type="button"
                                disabled
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-[#a0a5ba]"
                            >
                                <PenLine
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>
                                    {t("workspace.agent.planMode", "计划模式")}
                                </span>
                                <span className="text-micro">
                                    {t(
                                        "workspace.agent.comingSoon",
                                        "即将推出",
                                    )}
                                </span>
                            </button>
                            <button
                                type="button"
                                disabled
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-[#a0a5ba]"
                            >
                                <PenLine
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>{t("workspace.agent.draw", "绘图")}</span>
                                <span className="text-micro">
                                    {t(
                                        "workspace.agent.comingSoon",
                                        "即将推出",
                                    )}
                                </span>
                            </button>
                            <div className="mt-1 border-t border-[#f0f0f5] pt-1">
                                <div className="px-2 py-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-[#8e94aa]">
                                    {t("workspace.menu.plugins", "插件")}
                                </div>
                                {orderedPlugins.length ? (
                                    orderedPlugins.map((plugin) => (
                                        <button
                                            key={plugin.id}
                                            type="button"
                                            onClick={() =>
                                                previewPlugin(plugin)
                                            }
                                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-[#242741] hover:bg-[#f5f4fb]"
                                        >
                                            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#f2f1fd] text-[#6765f6]">
                                                {pluginIcon(plugin)}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate">
                                                <span className="block truncate">
                                                    {plugin.name}
                                                </span>
                                                {plugin.description ? (
                                                    <span className="block truncate text-micro font-normal text-[#a0a5ba]">
                                                        {plugin.description}
                                                    </span>
                                                ) : null}
                                            </span>
                                            {recentPluginIds.includes(
                                                plugin.id,
                                            ) ? (
                                                <span className="text-micro text-[#8e94aa]">
                                                    {t(
                                                        "workspace.agent.recent",
                                                        "最近",
                                                    )}
                                                </span>
                                            ) : null}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-2 py-2 text-micro text-[#8e94aa]">
                                        {t(
                                            "workspace.pluginsPage.empty",
                                            "暂无可用插件",
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => {
                            setMentionMenuOpen((open) => !open);
                            setAddMenuOpen(false);
                        }}
                        disabled={locked}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8e94aa] transition-colors hover:bg-[#f5f4fb] hover:text-[#6765f6] disabled:opacity-50"
                        title={t(
                            "workspace.agent.mentionPlugin",
                            "选择 Skill 或 MCP",
                        )}
                        aria-label={t(
                            "workspace.agent.mentionPlugin",
                            "选择 Skill 或 MCP",
                        )}
                    >
                        <AtSign className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {mentionMenuOpen ? (
                        <div className="absolute bottom-12 left-10 z-30 w-72 overflow-hidden rounded-xl border border-[#e5e7f2] bg-white p-1.5 text-left shadow-[0_12px_32px_rgba(17,20,38,0.12)]">
                            <div className="px-2 py-1.5 text-micro text-[#8e94aa]">
                                {t(
                                    "workspace.agent.mentionHint",
                                    "选择后会插入到当前消息",
                                )}
                            </div>
                            {orderedPlugins.length ? (
                                orderedPlugins.map((plugin) => (
                                    <button
                                        key={plugin.id}
                                        type="button"
                                        onClick={() => previewPlugin(plugin)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-[#242741] hover:bg-[#f5f4fb]"
                                    >
                                        <span className="text-[#6765f6]">
                                            {pluginIcon(plugin)}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {plugin.name}
                                        </span>
                                        <span className="text-micro text-[#a0a5ba]">
                                            @{plugin.key}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-2 py-2 text-micro text-[#8e94aa]">
                                    {t(
                                        "workspace.pluginsPage.empty",
                                        "暂无可用插件",
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept={ACCEPTED_ATTACHMENT_TYPES}
                        onChange={(event) => {
                            onFilesSelected(
                                Array.from(event.target.files || []),
                            );
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
                            if (
                                event.nativeEvent?.isComposing ||
                                event.isComposing ||
                                event.keyCode === 229
                            )
                                return;
                            if (event.key === "@") setMentionMenuOpen(true);
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                if (!locked && canSend) onSubmit();
                            }
                        }}
                        className="min-h-[40px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#111426] outline-none placeholder:text-[#a0a5ba] disabled:opacity-60"
                    />

                    {/* 深度思考：开了才允许为"把计划做完"多花自检轮次，默认关着换回复速度。 */}
                    {onToggleDeepThinking ? (
                        <button
                            type="button"
                            onClick={onToggleDeepThinking}
                            aria-pressed={deepThinking}
                            title={t(
                                "blog.agentChat.deepThinkingHint",
                                "开启后智能体会自检并补完计划里的步骤，结果更完整但更慢",
                            )}
                            className={`flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors ${
                                deepThinking
                                    ? "bg-[#eeedfe] text-[#5d55fa]"
                                    : "text-[#8e94aa] hover:bg-[#f5f4fb] hover:text-[#6765f6]"
                            }`}
                        >
                            <Brain className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">
                                {t("blog.agentChat.deepThinking", "深度思考")}
                            </span>
                        </button>
                    ) : null}

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
                                onInputChange(
                                    t(`workspace.agent.actions.${key}`),
                                )
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
};

export default AgentComposer;
