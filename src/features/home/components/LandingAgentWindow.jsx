import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    BookOpen,
    Globe,
    Image as ImageIcon,
    Loader2,
    MessageSquare,
    PanelLeft,
    PenLine,
    Plus,
    Search,
    SlidersHorizontal,
    Sparkles,
} from "lucide-react";
import { useAuthSession } from "@features/auth/context/authSessionContextValue";
import { useAgentConversation } from "@features/agent/hooks/useAgentConversation";
import {
    agentConversationService,
    parseToolPayload,
} from "@features/agent/services/agentConversationService";
import AgentMarkdown from "@features/agent/components/AgentMarkdown";
import AgentComposer from "@features/agent/components/AgentComposer";
import {
    ImageToolProgressPanel,
    ImageToolResult,
    PlanCard,
    ThinkingIndicator,
    QuizMessage,
    ArtifactMessage,
} from "@features/agent/pages/AgentChat";
import { SelfCheckCard } from "@features/agent/components/AgentTraceCard";
import { parseQuizPayload } from "@features/agent/components/quizPayload";
import { GlowingRing3D } from "./LandingIllustrations";
import { useToast } from "@/hooks/useToast";

const IMAGE_TOOL = "image_generate";

const imageToolResult = (message) => {
    if (message?.kind !== "tool_result") return null;
    const payload = parseToolPayload(message.content);
    const tool = payload?.tool || message.toolName;
    return tool === IMAGE_TOOL && payload?.url ? payload : null;
};

const containsResultUrl = (content, urls) => {
    if (!content || urls.size === 0) return false;
    for (const url of urls) {
        if (content.includes(url)) return true;
    }
    return false;
};

const ThoughtCard = ({ content }) => (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
        <span className="whitespace-pre-wrap">{content}</span>
    </div>
);

ThoughtCard.propTypes = {
    content: PropTypes.string.isRequired,
};

const cleanImageMarkdown = (text) => {
    if (!text) return text;
    const imageMatch = text.match(/!\[.*?\]\([^)]+\)/);
    if (imageMatch) return imageMatch[0];
    return text;
};

const ConversationMessage = ({ role, content, isStreaming }) => (
    <div
        className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"}`}
    >
        <div
            className={
                role === "user"
                    ? "max-w-[85%] rounded-3xl bg-[#f2f1fd] px-4 py-2.5 text-xs sm:text-sm leading-6 text-black sm:max-w-[75%]"
                    : "w-full min-w-0 py-1 text-xs sm:text-sm leading-6 text-[#242741]"
            }
        >
            {role === "user" ? (
                <span className="whitespace-pre-wrap">{content}</span>
            ) : isStreaming ? (
                content ? (
                    <div className="flex items-start gap-0.5">
                        <div className="min-w-0 flex-1">
                            <AgentMarkdown content={cleanImageMarkdown(content)} />
                        </div>
                        <span
                            className="mt-1.5 inline-block h-4 w-[3px] shrink-0 animate-pulse rounded-sm bg-current align-middle"
                            aria-hidden="true"
                        />
                    </div>
                ) : (
                    <span
                        className="inline-flex items-center gap-1 px-1"
                        role="status"
                        aria-live="polite"
                    >
                        {[0, 1, 2].map((index) => (
                            <span
                                key={index}
                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-70"
                                style={{ animationDelay: `${index * 140}ms` }}
                            />
                        ))}
                    </span>
                )
            ) : (
                <AgentMarkdown content={cleanImageMarkdown(content)} />
            )}
        </div>
    </div>
);

ConversationMessage.propTypes = {
    role: PropTypes.string.isRequired,
    content: PropTypes.string,
    isStreaming: PropTypes.bool,
};

const LandingAgentWindow = ({ t }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const { userInfo, sessionStatus } = useAuthSession();

    const displayName =
        userInfo?.nickname || userInfo?.username || "XanderDING";

    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [uploadingAttachments, setUploadingAttachments] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const chatEndRef = useRef(null);
    const chatScrollRef = useRef(null);
    const stickToBottomRef = useRef(true);

    const {
        conversation,
        messages,
        loading,
        creating,
        running,
        reconnecting,
        errorMessage,
        liveSteps,
        sendMessage,
        cancelTurn,
        createConversation,
        reset,
    } = useAgentConversation({});

    const isActive = running || conversation?.status === "running";
    const locked = isActive || creating;

    const steps = useMemo(() => {
        if (liveSteps.length === 0) return [];
        return liveSteps;
    }, [liveSteps]);

    const streamingAnswer = useMemo(
        () =>
            steps.some(
                (step) =>
                    step.type === "answer" || step.type === "answer_delta",
            ),
        [steps],
    );

    const activeImageGeneration = useMemo(() => {
        let active = false;
        let message = "";
        steps.forEach((step) => {
            if (step.type !== "tool" || step.tool !== IMAGE_TOOL) return;
            if (step.phase === "start") {
                active = true;
                message = "";
            } else if (step.phase === "progress") {
                active = true;
                message = step.message || message;
            } else if (step.phase === "end" || step.phase === "error") {
                active = false;
            }
        });
        return active ? { message } : null;
    }, [steps]);

    const historicalImageUrls = useMemo(() => {
        const urls = new Set();
        messages.forEach((message) => {
            const result = imageToolResult(message);
            if (result?.url) urls.add(result.url);
        });
        return urls;
    }, [messages]);

    const liveImageUrls = useMemo(
        () =>
            new Set(
                steps
                    .filter(
                        (step) =>
                            step.type === "tool" &&
                            step.tool === IMAGE_TOOL &&
                            step.phase === "end" &&
                            step.result?.url,
                    )
                    .map((step) => step.result.url),
            ),
        [steps],
    );

    useEffect(() => {
        if (stickToBottomRef.current) {
            chatEndRef.current?.scrollIntoView({
                behavior: "auto",
                block: "end",
            });
        }
    }, [messages, steps]);

    useEffect(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.style.height = "auto";
        element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
    }, [input]);

    const submitText = useCallback(
        async (text, selectedAttachments = []) => {
            const trimmed = text.trim();
            if (!trimmed && selectedAttachments.length === 0) return;

            if (sessionStatus !== "authenticated") {
                const queryStr = `?q=${encodeURIComponent(trimmed)}`;
                navigate("/login", {
                    state: {
                        from: {
                            pathname: "/workspace/ai",
                            search: queryStr,
                        },
                    },
                });
                return;
            }

            stickToBottomRef.current = true;
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({
                    behavior: "auto",
                    block: "end",
                });
            }, 10);

            try {
                if (!conversation?.id) {
                    await createConversation(trimmed, selectedAttachments);
                } else {
                    await sendMessage(trimmed, { attachments: selectedAttachments });
                }
                setInput("");
                setAttachments([]);
            } catch (error) {
                toast.error(error.message || t("blog.agentChat.sendFailed"));
            }
        },
        [conversation?.id, createConversation, navigate, sendMessage, sessionStatus, t, toast],
    );

    const handleSubmit = async () => {
        if (!input.trim() && attachments.length === 0) {
            toast.warning(t("blog.agentChat.inputRequired"));
            return;
        }
        await submitText(input, attachments);
    };

    const handleQuizSubmit = useCallback(
        (payload) => {
            if (!conversation?.id || locked) return;
            sendMessage(JSON.stringify(payload));
        },
        [conversation?.id, locked, sendMessage],
    );

    const handleFilesSelected = useCallback(
        async (files) => {
            if (sessionStatus !== "authenticated") {
                toast.info(t("nav.loginRequired", "请先登录或进入工作台再使用此功能"));
                return;
            }
            const remaining = Math.max(0, 5 - attachments.length);
            if (!remaining) {
                toast.warning(t("blog.agentChat.attachmentLimit"));
                return;
            }
            const selected = files.slice(0, remaining);
            const valid = selected.filter((file) => {
                if (file.size <= 20 * 1024 * 1024) return true;
                toast.warning(
                    t("blog.agentChat.attachmentTooLarge", { name: file.name }),
                );
                return false;
            });
            if (!valid.length) return;
            setUploadingAttachments(true);
            try {
                const settled = await Promise.allSettled(
                    valid.map((file) =>
                        agentConversationService.uploadAttachment(file),
                    ),
                );
                const uploaded = settled
                    .filter((item) => item.status === "fulfilled")
                    .map((item) => item.value);
                if (uploaded.length) {
                    setAttachments((current) =>
                        [...current, ...uploaded].slice(0, 5),
                    );
                }
                if (settled.some((item) => item.status === "rejected")) {
                    toast.error(t("blog.agentChat.attachmentUploadFailed"));
                }
            } finally {
                setUploadingAttachments(false);
            }
        },
        [attachments.length, sessionStatus, t, toast],
    );

    const handleNewChat = () => {
        reset();
        setInput("");
        setAttachments([]);
    };

    const handleQuickAction = (actionKey) => {
        const actionPrompts = {
            generateImage: t("landing.agentWindow.generateImage"),
            searchWeb: t("landing.agentWindow.searchWeb"),
            generatePractice: t("landing.agentWindow.generatePractice"),
            importKnowledge: t("landing.agentWindow.importKnowledge"),
        };
        const text = actionPrompts[actionKey] || "";
        setInput(text);
        textareaRef.current?.focus();
    };

    const canSend = Boolean(input.trim() || attachments.length) && !uploadingAttachments;
    const hasActiveChat = messages.length > 0 || steps.length > 0;

    return (
        <div className="relative mx-auto mt-8 w-full max-w-4xl px-3 sm:px-0">
            {/* macOS Window Frame */}
            <div className="relative flex h-[530px] w-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_20px_60px_-15px_rgba(103,101,246,0.18)] backdrop-blur-xl transition-all duration-300">
                {/* Window Top Bar */}
                <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#f0f1f8] px-4">
                    {/* Traffic Light Dots */}
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm transition-transform hover:scale-110" />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm transition-transform hover:scale-110" />
                        <span className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm transition-transform hover:scale-110" />
                    </div>

                    {/* Window Controls / Settings Icon */}
                    <div className="flex items-center gap-2">
                        {hasActiveChat && (
                            <button
                                type="button"
                                onClick={() => navigate("/workspace/ai")}
                                className="text-micro font-medium text-[#6366f1] hover:underline"
                            >
                                {t("workspace.title")} ↗
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate("/workspace/ai")}
                            className="grid h-7 w-7 place-items-center rounded-lg text-[#8e94aa] hover:bg-[#f5f4fb] hover:text-[#5f6286] transition-colors"
                            title="Workspace"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Window Body: Left Mini-Rail + Main Content */}
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    {/* Left Sidebar Mini-Rail */}
                    <div className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-[#f0f1f8] bg-[#fbfbfe]/70 py-3">
                        <div className="flex flex-col items-center gap-3">
                            <button
                                type="button"
                                className="grid h-7 w-7 place-items-center rounded-lg text-[#8e94aa] hover:bg-[#edeef8] hover:text-[#5f6286] transition-colors"
                                title="Collapse"
                            >
                                <PanelLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNewChat}
                                className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)] transition-transform hover:scale-105 active:scale-95"
                                title="New Chat"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("search");
                                    textareaRef.current?.focus();
                                }}
                                className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${activeTab === "search" ? "bg-[#edeef8] text-[#6366f1]" : "text-[#8e94aa] hover:bg-[#edeef8] hover:text-[#5f6286]"}`}
                                title="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("chat")}
                                className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${activeTab === "chat" ? "bg-[#edeef8] text-[#6366f1]" : "text-[#8e94aa] hover:bg-[#edeef8] hover:text-[#5f6286]"}`}
                                title="Chat"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Main Dialog Viewport */}
                    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
                        {!hasActiveChat && !loading ? (
                            /* Welcome / Initial Showcase State */
                            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-8 pt-2 text-center">
                                {/* Center 3D Glowing Ring */}
                                <div className="relative mb-2 flex items-center justify-center">
                                    <GlowingRing3D className="h-24 w-24 animate-pulse" />
                                </div>

                                {/* Greeting */}
                                <h2 className="text-xl font-bold text-[#111426] sm:text-2xl">
                                    {t("landing.agentWindow.welcome")}{" "}
                                    <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                                        {displayName}
                                    </span>
                                </h2>

                                <p className="mt-1 max-w-md text-xs text-[#8b91a9]">
                                    {t("landing.agentWindow.subtitle")}
                                </p>

                                {/* Input Container */}
                                <div className="mt-6 w-full max-w-xl px-2">
                                    <AgentComposer
                                        input={input}
                                        attachments={attachments}
                                        locked={locked}
                                        uploadingAttachments={uploadingAttachments}
                                        canSend={canSend}
                                        isActive={isActive}
                                        fileInputRef={fileInputRef}
                                        textareaRef={textareaRef}
                                        showQuickActions={false}
                                        onInputChange={setInput}
                                        onFilesSelected={handleFilesSelected}
                                        onRemoveAttachment={(url) =>
                                            setAttachments((current) =>
                                                current.filter(
                                                    (att) => att.url !== url,
                                                ),
                                            )
                                        }
                                        onSubmit={handleSubmit}
                                        onCancel={cancelTurn}
                                        t={t}
                                    />

                                    {/* 4 Quick Action Chips */}
                                    <div className="mt-3.5 flex flex-wrap justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction("generateImage")}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ececf4] bg-white px-3 py-1.5 text-xs font-semibold text-[#404461] shadow-xs transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                                        >
                                            <span className="grid h-4 w-4 place-items-center rounded-md bg-emerald-50 text-emerald-500">
                                                <ImageIcon className="h-3 w-3" />
                                            </span>
                                            <span>{t("landing.agentWindow.generateImage")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction("searchWeb")}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ececf4] bg-white px-3 py-1.5 text-xs font-semibold text-[#404461] shadow-xs transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                                        >
                                            <span className="grid h-4 w-4 place-items-center rounded-md bg-orange-50 text-orange-500">
                                                <Globe className="h-3 w-3" />
                                            </span>
                                            <span>{t("landing.agentWindow.searchWeb")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction("generatePractice")}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ececf4] bg-white px-3 py-1.5 text-xs font-semibold text-[#404461] shadow-xs transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                                        >
                                            <span className="grid h-4 w-4 place-items-center rounded-md bg-blue-50 text-blue-500">
                                                <PenLine className="h-3 w-3" />
                                            </span>
                                            <span>{t("landing.agentWindow.generatePractice")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction("importKnowledge")}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ececf4] bg-white px-3 py-1.5 text-xs font-semibold text-[#404461] shadow-xs transition-all hover:border-[#817bf2] hover:bg-[#f9f8fe]"
                                        >
                                            <span className="grid h-4 w-4 place-items-center rounded-md bg-purple-50 text-purple-500">
                                                <BookOpen className="h-3 w-3" />
                                            </span>
                                            <span>{t("landing.agentWindow.importKnowledge")}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Live Chat Active State */
                            <>
                                <div
                                    ref={chatScrollRef}
                                    onScroll={(event) => {
                                        const el = event.currentTarget;
                                        stickToBottomRef.current =
                                            el.scrollHeight - el.scrollTop - el.clientHeight < 96;
                                    }}
                                    className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-6"
                                >
                                    <div className="mx-auto flex max-w-2xl flex-col gap-4">
                                        {messages.map((message) => {
                                            if (message.kind === "quiz" || parseQuizPayload(message)) {
                                                return (
                                                    <QuizMessage
                                                        key={message.id}
                                                        message={message}
                                                        onSubmit={handleQuizSubmit}
                                                    />
                                                );
                                            }
                                            if (message.kind === "artifact") {
                                                return (
                                                    <ArtifactMessage
                                                        key={message.id}
                                                        message={message}
                                                    />
                                                );
                                            }
                                            if (message.role === "user") {
                                                return (
                                                    <ConversationMessage
                                                        key={message.id}
                                                        role="user"
                                                        content={message.content}
                                                    />
                                                );
                                            }
                                            if (message.kind === "thought") {
                                                return (
                                                    <ThoughtCard
                                                        key={message.id}
                                                        content={message.content}
                                                    />
                                                );
                                            }
                                            if (message.kind === "reflection") {
                                                return (
                                                    <SelfCheckCard
                                                        key={message.id}
                                                        content={message.content}
                                                    />
                                                );
                                            }
                                            if (message.kind === "tool_result") {
                                                const result = imageToolResult(message);
                                                return result ? (
                                                    <ImageToolResult
                                                        key={message.id}
                                                        url={result.url}
                                                        title={result.title}
                                                    />
                                                ) : null;
                                            }
                                            if (message.kind === "plan") {
                                                return (
                                                    <PlanCard
                                                        key={message.id}
                                                        items={parseToolPayload(message.content)}
                                                    />
                                                );
                                            }
                                            if (message.kind === "answer" || message.kind === "message") {
                                                if (containsResultUrl(message.content, historicalImageUrls)) {
                                                    return null;
                                                }
                                                return (
                                                    <ConversationMessage
                                                        key={message.id}
                                                        role="assistant"
                                                        content={message.content}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}

                                        {steps.map((step, index) => {
                                            if (step.type === "user") {
                                                return (
                                                    <ConversationMessage
                                                        key={`live-${index}`}
                                                        role="user"
                                                        content={step.content}
                                                    />
                                                );
                                            }
                                            if (step.type === "thought") {
                                                return (
                                                    <ThoughtCard
                                                        key={`live-${index}`}
                                                        content={step.content}
                                                    />
                                                );
                                            }
                                            if (step.type === "plan") {
                                                return (
                                                    <PlanCard
                                                        key={`live-${index}`}
                                                        items={step.items}
                                                    />
                                                );
                                            }
                                            if (step.type === "reflection") {
                                                return (
                                                    <SelfCheckCard
                                                        key={`live-${index}`}
                                                        content={step.content}
                                                        round={step.round}
                                                    />
                                                );
                                            }
                                            if (step.type === "artifact") {
                                                return (
                                                    <ArtifactMessage
                                                        key={`live-${index}`}
                                                        message={step}
                                                    />
                                                );
                                            }
                                            if (step.type === "tool") {
                                                if (
                                                    step.tool === IMAGE_TOOL &&
                                                    step.phase === "end" &&
                                                    step.result?.url
                                                ) {
                                                    return (
                                                        <ImageToolResult
                                                            key={`live-${index}`}
                                                            url={step.result.url}
                                                            title={step.result.title}
                                                        />
                                                    );
                                                }
                                                return null;
                                            }
                                            if (
                                                step.type === "answer" ||
                                                step.type === "answer_delta"
                                            ) {
                                                if (containsResultUrl(step.content, liveImageUrls)) {
                                                    return null;
                                                }
                                                return (
                                                    <ConversationMessage
                                                        key={`live-${index}`}
                                                        role="assistant"
                                                        content={step.content}
                                                        isStreaming={step.type === "answer_delta"}
                                                    />
                                                );
                                            }
                                            if (step.type === "error") {
                                                return (
                                                    <div
                                                        key={`live-${index}`}
                                                        className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger"
                                                    >
                                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{step.message}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}

                                        {activeImageGeneration ? (
                                            <ImageToolProgressPanel
                                                message={activeImageGeneration.message}
                                            />
                                        ) : null}

                                        {(isActive || creating || (loading && steps.length > 0)) &&
                                            !streamingAnswer &&
                                            !activeImageGeneration && (
                                                <ThinkingIndicator
                                                    label={t("blog.agentChat.thinking")}
                                                />
                                            )}

                                        {(reconnecting || errorMessage) && (
                                            <div
                                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                                                    errorMessage
                                                        ? "border-danger/20 bg-danger/5 text-danger"
                                                        : "border-border bg-surface-muted text-ink-secondary"
                                                }`}
                                            >
                                                {errorMessage ? (
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                ) : (
                                                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                                )}
                                                <span className="truncate">
                                                    {errorMessage || (reconnecting ? t("blog.agentChat.reconnecting") : "")}
                                                </span>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} className="h-2" />
                                    </div>
                                </div>

                                {/* Bottom Input Bar for Active Chat */}
                                <div className="shrink-0 border-t border-[#f0f1f8] bg-white/90 p-3">
                                    <div className="mx-auto w-full max-w-2xl">
                                        <AgentComposer
                                            input={input}
                                            attachments={attachments}
                                            locked={locked}
                                            uploadingAttachments={uploadingAttachments}
                                            canSend={canSend}
                                            isActive={isActive}
                                            fileInputRef={fileInputRef}
                                            textareaRef={textareaRef}
                                            onInputChange={setInput}
                                            onFilesSelected={handleFilesSelected}
                                            onRemoveAttachment={(url) =>
                                                setAttachments((current) =>
                                                    current.filter((att) => att.url !== url),
                                                )
                                            }
                                            onSubmit={handleSubmit}
                                            onCancel={cancelTurn}
                                            t={t}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

LandingAgentWindow.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingAgentWindow;
