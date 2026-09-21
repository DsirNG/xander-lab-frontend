import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Globe,
    Image as ImageIcon,
    MessageSquare,
    PanelLeft,
    PenLine,
    Plus,
    Search,
    SlidersHorizontal,
    Sparkles,
} from "lucide-react";
import { useAuthSession } from "@features/auth";
import {
    imageUrlsFromMessages,
    imageUrlsFromSteps,
} from "./imageResult";
import {
    getActiveImageGeneration,
    hasStreamingAnswer,
} from "../utils/conversationState";
import AgentComposer from "./AgentComposer";
import AgentShowcaseConversation from "./AgentShowcaseConversation";
import { uploadAgentAttachment } from "../capabilities";
import { useAgentConversation } from "../hooks/useAgentConversation";
import { useToast } from "@shared/hooks/useToast";

const AgentShowcase = ({ t, welcomeVisual: WelcomeVisual }) => {
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

    const streamingAnswer = useMemo(() => hasStreamingAnswer(steps), [steps]);
    const activeImageGeneration = useMemo(
        () => getActiveImageGeneration(steps),
        [steps],
    );

    const historicalImageUrls = useMemo(() => imageUrlsFromMessages(messages), [messages]);

    const liveImageUrls = useMemo(() => imageUrlsFromSteps(steps), [steps]);

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
                        uploadAgentAttachment(file),
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
                                    <WelcomeVisual className="h-24 w-24 animate-pulse" />
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
                                <AgentShowcaseConversation
                                    messages={messages}
                                    steps={steps}
                                    historicalImageUrls={historicalImageUrls}
                                    liveImageUrls={liveImageUrls}
                                    activeImageGeneration={activeImageGeneration}
                                    isActive={isActive}
                                    creating={creating}
                                    loading={loading}
                                    reconnecting={reconnecting}
                                    errorMessage={errorMessage}
                                    streamingAnswer={streamingAnswer}
                                    onQuizSubmit={handleQuizSubmit}
                                    chatEndRef={chatEndRef}
                                    stickToBottomRef={stickToBottomRef}
                                    t={t}
                                />

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

AgentShowcase.propTypes = {
    t: PropTypes.func.isRequired,
    welcomeVisual: PropTypes.elementType.isRequired,
};

export default AgentShowcase;
