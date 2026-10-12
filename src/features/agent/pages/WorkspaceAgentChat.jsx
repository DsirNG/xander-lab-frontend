import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    useNavigate,
    useOutletContext,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain, FileText, PanelRightOpen } from "lucide-react";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import { workspaceOutputs } from "../utils/workspaceOutputs";
import useAgentArtifact from "../hooks/useAgentArtifact";
import AgentApprovalCard from "../components/AgentApprovalCard";
import AgentArtifactPanel from "../components/AgentArtifactPanel";
import { useToast } from "@shared/hooks/useToast";
import Modal from "@shared/ui/overlays/Modal";
import { useAuthSession } from "@features/auth";
import useAgentAttachments from "../hooks/useAgentAttachments";
import useAgentQueryBootstrap from "../hooks/useAgentQueryBootstrap";
import AgentComposer from "../components/AgentComposer";
import WorkspaceAgentLibraryView from "../components/WorkspaceAgentLibraryView";
import AgentConversationTimeline from "../components/AgentConversationTimeline";
import WorkspaceAgentConversationMessage, {
    WorkspaceAgentThoughtCard,
} from "../components/WorkspaceAgentConversationMessage";
import WorkspaceAgentSkeleton from "../components/WorkspaceAgentSkeleton";
import WorkspaceAgentWelcome from "../components/WorkspaceAgentWelcome";
import { mergeLiveTraces, mergeToolTraces } from "../components/agentTrace";
import {
    imageUrlsFromMessages,
    imageUrlsFromSteps,
} from "../components/imageResult";
import {
    getActiveImageGeneration,
    hasStreamingAnswer,
} from "../utils/conversationState";

const WorkspaceAgentChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const agent = useOutletContext();
    const { plugins = [] } = agent;
    const { conversationId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const blogTaskId = searchParams.get("blogTaskId");
    const workspaceView = ["writing", "documents", "memory"].includes(
        searchParams.get("view"),
    )
        ? searchParams.get("view")
        : "chat";
    const reduceMotion = useReducedMotion();
    const toast = useToast();
    const artifact = useAgentArtifact({
        stayInWorkspace: true,
        blogTaskId,
        navigate,
        searchParams,
        setSearchParams,
        t,
        toast,
    });
    const queryParam = searchParams.get("q");
    const { userInfo } = useAuthSession();

    const displayName =
        userInfo?.nickname || userInfo?.username || "XanderDING";

    const [input, setInput] = useState("");
    const [previewPlugin, setPreviewPlugin] = useState(null);
    const [articleEditing, setArticleEditing] = useState(false);
    const [memoryOpen, setMemoryOpen] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);
    const [publishPlatform, setPublishPlatform] = useState("csdn");
    const [filePreview, setFilePreview] = useState(null);
    const [draggingFile, setDraggingFile] = useState(false);

    const {
        attachments,
        uploadingAttachments,
        handleFilesSelected,
        handleRemoveAttachment,
        clearAttachments,
    } = useAgentAttachments({ t, toast });

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const chatEndRef = useRef(null);
    const chatScrollRef = useRef(null);
    const stickToBottomRef = useRef(true);

    const {
        conversation,
        messages,
        workspaceResults = [],
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
    } = agent;

    useEffect(() => {
        setArticleEditing(false);
        setMemoryOpen(false);
        setPublishOpen(false);
        setFilePreview(null);
    }, [conversationId]);

    const isActive = running || conversation?.status === "running";
    const awaitingApproval = conversation?.status === "awaiting_approval";
    const locked = isActive || awaitingApproval || creating;

    const outputs = useMemo(
        () => workspaceOutputs(messages, workspaceResults, liveSteps),
        [messages, workspaceResults, liveSteps],
    );
    const contextFiles = useMemo(() => {
        const files = new Map();
        for (const file of [
            ...messages.flatMap((message) => message.attachments || []),
            ...attachments,
        ]) {
            if (file?.url) files.set(file.url, file);
        }
        return [...files.values()];
    }, [messages, attachments]);

    useEffect(() => {
        const taskId = outputs.article?.taskId;
        if (
            !taskId ||
            articleEditing ||
            blogTaskId === taskId ||
            searchParams.get("closedTaskId") === taskId
        )
            return;
        const next = new URLSearchParams(searchParams);
        next.set("blogTaskId", taskId);
        if (searchParams.get("closedTaskId") !== taskId)
            next.delete("draftPostId");
        next.delete("closedTaskId");
        setSearchParams(next, { replace: true });
    }, [
        articleEditing,
        blogTaskId,
        outputs.article?.taskId,
        searchParams,
        setSearchParams,
    ]);

    const reopenArticle = () => {
        if (!outputs.article?.taskId) return;
        const next = new URLSearchParams(searchParams);
        next.set("blogTaskId", outputs.article.taskId);
        next.delete("closedTaskId");
        setSearchParams(next, { replace: true });
    };

    const usePreviewPlugin = () => {
        if (!previewPlugin) return;
        setInput(
            `${input}${input && !input.endsWith(" ") ? " " : ""}@${previewPlugin.key} `,
        );
        setPreviewPlugin(null);
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

    // 同一次工具调用的 start/progress/delta/end 先合成一条轨迹，收口后仍能展开回看。
    const steps = useMemo(() => mergeLiveTraces(liveSteps), [liveSteps]);

    /** 持久化消息同样先归并 tool_call / tool_result，刷新后细节不丢。 */
    const timeline = useMemo(() => mergeToolTraces(messages), [messages]);

    const streamingAnswer = useMemo(() => hasStreamingAnswer(steps), [steps]);
    const activeImageGeneration = useMemo(
        () => getActiveImageGeneration(steps),
        [steps],
    );

    const historicalImageUrls = useMemo(
        () => imageUrlsFromMessages(messages),
        [messages],
    );

    const liveImageUrls = useMemo(() => imageUrlsFromSteps(steps), [steps]);

    useEffect(() => {
        if (stickToBottomRef.current)
            chatEndRef.current?.scrollIntoView({
                behavior: "auto",
                block: "end",
            });
    }, [approvals, messages, steps]);

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
                    navigate(`/app/${detail.conversation.id}`, {
                        replace: true,
                    });
                    setInput("");
                    clearAttachments();
                } catch (error) {
                    toast.error(
                        error.message || t("blog.agentChat.sendFailed"),
                    );
                }
                return;
            }
            setInput("");
            clearAttachments();
            await sendMessage(trimmed, { attachments: selectedAttachments });
        },
        [
            clearAttachments,
            conversationId,
            createConversation,
            navigate,
            sendMessage,
            t,
            toast,
        ],
    );

    const handleSubmit = async () => {
        if (!input.trim() && attachments.length === 0) {
            toast.warning(t("blog.agentChat.inputRequired"));
            return;
        }
        await submitText(input, attachments);
    };

    const chooseWorkspacePrompt = (prompt) => {
        setInput(prompt);
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

    const askAboutFile = (file) => {
        chooseWorkspacePrompt(
            t("workspace.agent.fileQuestionPrompt", { name: file.name }),
        );
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.delete("view");
            return next;
        });
    };

    const deleteMemory = async (memory) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.delete("view");
            return next;
        });
        await submitText(
            t("workspace.agent.deleteMemoryPrompt", {
                key: memory.memoryKey,
            }),
        );
    };

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

    useAgentQueryBootstrap({
        conversationId,
        creating,
        queryParam,
        searchParams,
        setInput,
        setSearchParams,
        submitText,
        t,
        toast,
    });

    const canSend =
        Boolean(input.trim() || attachments.length) && !uploadingAttachments;

    return (
        <div
            className="relative flex h-full w-full min-w-0 overflow-hidden bg-surface-muted"
            onDragOver={(event) => {
                if (
                    locked ||
                    uploadingAttachments ||
                    !event.dataTransfer.types.includes("Files")
                )
                    return;
                event.preventDefault();
                setDraggingFile(true);
            }}
            onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                    setDraggingFile(false);
            }}
            onDrop={(event) => {
                event.preventDefault();
                setDraggingFile(false);
                if (!locked && !uploadingAttachments)
                    handleFilesSelected(Array.from(event.dataTransfer.files));
            }}
        >
            {/* Main Chat Content Area */}
            <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-canvas">
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-5 sm:px-8">
                    <span className="text-caption font-medium text-ink-muted">
                        {workspaceView === "writing"
                            ? t("workspace.agent.nav.writing")
                            : workspaceView === "documents"
                              ? t("workspace.agent.nav.documents")
                              : workspaceView === "memory"
                                ? t("workspace.agent.nav.memory")
                                : t("workspace.agent.workspaceTitle")}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                        {outputs.memories.length ? (
                            <button
                                type="button"
                                onClick={() => setMemoryOpen(true)}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-caption text-ink-muted hover:bg-surface-muted"
                            >
                                <Brain className="h-3.5 w-3.5" />
                                {t("workspace.agent.memoryReferenced")}
                            </button>
                        ) : null}
                        {outputs.publications.length ||
                        approvals.some(
                            (approval) => approval.toolName === "publish_post",
                        ) ? (
                            <button
                                type="button"
                                onClick={() => setPublishOpen(true)}
                                className="rounded-lg px-2 py-1.5 text-caption text-ink-muted hover:bg-surface-muted"
                            >
                                {t("workspace.agent.publishChannels")}
                            </button>
                        ) : null}
                        {outputs.article && !blogTaskId ? (
                            <button
                                type="button"
                                onClick={reopenArticle}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-caption text-ink-secondary hover:bg-surface-muted"
                            >
                                <PanelRightOpen className="h-3.5 w-3.5" />
                                {t("blog.agent.article")}
                            </button>
                        ) : null}
                    </div>
                </header>

                {contextFiles.length && workspaceView === "chat" ? (
                    <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-border/60 px-5 py-2 sm:px-8">
                        {contextFiles.map((file) => (
                            <button
                                key={file.url}
                                type="button"
                                onClick={() => setFilePreview(file)}
                                className="flex max-w-56 shrink-0 items-center gap-2 rounded-lg bg-surface-muted px-3 py-1.5 text-caption text-ink-secondary"
                            >
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{file.name}</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                {["writing", "documents", "memory"].includes(
                    workspaceView,
                ) ? (
                    <>
                        <WorkspaceAgentLibraryView
                            view={workspaceView}
                            files={contextFiles}
                            memories={outputs.memories}
                            locked={locked}
                            fileInputRef={fileInputRef}
                            onChoosePrompt={chooseWorkspacePrompt}
                            onOpenFile={setFilePreview}
                            onAskFile={askAboutFile}
                            onCorrectMemory={(memory) =>
                                chooseWorkspacePrompt(
                                    t(
                                        "workspace.agent.correctMemoryPrompt",
                                        {
                                            key: memory.memoryKey,
                                            content: memory.content,
                                        },
                                    ),
                                )
                            }
                            onDeleteMemory={deleteMemory}
                            onRecallMemory={() =>
                                chooseWorkspacePrompt(
                                    t("workspace.agent.nav.recallMemoryPrompt"),
                                )
                            }
                        />
                        <div className="shrink-0 border-t border-border/60 bg-canvas p-4">
                            <div className="mx-auto w-full max-w-3xl">
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
                                    onInputChange={setInput}
                                    onFilesSelected={handleFilesSelected}
                                    onRemoveAttachment={handleRemoveAttachment}
                                    onSubmit={handleSubmit}
                                    onCancel={cancelTurn}
                                    deepThinking={deepThinking}
                                    onToggleDeepThinking={() =>
                                        setDeepThinking((current) => !current)
                                    }
                                    plugins={plugins}
                                    onPluginPreview={setPreviewPlugin}
                                    t={t}
                                />
                            </div>
                        </div>
                    </>
                ) : messages.length === 0 &&
                steps.length === 0 &&
                approvals.length === 0 &&
                !loading ? (
                    <WorkspaceAgentWelcome
                        displayName={displayName}
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
                        onRemoveAttachment={handleRemoveAttachment}
                        onSubmit={handleSubmit}
                        onCancel={cancelTurn}
                        deepThinking={deepThinking}
                        onToggleDeepThinking={() =>
                            setDeepThinking((current) => !current)
                        }
                        plugins={plugins}
                        onPluginPreview={setPreviewPlugin}
                    />
                ) : (
                    /* Active Chat Stream State */
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
                            statusLine={t("blog.agentChat.reconnecting")}
                            t={t}
                            messageComponent={WorkspaceAgentConversationMessage}
                            thoughtComponent={WorkspaceAgentThoughtCard}
                            loadingContent={<WorkspaceAgentSkeleton />}
                            scrollClassName="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 sm:px-8"
                        />

                        {/* Bottom Input Bar for Active Chat */}
                        <div className="shrink-0 border-t border-border/60 bg-canvas p-4">
                            <div className="mx-auto w-full max-w-3xl">
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
                                    onInputChange={setInput}
                                    onFilesSelected={handleFilesSelected}
                                    onRemoveAttachment={handleRemoveAttachment}
                                    onSubmit={handleSubmit}
                                    onCancel={cancelTurn}
                                    deepThinking={deepThinking}
                                    onToggleDeepThinking={() =>
                                        setDeepThinking((current) => !current)
                                    }
                                    plugins={plugins}
                                    onPluginPreview={setPreviewPlugin}
                                    t={t}
                                />
                                <div className="mt-1.5 text-center text-micro text-ink-faint">
                                    {t(
                                        "blog.agentChat.multiTurnHint",
                                        "DinQor 也会犯错，请注意甄别。",
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <AnimatePresence>
                {blogTaskId ? (
                    <motion.aside
                        key={blogTaskId}
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
                        transition={{ duration: reduceMotion ? 0 : 0.22 }}
                        aria-label={t("blog.agent.article")}
                        className="absolute inset-0 z-20 min-h-0 border-l border-border bg-canvas lg:relative lg:inset-auto lg:w-[48%] lg:shrink-0"
                    >
                        <AgentArtifactPanel
                            editable
                            onEditingChange={setArticleEditing}
                            loading={artifact.artifactLoading}
                            error={artifact.artifactError}
                            taskData={artifact.artifactData}
                            selectedVersionId={artifact.selectedVersionId}
                            isPublishing={locked}
                            isSavingDraft={artifact.isSavingDraft}
                            onPublish={() => setPublishOpen(true)}
                            onCreateDraft={artifact.handleCreateArtifactDraft}
                            onViewPublished={() => setPublishOpen(true)}
                            onSelectVersion={artifact.setSelectedVersionId}
                            onClose={artifact.handleCloseArtifact}
                        />
                    </motion.aside>
                ) : null}
            </AnimatePresence>
            {draggingFile ? (
                <div className="pointer-events-none absolute inset-3 z-40 grid place-items-center rounded-2xl border-2 border-dashed border-border-strong bg-canvas/95 text-title text-ink">
                    {t("workspace.agent.dropFile")}
                </div>
            ) : null}
            <Modal
                isOpen={memoryOpen}
                onClose={() => setMemoryOpen(false)}
                title={t("workspace.agent.memoryReferenced")}
                width="max-w-xl"
            >
                <div className="space-y-4">
                    <div className="text-caption leading-6 text-ink-muted">
                        {t("workspace.agent.memorySourceHint")}
                    </div>
                    {outputs.memories.map((memory) => (
                        <div
                            key={memory.memoryKey}
                            className="border-b border-border pb-4"
                        >
                            <div className="text-caption font-semibold text-ink">
                                {memory.memoryKey}
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-body text-ink-secondary">
                                {memory.content}
                            </div>
                            <div className="mt-2 text-micro text-ink-muted">
                                {memory.updatedAt}
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    disabled={locked}
                                    onClick={() => {
                                        setInput(
                                            t(
                                                "workspace.agent.correctMemoryPrompt",
                                                {
                                                    key: memory.memoryKey,
                                                    content: memory.content,
                                                },
                                            ),
                                        );
                                        setMemoryOpen(false);
                                        requestAnimationFrame(() =>
                                            textareaRef.current?.focus(),
                                        );
                                    }}
                                    className="rounded-lg border border-border px-3 py-1.5 text-caption text-ink"
                                >
                                    {t("blog.edit")}
                                </button>
                                <button
                                    type="button"
                                    disabled={locked}
                                    onClick={async () => {
                                        setMemoryOpen(false);
                                        await submitText(
                                            t(
                                                "workspace.agent.deleteMemoryPrompt",
                                                { key: memory.memoryKey },
                                            ),
                                        );
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-caption text-ink-muted"
                                >
                                    {t("common.delete")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
            <Modal
                isOpen={publishOpen}
                onClose={() => setPublishOpen(false)}
                title={t("workspace.agent.publishChannels")}
                width="max-w-lg"
            >
                <div className="space-y-4">
                    <div className="text-body text-ink">
                        {artifact.artifactData?.task?.title}
                    </div>
                    <div className="text-caption leading-6 text-ink-muted">
                        {t("workspace.agent.publishApprovalHint")}
                    </div>
                    <CustomSelect
                        value={publishPlatform}
                        onChange={setPublishPlatform}
                        options={[
                            { value: "csdn", label: "CSDN" },
                            {
                                value: "juejin",
                                label: t("workspace.agent.juejinPlatform"),
                            },
                        ]}
                    />
                    <button
                        type="button"
                        disabled={locked || !artifact.draftPostId}
                        onClick={async () => {
                            const postId = artifact.draftPostId;
                            setPublishOpen(false);
                            await submitText(
                                t("workspace.agent.publishPrompt", {
                                    postId,
                                    title:
                                        artifact.artifactData?.task?.title ||
                                        "",
                                    platform:
                                        publishPlatform === "juejin"
                                            ? t(
                                                  "workspace.agent.juejinPlatform",
                                              )
                                            : "CSDN",
                                }),
                            );
                        }}
                        className="rounded-lg bg-ink px-4 py-2 text-caption font-semibold text-white disabled:opacity-50"
                    >
                        {t("workspace.agent.requestPublish")}
                    </button>
                    {approvals
                        .filter(
                            (approval) => approval.toolName === "publish_post",
                        )
                        .map((approval) => (
                            <AgentApprovalCard
                                key={approval.id}
                                approval={approval}
                                deciding={decidingApprovalId === approval.id}
                                onDecision={handleApprovalDecision}
                            />
                        ))}
                    {outputs.publications.map((result, index) => (
                        <div
                            key={index}
                            className="border-t border-border pt-3 text-caption text-ink-secondary"
                        >
                            <div>
                                {result.platform ||
                                    t("workspace.agent.publishChannels")}{" "}
                                ·{" "}
                                {result.ok
                                    ? t("workspace.agent.publicationSucceeded")
                                    : result.outcomeUnknown
                                      ? t("blog.publishStatusUnknown")
                                      : t("blog.agent.failed")}
                            </div>
                            {result.error ? (
                                <div className="mt-2 text-caption leading-6 text-ink-muted">
                                    {result.error}
                                </div>
                            ) : null}
                            {typeof result.url === "string" &&
                            /^https?:\/\//.test(result.url) ? (
                                <a
                                    className="mt-2 inline-block underline"
                                    href={result.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t("blog.agent.viewArticle")}
                                </a>
                            ) : null}
                        </div>
                    ))}
                </div>
            </Modal>
            <Modal
                isOpen={Boolean(filePreview)}
                onClose={() => setFilePreview(null)}
                title={
                    filePreview?.name ||
                    t("workspace.agent.actions.analyzeDocument")
                }
                width="max-w-3xl"
            >
                {filePreview ? (
                    <div className="space-y-4">
                        <div className="text-caption leading-6 text-ink-muted">
                            {t("workspace.agent.fileContextHint")}
                        </div>
                        {filePreview.contentType?.startsWith("image/") ? (
                            <img
                                src={filePreview.url}
                                alt={filePreview.name}
                                className="max-h-80 w-full object-contain"
                            />
                        ) : (
                            <div className="flex items-center gap-3 rounded-xl border border-border p-5">
                                <FileText className="h-6 w-6 text-ink-muted" />
                                <span className="text-body text-ink">
                                    {filePreview.name}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={filePreview.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-border px-3 py-2 text-caption text-ink"
                            >
                                {t("workspace.agent.openFile")}
                            </a>
                            <button
                                type="button"
                                disabled={locked}
                                onClick={() => {
                                    setInput(
                                        t(
                                            "workspace.agent.fileQuestionPrompt",
                                            { name: filePreview.name },
                                        ),
                                    );
                                    setFilePreview(null);
                                    requestAnimationFrame(() =>
                                        textareaRef.current?.focus(),
                                    );
                                }}
                                className="rounded-lg bg-ink px-3 py-2 text-caption text-white"
                            >
                                {t("workspace.agent.askFile")}
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
            <Modal
                isOpen={Boolean(previewPlugin)}
                onClose={() => setPreviewPlugin(null)}
                title={
                    previewPlugin?.name || t("workspace.pluginsPage.preview")
                }
                width="max-w-xl"
                footer={
                    <button
                        type="button"
                        onClick={usePreviewPlugin}
                        className="rounded-lg bg-ink px-4 py-2 text-caption font-semibold text-white"
                    >
                        {t("workspace.pluginsPage.usePlugin")}
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="text-micro font-semibold uppercase tracking-[0.12em] text-accent">
                        {previewPlugin?.type === "mcp" ? "MCP" : "Skill"}
                        {previewPlugin?.key ? ` @${previewPlugin.key}` : ""}
                    </div>
                    <p className="text-body leading-6 text-ink">
                        {previewPlugin?.description ||
                            t("workspace.pluginsPage.emptyHint")}
                    </p>
                    {previewPlugin?.instructions ? (
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-4 text-caption leading-6 text-ink-secondary">
                            {previewPlugin.instructions}
                        </pre>
                    ) : null}
                </div>
            </Modal>
        </div>
    );
};

export default WorkspaceAgentChat;
