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
    ShieldAlert,
} from "lucide-react";
import { useToast } from "@shared/hooks/useToast";
import {
    getBlogAgentTask,
    publishBlogAgentTask,
} from "@features/blog";
import useIsMobile from "@shared/hooks/useIsMobile";
import { useAgentConversation } from "../hooks/useAgentConversation";
import {
    agentConversationService,
} from "../services/agentConversationService";
import AgentSessionSearchModal from "../components/AgentSessionSearchModal";
import AgentArtifactPanel from "../components/AgentArtifactPanel";
import AgentChatSidebar from "../components/AgentChatSidebar";
import AgentChatHeader from "../components/AgentChatHeader";
import AgentChatEmptyState from "../components/AgentChatEmptyState";
import AgentChatInputBar from "../components/AgentChatInputBar";
import AgentConversationTimeline from "../components/AgentConversationTimeline";
import ImageToolResult from "../components/ImageToolResult";
import {
    ArtifactMessage,
    ImageToolProgressPanel,
    PlanCard,
    QuizMessage,
    ThinkingIndicator,
} from "../components/AgentMessageParts";
import { mergeLiveTraces, mergeToolTraces } from "../components/agentTrace";
import {
    imageUrlsFromMessages,
    imageUrlsFromSteps,
} from "../components/imageResult";
import {
    getActiveImageGeneration,
    hasStreamingAnswer,
} from "../utils/conversationState";
import AgentImagesPage from "./AgentImagesPage";
import { ProfileModal } from "@features/profile";
import { useAuthSession } from "@features/auth";

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
    const [settingsOpen, setSettingsOpen] = useState(false);
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

    const streamingAnswer = useMemo(() => hasStreamingAnswer(steps), [steps]);
    const activeImageGeneration = useMemo(
        () => getActiveImageGeneration(steps),
        [steps],
    );

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

    const navigationLocked = loading || creating;

    const statusLine = useMemo(() => {
        if (reconnecting) return t("blog.agentChat.reconnecting");
        if (isActive) return t("blog.agentChat.running");
        if (conversation?.status === "failed")
            return conversation.errorMessage || t("blog.agentChat.failed");
        return t("blog.agentChat.ready");
    }, [reconnecting, isActive, conversation, t]);

    const showArtifact = Boolean(blogTaskId);
    const artifactPanel = (
        <AgentArtifactPanel
            loading={artifactLoading}
            error={artifactError}
            taskData={artifactData}
            selectedVersionId={selectedVersionId}
            isPublishing={isPublishing}
            isSavingDraft={isSavingDraft}
            onPublish={handlePublishArtifact}
            onCreateDraft={handleCreateArtifactDraft}
            onViewPublished={() => {
                const publishedPostId = artifactData?.task?.publishedPostId;
                if (publishedPostId) navigate(`/blog/${publishedPostId}`);
            }}
            onSelectVersion={setSelectedVersionId}
            onClose={handleCloseArtifact}
        />
    );

    return (
        <div className="flex h-dvh flex-col bg-[#fcfcfc] font-chat text-ink">
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                <AgentChatSidebar
                    collapsed={sidebarCollapsed}
                    mobileOpen={mobileSessionsOpen}
                    sessions={sessions}
                    activeId={conversationId}
                    loading={sessionsLoading}
                    disableNew={navigationLocked}
                    imagesActive={view === "images"}
                    newChatActive={view === "chat" && !conversationId}
                    displayName={displayName}
                    avatarText={avatarText}
                    avatar={avatar}
                    onSelect={(id) => {
                        setView("chat");
                        navigate(`/workspace/agent/${id}`);
                    }}
                    onNew={handleNewConversation}
                    onCollapse={() => setSidebarCollapsed(true)}
                    onExpand={() => setSidebarCollapsed(false)}
                    onSearch={() => setSearchOpen(true)}
                    onImages={() => setView("images")}
                    onOpenSettings={() => setSettingsOpen(true)}
                    onMobileClose={() => setMobileSessionsOpen(false)}
                />

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
                            <AgentChatHeader
                                sidebarCollapsed={sidebarCollapsed}
                                avatarText={avatarText}
                                avatar={avatar}
                                displayName={displayName}
                                shareOpen={isShareOpen}
                                conversationId={conversationId}
                                shareLoading={shareLoading}
                                shareCopied={isShareCopied}
                                onOpenMobileSessions={() =>
                                    setMobileSessionsOpen(true)
                                }
                                onExpandSidebar={() =>
                                    setSidebarCollapsed(false)
                                }
                                onOpenSearch={() => setSearchOpen(true)}
                                onToggleShare={() =>
                                    setIsShareOpen((open) => !open)
                                }
                                onCloseShare={() => setIsShareOpen(false)}
                                onCopyShare={handleCopyShareLink}
                            />

                            {loading && messages.length > 0 && (
                                <div className="absolute top-14 left-0 right-0 z-10 h-0.5 overflow-hidden bg-border">
                                    <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
                                </div>
                            )}

                            {messages.length === 0 &&
                            steps.length === 0 &&
                            !loading ? (
                                <AgentChatEmptyState
                                    input={input}
                                    setInput={setInput}
                                    attachments={attachments}
                                    uploading={uploadingAttachments}
                                    isActive={isActive}
                                    creating={creating}
                                    onFilesSelected={handleFilesSelected}
                                    onRemoveAttachment={handleRemoveAttachment}
                                    onSubmit={handleSubmit}
                                    onStop={handleStop}
                                    deepThinking={deepThinking}
                                    onToggleDeepThinking={() =>
                                        setDeepThinking((current) => !current)
                                    }
                                />
                            ) : (
                                <>
                                    <AgentConversationTimeline
                                        chatScrollRef={chatScrollRef}
                                        stickToBottomRef={stickToBottomRef}
                                        chatEndRef={chatEndRef}
                                        loading={loading}
                                        creating={creating}
                                        running={running}
                                        steps={steps}
                                        messages={messages}
                                        timeline={timeline}
                                        approvals={approvals}
                                        decidingApprovalId={decidingApprovalId}
                                        handleApprovalDecision={handleApprovalDecision}
                                        handleQuizSubmit={handleQuizSubmit}
                                        historicalImageUrls={historicalImageUrls}
                                        liveImageUrls={liveImageUrls}
                                        activeImageGeneration={activeImageGeneration}
                                        isActive={isActive}
                                        streamingAnswer={streamingAnswer}
                                        reconnecting={reconnecting}
                                        errorMessage={errorMessage}
                                        statusLine={statusLine}
                                        t={t}
                                    />

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

            <AgentSessionSearchModal
                open={searchOpen}
                sessions={sessions}
                onClose={() => setSearchOpen(false)}
                onSelect={(id) => {
                    // 从图片画廊里搜到会话时也要切回对话视图，否则会停在画廊上看旧图。
                    setView("chat");
                    navigate(`/workspace/agent/${id}`);
                }}
            />
        </div>
    );
};

export default AgentChat;
