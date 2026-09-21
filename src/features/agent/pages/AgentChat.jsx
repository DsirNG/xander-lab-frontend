import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    ArrowLeft,
    Bot,
    Loader2,
    MessageSquareText,
    ShieldAlert,
    X,
    Globe,
    PenLine,
    Image as ImageIcon,
    Menu,
    PanelLeftOpen,
    Link2,
    Search,
    SquarePen,
} from "lucide-react";
import { useToast } from "@shared/hooks/useToast";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import {
    AgentPreviewPanel,
    getBlogAgentTask,
    publishBlogAgentTask,
} from "@features/blog";
import useIsMobile from "@shared/hooks/useIsMobile";
import useClickOutside from "@shared/hooks/useClickOutside";
import { useAgentConversation } from "../hooks/useAgentConversation";
import {
    agentConversationService,
    parseToolPayload,
} from "../services/agentConversationService";
import AgentSessionList from "../components/AgentSessionList";
import AgentApprovalCard from "../components/AgentApprovalCard";
import AgentChatInputBar from "../components/AgentChatInputBar";
import {
    AgentConversationMessage,
    AgentThoughtCard,
} from "../components/AgentConversationMessage";
import ImageToolResult from "../components/ImageToolResult";
import {
    ArtifactMessage,
    ImageToolProgressPanel,
    PlanCard,
    QuizMessage,
    ThinkingIndicator,
} from "../components/AgentMessageParts";
import { AgentTraceCard, SelfCheckCard } from "../components/AgentTraceCard";
import { mergeLiveTraces, mergeToolTraces } from "../components/agentTrace";
import {
    IMAGE_TOOL,
    containsResultUrl,
    imageToolResult,
    imageUrlsFromMessages,
    imageUrlsFromSteps,
    liveImageStepResult,
} from "../components/imageResult";
import AgentImagesPage from "./AgentImagesPage";
import { ProfileModal } from "@features/profile";
import { useAuthSession } from "@features/auth";
import { parseQuizPayload } from "../components/quizPayload";

/**
 * 自动滚动的最小间隔（毫秒）。滚动本身会触发动画与重排，
 * 而流式期间相关的数组每个动画帧都在变，逐帧滚动会与渲染互相拖累。
 */
const SCROLL_THROTTLE_INTERVAL_MS = 120;

// 仍然从这里导出，保持既有调用方与测试的导入路径不变。
export { ImageToolResult };

export {
    ArtifactMessage,
    ImageToolProgressPanel,
    PlanCard,
    QuizMessage,
    ThinkingIndicator,
};

const AgentChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const blogTaskId = searchParams.get("blogTaskId");
    const queryParam = searchParams.get("q");
    const toast = useToast();
    const isMobile = useIsMobile(1024);
    const { userInfo } = useAuthSession();

    const displayName = userInfo?.nickname || userInfo?.username || "用户";
    const avatarText = (displayName || "XL").slice(0, 2).toUpperCase();
    const avatar = userInfo?.avatar;

    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [uploadingAttachments, setUploadingAttachments] = useState(false);
    const [view, setView] = useState("chat"); // 'chat' | 'images'：图片画廊是智能体对话内的视图
    const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
    const [artifactData, setArtifactData] = useState(null);
    const [artifactLoading, setArtifactLoading] = useState(false);
    const [artifactError, setArtifactError] = useState(null);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const shareMenuRef = useRef(null);
    const searchModalRef = useRef(null);
    const chatEndRef = useRef(null);
    const chatScrollRef = useRef(null);
    const stickToBottomRef = useRef(true);
    const pendingQueryRef = useRef(null);

    const {
        sessions,
        sessionsLoading,
        conversation,
        messages,
        loading,
        creating,
        running,
        approvals,
        decidingApprovalId,
        reconnecting,
        errorMessage,
        liveSteps,
        deepThinking,
        setDeepThinking,
        sendMessage,
        cancelTurn,
        decideApproval,
        createConversation,
        reset,
    } = useAgentConversation({ conversationId });

    useEffect(() => {
        if (!blogTaskId) {
            setArtifactData(null);
            setArtifactError(null);
            setArtifactLoading(false);
            setSelectedVersionId(null);
            return undefined;
        }
        const controller = new AbortController();
        setArtifactLoading(true);
        setArtifactError(null);
        setArtifactData(null);
        getBlogAgentTask(blogTaskId, {
            _silent: true,
            signal: controller.signal,
        })
            .then((data) => {
                if (controller.signal.aborted) return;
                setArtifactData(data);
                setSelectedVersionId(data?.versions?.[0]?.id ?? null);
            })
            .catch((error) => {
                if (controller.signal.aborted || error?.code === "ERR_CANCELED")
                    return;
                setArtifactError(error.message || t("blog.agent.failed"));
            })
            .finally(() => {
                if (!controller.signal.aborted) setArtifactLoading(false);
            });
        return () => controller.abort();
    }, [blogTaskId, t]);

    const isActive = running || conversation?.status === "running";
    // 等待审批时这一轮并没有结束，只是卡在工具授权上：输入框和答题卡都要锁住，
    // 否则用户可以再发一轮把待审批的那一轮顶掉。
    const awaitingApproval = conversation?.status === "awaiting_approval";
    const locked = isActive || awaitingApproval || creating;

    // 流式步骤先把同一次工具调用的 start/progress/delta/end 合成一条轨迹，
    // 否则收口时入参和输出会各自消失，用户看不到这一步到底做了什么。
    const steps = useMemo(() => mergeLiveTraces(liveSteps), [liveSteps]);

    /** 持久化消息同样先归并：刷新后仍要能展开回看每次工具调用。 */
    const timeline = useMemo(() => mergeToolTraces(messages), [messages]);

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

    const historicalImageUrls = useMemo(() => imageUrlsFromMessages(messages), [messages]);

    const liveImageUrls = useMemo(() => imageUrlsFromSteps(steps), [steps]);

    useEffect(() => {
        if (!stickToBottomRef.current) return undefined;
        // 流式期间 steps 每个动画帧都在变，若直接在这里滚动就会每帧触发一次
        // 带动画重排；合并到一个时间窗内只滚一次，既跟得上又不拖慢渲染。
        const timer = setTimeout(() => {
            chatEndRef.current?.scrollIntoView({
                behavior: "auto",
                block: "end",
            });
        }, SCROLL_THROTTLE_INTERVAL_MS);
        return () => clearTimeout(timer);
    }, [messages, steps]);

    const handleSubmit = async () => {
        if (!input.trim() && attachments.length === 0) {
            toast.warning(t("blog.agentChat.inputRequired"));
            return;
        }
        await submitText(input, attachments);
    };

    const handleFilesSelected = useCallback(
        async (files) => {
            const remaining = Math.max(0, 5 - attachments.length);
            if (!remaining) {
                toast.warning(t("blog.agentChat.attachmentLimit"));
                return;
            }
            const selected = files.slice(0, remaining);
            if (files.length > remaining)
                toast.warning(t("blog.agentChat.attachmentLimit"));
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
                if (uploaded.length)
                    setAttachments((current) =>
                        [...current, ...uploaded].slice(0, 5),
                    );
                if (settled.some((item) => item.status === "rejected")) {
                    toast.error(t("blog.agentChat.attachmentUploadFailed"));
                }
            } finally {
                setUploadingAttachments(false);
            }
        },
        [attachments.length, t, toast],
    );

    const handleRemoveAttachment = useCallback((url) => {
        setAttachments((current) =>
            current.filter((attachment) => attachment.url !== url),
        );
    }, []);

    /** 发送一段文本：无会话时先建会话壳再经流式接口发首条消息，否则直接发到当前会话。 */
    const submitText = useCallback(
        async (text, selectedAttachments = []) => {
            const trimmed =
                text.trim() || t("blog.agentChat.analyzeAttachments");
            if (!trimmed && selectedAttachments.length === 0) return;
            stickToBottomRef.current = true;
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({
                    behavior: "auto",
                    block: "end",
                });
            }, 10);

            if (!conversationId) {
                try {
                    const detail = await createConversation(
                        trimmed,
                        selectedAttachments,
                    );
                    if (!detail?.conversation?.id) return;
                    navigate(`/workspace/agent/${detail.conversation.id}`, {
                        replace: true,
                    });
                    setInput("");
                    setAttachments([]);
                } catch (error) {
                    toast.error(
                        error.message || t("blog.agentChat.sendFailed"),
                    );
                }
                return;
            }
            setInput("");
            setAttachments([]);
            await sendMessage(trimmed, { attachments: selectedAttachments });
        },
        [conversationId, createConversation, navigate, sendMessage, t, toast],
    );

    const handleNewConversation = () => {
        reset();
        setInput("");
        setAttachments([]);
        setView("chat");
        navigate("/workspace/agent", { replace: true });
    };

    const handleStop = () => cancelTurn();

    const handleQuizSubmit = useCallback(
        async (payload) => {
            if (!conversationId || locked) return false;
            // 答题卡提交是内部协议；服务端会持久化为可读的 quiz_answer，不能先把 JSON 当作用户消息显示。
            // 把结果原样回给卡片：返回 false 时卡片要退回可编辑，不能锁死在"已提交"。
            return sendMessage(JSON.stringify(payload), {
                displayUserMessage: false,
            });
        },
        [conversationId, locked, sendMessage],
    );

    const handleApprovalDecision = useCallback(
        async (approvalId, approved) => {
            try {
                await decideApproval(approvalId, approved);
            } catch (error) {
                toast.error(error.message || t("blog.agentChat.sendFailed"));
            }
        },
        [decideApproval, t, toast],
    );

    // 图片等入口页面携带 ?q= 跳转而来：自动创建会话并发送首条消息。
    // ref 守卫保证同一 q 只触发一次（StrictMode 双执行与路由变化都不会重复发送）。
    useEffect(() => {
        if (
            !queryParam ||
            conversationId ||
            creating ||
            pendingQueryRef.current === queryParam
        )
            return;
        pendingQueryRef.current = queryParam;
        setInput(queryParam);
        (async () => {
            try {
                await submitText(queryParam);
                const next = new URLSearchParams(searchParams);
                next.delete("q");
                setSearchParams(next, { replace: true });
            } catch (error) {
                toast.error(error.message || t("blog.agentChat.sendFailed"));
            }
        })();
    }, [
        queryParam,
        conversationId,
        creating,
        submitText,
        searchParams,
        setSearchParams,
        t,
        toast,
    ]);

    /** 图片画廊内发起生成：与「新聊天」等价——总是新建会话，只是首条消息固定为生成图片指令。 */
    const handleImagesGenerate = useCallback(
        async (query) => {
            setView("chat");
            try {
                const detail = await createConversation(
                    `生成一张图片: ${query}`,
                );
                if (!detail?.conversation?.id) return;
                navigate(`/workspace/agent/${detail.conversation.id}`, {
                    replace: true,
                });
                setInput("");
            } catch (error) {
                toast.error(error.message || t("blog.agentChat.sendFailed"));
            }
        },
        [createConversation, navigate, t, toast],
    );

    const handleCloseArtifact = () => {
        const next = new URLSearchParams(searchParams);
        next.delete("blogTaskId");
        setSearchParams(next, { replace: true });
    };

    const closeShareMenu = () => setIsShareOpen(false);
    useClickOutside(shareMenuRef, closeShareMenu, isShareOpen);

    const closeSearchModal = () => {
        setSearchOpen(false);
        setSearchQuery("");
    };
    useClickOutside(searchModalRef, closeSearchModal, searchOpen);

    const handleCopyShareLink = async () => {
        if (!conversationId) return;
        setShareLoading(true);
        try {
            const { post } = await import("@api");
            const token = await post(
                `/api/agent/conversations/${conversationId}/share`,
            );
            const shareUrl = `${window.location.origin}/agent/shared/${token}`;
            await navigator.clipboard.writeText(shareUrl);
            setIsShareCopied(true);
            toast.success(t("blog.shareLinkCopied", "分享链接已复制"));
            setTimeout(() => setIsShareCopied(false), 2000);
        } catch (error) {
            toast.error(error.message || t("blog.shareFailed", "分享失败"));
        } finally {
            setShareLoading(false);
        }
    };

    const handlePublishArtifact = async () => {
        if (!blogTaskId) return;
        setIsPublishing(true);
        try {
            // The task endpoint reconciles uncertain/repeated publish attempts by
            // returning the post already attached to this generated artifact.
            const post = await publishBlogAgentTask(blogTaskId, {
                dedupe: false,
            });
            setArtifactData(
                (current) =>
                    current && {
                        ...current,
                        task: { ...current.task, publishedPostId: post.id },
                    },
            );
            toast.success(t("blog.publishSuccess"));
        } catch (error) {
            toast.error(error.message || t("blog.publishError"));
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCreateArtifactDraft = () => {
        const task = artifactData?.task;
        if (!task) return;
        const version = artifactData?.versions?.find(
            (item) => String(item.id) === String(selectedVersionId),
        );
        setIsSavingDraft(true);
        try {
            localStorage.setItem(
                "xander-lab:blog-publish-draft",
                JSON.stringify({
                    title: task.title,
                    summary: version?.summary || task.summary,
                    content: version?.content || task.content,
                    categoryId: task.categoryId,
                    tags: artifactData.tags || [],
                }),
            );
            toast.success(t("blog.agent.draftCreated"));
            navigate("/workspace/publish");
        } catch (error) {
            toast.error(error.message || t("blog.agent.failed"));
        } finally {
            setIsSavingDraft(false);
        }
    };

    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return sessions;
        const query = searchQuery.toLowerCase();
        return sessions.filter((session) =>
            (session.title || "").toLowerCase().includes(query),
        );
    }, [sessions, searchQuery]);

    const navigationLocked = loading || creating;

    const statusLine = useMemo(() => {
        if (reconnecting) return t("blog.agentChat.reconnecting");
        if (isActive) return t("blog.agentChat.running");
        if (conversation?.status === "failed")
            return conversation.errorMessage || t("blog.agentChat.failed");
        return t("blog.agentChat.ready");
    }, [reconnecting, isActive, conversation, t]);

    const showArtifact = Boolean(blogTaskId);
    const artifactTask = artifactData?.task;
    const artifactStatusText =
        artifactTask?.status === "failed"
            ? artifactTask.errorMessage || t("blog.agent.failed")
            : artifactTask?.status === "ready"
              ? t("blog.agent.ready")
              : t("blog.agent.running");
    const artifactPanel = artifactLoading ? (
        <div className="flex h-full min-h-48 items-center justify-center bg-canvas">
            <LoadingSpinner
                fullScreen={false}
                text={t("blog.agent.restoring")}
            />
        </div>
    ) : artifactError ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <div className="text-sm font-semibold text-danger">
                {artifactError}
            </div>
            <button
                type="button"
                onClick={handleCloseArtifact}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-ink-secondary"
            >
                {t("common.close")}
            </button>
        </div>
    ) : (
        <AgentPreviewPanel
            taskData={artifactData}
            selectedVersionId={selectedVersionId}
            statusText={artifactStatusText}
            isPublishing={isPublishing}
            isSavingDraft={isSavingDraft}
            onPublish={handlePublishArtifact}
            onCreateDraft={handleCreateArtifactDraft}
            onViewPublished={() =>
                artifactTask?.publishedPostId &&
                navigate(`/blog/${artifactTask.publishedPostId}`)
            }
            onSelectVersion={setSelectedVersionId}
            onClose={handleCloseArtifact}
        />
    );

    return (
        <div className="flex h-dvh flex-col bg-[#fcfcfc] font-chat text-ink">
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                {!sidebarCollapsed && (
                    <AgentSessionList
                        sessions={sessions.map((session) => ({
                            ...session,
                            input: session.title,
                        }))}
                        activeId={conversationId}
                        loading={sessionsLoading}
                        disableNew={navigationLocked}
                        imagesActive={view === "images"}
                        newChatActive={view === "chat" && !conversationId}
                        onSelect={(id) => {
                            if (!navigationLocked) {
                                setView("chat");
                                navigate(`/workspace/agent/${id}`);
                            }
                        }}
                        onNew={handleNewConversation}
                        onCollapse={() => setSidebarCollapsed(true)}
                        onSearch={() => setSearchOpen(true)}
                        onImages={() => setView("images")}
                        onOpenSettings={() => setSettingsOpen(true)}
                    />
                )}
                {sidebarCollapsed && (
                    <div className="hidden lg:flex w-16 shrink-0 flex-col items-center border-r border-border bg-[#fcfcfc] py-4">
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-surface-muted transition"
                                title="展开"
                            >
                                <Bot className="h-6 w-6" />
                            </button>
                            <button
                                onClick={handleNewConversation}
                                className="mt-2 grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition"
                                title="新建会话"
                            >
                                <SquarePen className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition"
                                title="搜索"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition"
                                title="展开会话列表"
                            >
                                <MessageSquareText className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-auto">
                            <div
                                className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-accent text-white font-bold text-xs uppercase hover:opacity-80 transition"
                                title="用户"
                            >
                                {avatarText}
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={displayName}
                                        className="absolute inset-0 h-full w-full rounded-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
                {mobileSessionsOpen && (
                    <div className="absolute inset-0 z-40 flex bg-ink/40 lg:hidden">
                        <AgentSessionList
                            mobile
                            sessions={sessions.map((session) => ({
                                ...session,
                                input: session.title,
                            }))}
                            activeId={conversationId}
                            loading={sessionsLoading}
                            disableNew={navigationLocked}
                            imagesActive={view === "images"}
                            newChatActive={view === "chat" && !conversationId}
                            onSelect={(id) => {
                                if (navigationLocked) return;
                                setMobileSessionsOpen(false);
                                setView("chat");
                                navigate(`/workspace/agent/${id}`);
                            }}
                            onNew={() => {
                                setMobileSessionsOpen(false);
                                handleNewConversation();
                            }}
                            onSearch={() => setSearchOpen(true)}
                            onImages={() => {
                                setMobileSessionsOpen(false);
                                setView("images");
                            }}
                            onOpenSettings={() => setSettingsOpen(true)}
                        />
                        <button
                            type="button"
                            onClick={() => setMobileSessionsOpen(false)}
                            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-canvas text-ink-secondary shadow-lg"
                            aria-label={t("common.close")}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                <section
                    className={`relative flex min-h-0 min-w-0 flex-1 flex-col bg-canvas ${showArtifact && !isMobile ? "lg:max-w-[48%]" : ""}`}
                >
                    {view === "images" ? (
                        <div className="min-h-0 flex-1">
                            <AgentImagesPage
                                onGenerate={handleImagesGenerate}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Main Header */}
                            <header className="absolute top-0 left-0 right-0 z-10 flex h-14 items-center justify-between px-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                    {sidebarCollapsed && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSidebarCollapsed(false)
                                                }
                                                className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted transition lg:hidden"
                                            >
                                                <PanelLeftOpen className="h-5 w-5" />
                                            </button>
                                            <span className="font-bold text-base text-ink lg:hidden">
                                                DinQorAI
                                            </span>
                                        </>
                                    )}
                                    {!sidebarCollapsed && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMobileSessionsOpen(true)
                                            }
                                            className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted lg:hidden"
                                        >
                                            <PanelLeftOpen className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {sidebarCollapsed && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearchOpen(true)
                                                }
                                                className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted transition lg:hidden"
                                            >
                                                <Search className="h-5 w-5" />
                                            </button>
                                            <div className="relative grid h-8 w-8 place-items-center rounded-full bg-accent text-white font-bold text-xs uppercase lg:hidden">
                                                {avatarText}
                                                {avatar ? (
                                                    <img
                                                        src={avatar}
                                                        alt={displayName}
                                                        className="absolute inset-0 h-full w-full rounded-full object-cover"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                        </>
                                    )}
                                    {!sidebarCollapsed && (
                                        <div
                                            ref={shareMenuRef}
                                            className="relative"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsShareOpen(
                                                        (open) => !open,
                                                    )
                                                }
                                                aria-expanded={isShareOpen}
                                                aria-haspopup="dialog"
                                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-accent"
                                            >
                                                <Link2 className="h-4 w-4" />{" "}
                                                分享
                                            </button>
                                            {isShareOpen ? (
                                                <div
                                                    role="dialog"
                                                    aria-label="分享对话"
                                                    className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-border bg-canvas p-3 shadow-xl"
                                                >
                                                    <div className="mb-2 text-sm font-bold text-ink-secondary">
                                                        分享对话链接
                                                    </div>
                                                    <p className="mb-2 text-xs text-ink-muted">
                                                        复制链接后，对方无需登录即可查看此对话
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handleCopyShareLink
                                                            }
                                                            disabled={
                                                                shareLoading ||
                                                                !conversationId
                                                            }
                                                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
                                                        >
                                                            {shareLoading ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                                                    生成中...
                                                                </>
                                                            ) : isShareCopied ? (
                                                                "已复制"
                                                            ) : (
                                                                <>
                                                                    <Link2 className="h-4 w-4" />{" "}
                                                                    复制分享链接
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </header>

                            {loading && messages.length > 0 && (
                                <div className="absolute top-14 left-0 right-0 z-10 h-0.5 overflow-hidden bg-border">
                                    <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
                                </div>
                            )}

                            {messages.length === 0 &&
                            steps.length === 0 &&
                            !loading ? (
                                <div className="flex h-full flex-col items-center justify-center px-4 pt-10">
                                    <div className="mb-8 text-display text-ink">
                                        {t("blog.agentChat.startHeadline")}
                                    </div>

                                    <AgentChatInputBar
                                        t={t}
                                        input={input}
                                        setInput={setInput}
                                        attachments={attachments}
                                        uploading={uploadingAttachments}
                                        isActive={isActive}
                                        creating={creating}
                                        hasConversation={false}
                                        onFilesSelected={handleFilesSelected}
                                        onRemoveAttachment={
                                            handleRemoveAttachment
                                        }
                                        onSubmit={handleSubmit}
                                        onStop={handleStop}
                                        deepThinking={deepThinking}
                                        onToggleDeepThinking={() =>
                                            setDeepThinking(
                                                (current) => !current,
                                            )
                                        }
                                    />

                                    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-2">
                                        <button
                                            onClick={() =>
                                                setInput(
                                                    t(
                                                        "blog.agentChat.quickGenerateImage",
                                                    ),
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-xl border border-border bg-[#ffffff] px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                                        >
                                            <ImageIcon className="h-4 w-4 text-emerald-500" />
                                            {t(
                                                "blog.agentChat.quickGenerateImage",
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setInput(
                                                    t(
                                                        "blog.agentChat.quickWritePrompt",
                                                    ),
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-xl border border-border bg-[#ffffff] px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                                        >
                                            <PenLine className="h-4 w-4 text-blue-500" />
                                            {t("blog.agentChat.quickWrite")}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setInput(
                                                    t(
                                                        "blog.agentChat.quickSearch",
                                                    ),
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-xl border border-border bg-[#ffffff] px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                                        >
                                            <Globe className="h-4 w-4 text-orange-500" />
                                            {t("blog.agentChat.quickSearch")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        ref={chatScrollRef}
                                        onScroll={(event) => {
                                            const element = event.currentTarget;
                                            stickToBottomRef.current =
                                                element.scrollHeight -
                                                    element.scrollTop -
                                                    element.clientHeight <
                                                96;
                                        }}
                                        className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-20 sm:px-6"
                                    >
                                        {loading &&
                                        !creating &&
                                        !running &&
                                        steps.length === 0 &&
                                        messages.length === 0 ? (
                                            <div className="flex h-full min-h-48 items-center justify-center">
                                                <LoadingSpinner
                                                    fullScreen={false}
                                                    text={t(
                                                        "blog.agentChat.restoring",
                                                    )}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mx-auto flex max-w-3xl flex-col gap-5">
                                                    {timeline.map((message) => {
                                                        if (message.kind === "trace") {
                                                            return (
                                                                <AgentTraceCard
                                                                    key={message.id}
                                                                    trace={message}
                                                                />
                                                            );
                                                        }
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
                                                        if (
                                                        message.role === "user"
                                                    ) {
                                                        return (
                                                            <AgentConversationMessage
                                                                key={message.id}
                                                                role="user"
                                                                content={
                                                                    message.content
                                                                }
                                                                attachments={
                                                                    message.attachments
                                                                }
                                                            />
                                                        );
                                                    }
                                                    if (
                                                        message.kind ===
                                                        "thought"
                                                    ) {
                                                        return (
                                                            <AgentThoughtCard
                                                                key={message.id}
                                                                content={
                                                                    message.content
                                                                }
                                                            />
                                                        );
                                                    }
                                                    if (
                                                        message.kind ===
                                                        "reflection"
                                                    ) {
                                                        return (
                                                            <SelfCheckCard
                                                                key={message.id}
                                                                content={
                                                                    message.content
                                                                }
                                                            />
                                                        );
                                                    }
                                                    if (
                                                        message.kind ===
                                                        "tool_result"
                                                    ) {
                                                        const result =
                                                            imageToolResult(
                                                                message,
                                                            );
                                                        return result ? (
                                                            <ImageToolResult
                                                                key={message.id}
                                                                url={result.url}
                                                                title={
                                                                    result.title
                                                                }
                                                            />
                                                        ) : null;
                                                    }
                                                    if (message.kind === "plan")
                                                        return (
                                                            <PlanCard
                                                                key={message.id}
                                                                items={
                                                                    parseToolPayload(
                                                                        message.content,
                                                                    )
                                                                }
                                                            />
                                                        );
                                                    if (
                                                        message.kind ===
                                                            "answer" ||
                                                        message.kind ===
                                                            "message"
                                                    ) {
                                                        if (
                                                            containsResultUrl(
                                                                message.content,
                                                                historicalImageUrls,
                                                            )
                                                        )
                                                            return null;
                                                        return (
                                                            <AgentConversationMessage
                                                                key={message.id}
                                                                role="assistant"
                                                                content={
                                                                    message.content
                                                                }
                                                                imageUrls={
                                                                    historicalImageUrls
                                                                }
                                                            />
                                                        );
                                                    }
                                                    return null;
                                                })}
                                                {approvals.map((approval) => (
                                                    <AgentApprovalCard
                                                        key={`approval-${approval.id}`}
                                                        approval={approval}
                                                        deciding={
                                                            decidingApprovalId ===
                                                            approval.id
                                                        }
                                                        onDecision={
                                                            handleApprovalDecision
                                                        }
                                                    />
                                                ))}
                                                {steps.map((step, index) => {
                                                    if (step.type === "user")
                                                        return (
                                                            <AgentConversationMessage
                                                                key={`live-${index}`}
                                                                role="user"
                                                                content={
                                                                    step.content
                                                                }
                                                                attachments={
                                                                    step.attachments
                                                                }
                                                            />
                                                        );
                                                    if (step.type === "thought")
                                                        return (
                                                            <AgentThoughtCard
                                                                key={`live-${index}`}
                                                                content={
                                                                    step.content
                                                                }
                                                            />
                                                        );
                                                    if (step.type === "plan")
                                                        return (
                                                            <PlanCard
                                                                key={`live-${index}`}
                                                                items={
                                                                    step.items
                                                                }
                                                            />
                                                        );
                                                    if (
                                                        step.type ===
                                                        "reflection"
                                                    )
                                                        return (
                                                            <SelfCheckCard
                                                                key={`live-${index}`}
                                                                content={
                                                                    step.content
                                                                }
                                                                round={
                                                                    step.round
                                                                }
                                                            />
                                                        );
                                                    if (step.type === "trace") {
                                                        return (
                                                            <AgentTraceCard
                                                                key={`live-${index}`}
                                                                trace={step}
                                                            />
                                                        );
                                                    }
                                                    if (
                                                        step.type === "artifact"
                                                    ) {
                                                        return (
                                                            <ArtifactMessage
                                                                key={`live-${index}`}
                                                                message={step}
                                                            />
                                                        );
                                                    }
                                                    if (step.type === "quiz") {
                                                        return (
                                                            <QuizMessage
                                                                key={`live-${index}`}
                                                                message={step}
                                                                onSubmit={
                                                                    handleQuizSubmit
                                                                }
                                                            />
                                                        );
                                                    }
                                                    if (step.type === "tool") {
                                                        const result =
                                                            liveImageStepResult(
                                                                step,
                                                            );
                                                        return result ? (
                                                            <ImageToolResult
                                                                key={`live-${index}`}
                                                                url={result.url}
                                                                title={
                                                                    result.title
                                                                }
                                                            />
                                                        ) : null;
                                                    }
                                                    if (
                                                        step.type ===
                                                            "answer" ||
                                                        step.type ===
                                                            "answer_delta"
                                                    ) {
                                                        if (
                                                            containsResultUrl(
                                                                step.content,
                                                                liveImageUrls,
                                                            )
                                                        )
                                                            return null;
                                                        return (
                                                            <AgentConversationMessage
                                                                key={`live-${index}`}
                                                                role="assistant"
                                                                content={
                                                                    step.content
                                                                }
                                                                imageUrls={
                                                                    liveImageUrls
                                                                }
                                                                isStreaming={
                                                                    step.type ===
                                                                    "answer_delta"
                                                                }
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
                                                                <span className="truncate">
                                                                    {
                                                                        step.message
                                                                    }
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                                {activeImageGeneration ? (
                                                    <ImageToolProgressPanel
                                                        message={
                                                            activeImageGeneration.message
                                                        }
                                                    />
                                                ) : null}
                                                {(isActive ||
                                                    creating ||
                                                    (loading &&
                                                        steps.length > 0)) &&
                                                    !streamingAnswer &&
                                                    !activeImageGeneration && (
                                                        <ThinkingIndicator
                                                            label={t(
                                                                "blog.agentChat.thinking",
                                                            )}
                                                        />
                                                    )}
                                                {(reconnecting ||
                                                    errorMessage) && (
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
                                                            {errorMessage ||
                                                                statusLine}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    ref={chatEndRef}
                                                    className="h-2"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="shrink-0 bg-gradient-to-t from-canvas via-canvas/80 to-transparent pt-4">
                                        <AgentChatInputBar
                                            t={t}
                                            input={input}
                                            setInput={setInput}
                                            attachments={attachments}
                                            uploading={uploadingAttachments}
                                            isActive={isActive}
                                            awaitingApproval={awaitingApproval}
                                            creating={creating}
                                            hasConversation={true}
                                            onFilesSelected={
                                                handleFilesSelected
                                            }
                                            onRemoveAttachment={
                                                handleRemoveAttachment
                                            }
                                            onSubmit={handleSubmit}
                                            onStop={handleStop}
                                            deepThinking={deepThinking}
                                            onToggleDeepThinking={() =>
                                                setDeepThinking(
                                                    (current) => !current,
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </section>

                {showArtifact && !isMobile && (
                    <aside className="hidden min-h-0 w-[52%] border-l border-border lg:block">
                        {artifactPanel}
                    </aside>
                )}

                {showArtifact && isMobile && (
                    <div className="absolute inset-0 z-30 bg-canvas">
                        {artifactPanel}
                    </div>
                )}
            </div>

            <ProfileModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />

            {/* Search Modal */}
            {searchOpen && (
                <div className="absolute inset-0 z-50 flex items-start justify-center bg-ink/40 pt-[15vh]">
                    <div
                        ref={searchModalRef}
                        className="w-full max-w-lg rounded-2xl border border-border bg-canvas shadow-2xl"
                    >
                        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                            <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="搜索会话..."
                                autoFocus
                                className="min-h-[40px] min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-faint"
                            />
                            <button
                                type="button"
                                onClick={closeSearchModal}
                                className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto p-2">
                            <div className="px-2 py-1.5 text-xs font-semibold text-ink-muted">
                                最近聊天
                            </div>
                            {filteredSessions.length > 0 ? (
                                filteredSessions.map((session) => (
                                    <button
                                        key={session.id}
                                        type="button"
                                        onClick={() => {
                                            closeSearchModal();
                                            // 从图片画廊里搜到会话时也要切回对话视图，否则会停在画廊上看旧图。
                                            setView("chat");
                                            navigate(
                                                `/workspace/agent/${session.id}`,
                                            );
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted"
                                    >
                                        <MessageSquareText className="h-4 w-4 shrink-0 text-ink-muted" />
                                        <span className="truncate">
                                            {session.title ||
                                                t("blog.agent.untitled")}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-ink-muted">
                                    {searchQuery
                                        ? "没有找到匹配的会话"
                                        : "暂无会话记录"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentChat;
