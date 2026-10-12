import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    AtSign,
    Blocks,
    BookOpen,
    Brain,
    FileText,
    Globe,
    Image as ImageIcon,
    Loader2,
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
                className="h-16 w-16 rounded-xl border border-border object-cover"
            />
        ) : (
            <div className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs text-ink">
                <FileText className="h-4 w-4 text-ink-muted" />
                <span className="max-w-40 truncate">{attachment.name}</span>
            </div>
        )}
        <button
            type="button"
            onClick={() => onRemove(attachment.url)}
            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-white"
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
    alwaysExpanded = false,
    showQuickActions = false,
    deepThinking: _deepThinking = false,
    onInputChange,
    onFilesSelected,
    onRemoveAttachment,
    onSubmit,
    onCancel,
    onToggleDeepThinking: _onToggleDeepThinking,
    plugins = [],
    onPluginPreview,
    quickActions = QUICK_ACTIONS,
    t,
}) => {
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
    const [multiline, setMultiline] = useState(alwaysExpanded);
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

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return undefined;

        const measureLines = () => {
            textarea.style.height = "auto";
            const naturalHeight = textarea.scrollHeight;
            const shouldExpand =
                alwaysExpanded || naturalHeight > (multiline ? 48 : 40) + 1;
            textarea.style.height = `${Math.min(
                Math.max(naturalHeight, shouldExpand ? 48 : 40),
                120,
            )}px`;
            setMultiline((current) =>
                current === shouldExpand ? current : shouldExpand,
            );
        };

        measureLines();
        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(measureLines)
                : null;
        if (textarea.parentElement) observer?.observe(textarea.parentElement);
        return () => {
            observer?.disconnect();
        };
    }, [alwaysExpanded, input, multiline, textareaRef]);

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
            <div
                data-multiline={multiline ? "true" : "false"}
                className={`relative rounded-[1.75rem] border border-border bg-white shadow-sm transition-all focus-within:border-border-strong focus-within:ring-2 focus-within:ring-border-strong/20 ${
                    multiline ? "min-h-[88px] p-2" : "min-h-[48px] p-1"
                }`}
            >
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

                <div
                    ref={menuRef}
                    className={`relative flex min-h-0 ${
                        multiline ? "flex-col" : "flex-row items-center gap-2"
                    }`}
                >
                    <div
                        className={`min-w-0 ${
                            multiline
                                ? "order-1 min-h-[48px] w-full flex-1"
                                : "order-2 flex flex-1 items-center"
                        }`}
                    >
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={(event) =>
                                onInputChange(event.target.value)
                            }
                            disabled={locked}
                            aria-label={t("workspace.agent.inputPlaceholder")}
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
                            className={`block w-full min-w-0 resize-none bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-ink-faint disabled:opacity-60 ${
                                multiline
                                    ? "min-h-[48px] max-h-[120px] overflow-y-auto"
                                    : "min-h-[40px] max-h-[120px] flex-1"
                            }`}
                        />
                    </div>

                    <div
                        className={`shrink-0 items-center gap-2 ${
                            multiline
                                ? "order-2 mt-1 flex w-full justify-between"
                                : "contents"
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setAddMenuOpen((open) => !open);
                                setMentionMenuOpen(false);
                            }}
                            disabled={locked || uploadingAttachments}
                            className={`grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50 ${
                                multiline ? "" : "order-1"
                            }`}
                            title={t("blog.agentChat.addAttachment", "添加")}
                        >
                            {uploadingAttachments ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                        </button>

                        {addMenuOpen ? (
                            <div className="absolute bottom-12 left-0 z-30 w-72 overflow-hidden rounded-xl border border-border bg-white p-1.5 text-left shadow-[0_12px_32px_rgba(17,20,38,0.12)]">
                                <div className="px-2 py-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                    {t("workspace.agent.addSection", "添加")}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        fileInputRef.current?.click();
                                        setAddMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-ink hover:bg-surface-muted"
                                >
                                    <span className="grid h-6 w-6 place-items-center rounded-md bg-surface-muted text-ink">
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
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-ink-faint"
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
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-ink-faint"
                                >
                                    <PenLine
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {t(
                                            "workspace.agent.planMode",
                                            "计划模式",
                                        )}
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
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-ink-faint"
                                >
                                    <PenLine
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {t("workspace.agent.draw", "绘图")}
                                    </span>
                                    <span className="text-micro">
                                        {t(
                                            "workspace.agent.comingSoon",
                                            "即将推出",
                                        )}
                                    </span>
                                </button>
                                <div className="mt-1 border-t border-[#f0f0f5] pt-1">
                                    <div className="px-2 py-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-ink-muted">
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
                                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-ink hover:bg-surface-muted"
                                            >
                                                <span className="grid h-6 w-6 place-items-center rounded-md bg-surface-muted text-ink">
                                                    {pluginIcon(plugin)}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate">
                                                    <span className="block truncate">
                                                        {plugin.name}
                                                    </span>
                                                    {plugin.description ? (
                                                        <span className="block truncate text-micro font-normal text-ink-faint">
                                                            {plugin.description}
                                                        </span>
                                                    ) : null}
                                                </span>
                                                {recentPluginIds.includes(
                                                    plugin.id,
                                                ) ? (
                                                    <span className="text-micro text-ink-muted">
                                                        {t(
                                                            "workspace.agent.recent",
                                                            "最近",
                                                        )}
                                                    </span>
                                                ) : null}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-2 py-2 text-micro text-ink-muted">
                                            {t(
                                                "workspace.pluginsPage.empty",
                                                "暂无可用插件",
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {mentionMenuOpen ? (
                            <div className="absolute bottom-12 left-10 z-30 w-72 overflow-hidden rounded-xl border border-border bg-white p-1.5 text-left shadow-[0_12px_32px_rgba(17,20,38,0.12)]">
                                <div className="px-2 py-1.5 text-micro text-ink-muted">
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
                                            onClick={() =>
                                                previewPlugin(plugin)
                                            }
                                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-caption text-ink hover:bg-surface-muted"
                                        >
                                            <span className="text-ink">
                                                {pluginIcon(plugin)}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate">
                                                {plugin.name}
                                            </span>
                                            <span className="text-micro text-ink-faint">
                                                @{plugin.key}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-2 py-2 text-micro text-ink-muted">
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

                        {isActive ? (
                            <button
                                type="button"
                                onClick={onCancel}
                                aria-label={
                                    isActive
                                        ? t("common.cancel")
                                        : t("blog.agentChat.send")
                                }
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-ink-secondary ${
                                    multiline ? "" : "order-4"
                                }`}
                            >
                                <Square className="h-3.5 w-3.5 fill-current" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={locked || !canSend}
                                aria-label={
                                    isActive
                                        ? t("common.cancel")
                                        : t("blog.agentChat.send")
                                }
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-ink-secondary disabled:opacity-40 ${
                                    multiline ? "" : "order-4"
                                }`}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showQuickActions ? (
                <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                    {quickActions.map(({ key, icon: Icon, iconClassName }) => (
                        <button
                            key={key}
                            type="button"
                            disabled={locked}
                            onClick={() =>
                                onInputChange(
                                    t(`workspace.agent.actions.${key}`),
                                )
                            }
                            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink-secondary transition-all hover:border-border-strong hover:bg-surface-muted"
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
