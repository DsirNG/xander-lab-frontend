import { useCallback, useEffect, useRef, useState } from "react";
import {
    getBlogAgentTask,
    publishBlogAgentTask,
    getArticleDraft,
    saveArticleDraft,
} from "@features/blog";

/**
 * Owns the optional blog artifact side panel attached to an agent conversation.
 * The page composes the panel with the conversation layout only.
 */
const useAgentArtifact = ({
    blogTaskId,
    stayInWorkspace = false,
    navigate,
    searchParams,
    setSearchParams,
    t,
    toast,
}) => {
    const draftPostId = stayInWorkspace
        ? searchParams.get("draftPostId")
        : null;
    const draftRequestRef = useRef(null);
    const savingRef = useRef(false);
    const activeTaskRef = useRef(blogTaskId);
    activeTaskRef.current = blogTaskId;
    const [artifactData, setArtifactData] = useState(null);
    const [artifactLoading, setArtifactLoading] = useState(false);
    const [artifactError, setArtifactError] = useState(null);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

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
        Promise.all([
            getBlogAgentTask(blogTaskId, {
                _silent: true,
                signal: controller.signal,
            }),
            draftPostId
                ? getArticleDraft(draftPostId, {
                      _silent: true,
                      signal: controller.signal,
                  })
                : Promise.resolve(null),
        ])
            .then(([data, saved]) => {
                if (saved)
                    data = {
                        ...data,
                        task: {
                            ...data.task,
                            ...saved,
                            status: "ready",
                            publishedPostId:
                                saved.status === 1 ? saved.id : null,
                        },
                        versions: [],
                        tags: saved.tags || [],
                    };
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
    }, [blogTaskId, draftPostId, t]);

    const handleCloseArtifact = useCallback(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("blogTaskId");
        if (stayInWorkspace && blogTaskId) next.set("closedTaskId", blogTaskId);
        setSearchParams(next, { replace: true });
    }, [blogTaskId, searchParams, setSearchParams, stayInWorkspace]);

    const handlePublishArtifact = useCallback(async () => {
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
    }, [blogTaskId, t, toast]);

    const handleCreateArtifactDraft = useCallback(
        async (editedDraft) => {
            const task = artifactData?.task;
            if (!task || savingRef.current) return false;
            savingRef.current = true;
            const sourceTaskId = blogTaskId;
            const version = artifactData?.versions?.find(
                (item) => String(item.id) === String(selectedVersionId),
            );
            setIsSavingDraft(true);
            try {
                const payload = {
                    title:
                        typeof editedDraft?.title === "string"
                            ? editedDraft.title
                            : version?.title || task.title,
                    summary:
                        typeof editedDraft?.summary === "string"
                            ? editedDraft.summary
                            : version?.summary || task.summary,
                    content:
                        typeof editedDraft?.content === "string"
                            ? editedDraft.content
                            : version?.content || task.content,
                    categoryId: String(
                        editedDraft?.categoryId || task.categoryId || "",
                    ),
                    tags: (editedDraft?.tags || artifactData.tags || [])
                        .map((tag) =>
                            typeof tag === "string" ? tag : tag.name,
                        )
                        .filter(Boolean),
                };
                if (stayInWorkspace) {
                    if (
                        !payload.title?.trim() ||
                        !payload.content?.trim() ||
                        !payload.categoryId
                    ) {
                        toast.warning(t("blog.fillRequired"));
                        return false;
                    }
                    // Repeated saves update the same owner-scoped article. No navigation
                    // to removed legacy routes, and edited content is never published implicitly.
                    const signature = JSON.stringify(payload);
                    if (
                        draftRequestRef.current?.signature !== signature ||
                        draftRequestRef.current?.taskId !== blogTaskId
                    ) {
                        draftRequestRef.current = {
                            signature,
                            taskId: blogTaskId,
                            key: globalThis.crypto.randomUUID(),
                        };
                    }
                    const saved = await saveArticleDraft(draftPostId, payload, {
                        _silent: true,
                        dedupe: false,
                        headers: {
                            "Idempotency-Key": draftRequestRef.current.key,
                        },
                    });
                    if (activeTaskRef.current !== sourceTaskId) return false;
                    const id = saved?.id || draftPostId;
                    if (!id) throw new Error(t("blog.saveDraftError"));
                    const next = new URLSearchParams(searchParams);
                    next.set("draftPostId", String(id));
                    setSearchParams(next, { replace: true });
                    setArtifactData((current) => ({
                        ...current,
                        task: {
                            ...current.task,
                            ...payload,
                            status: "ready",
                            publishedPostId: null,
                        },
                        versions: [],
                        tags: payload.tags,
                    }));
                    setSelectedVersionId(null);
                    toast.success(t("blog.saveDraftServerSuccess"));
                    return true;
                }
                localStorage.setItem(
                    "xander-lab:blog-publish-draft",
                    JSON.stringify(payload),
                );
                toast.success(t("blog.agent.draftCreated"));
                navigate("/workspace/publish");
                return true;
            } catch (error) {
                toast.error(error.message || t("blog.agent.failed"));
                return false;
            } finally {
                savingRef.current = false;
                setIsSavingDraft(false);
            }
        },
        [
            artifactData,
            blogTaskId,
            draftPostId,
            navigate,
            searchParams,
            setSearchParams,
            selectedVersionId,
            stayInWorkspace,
            t,
            toast,
        ],
    );

    const handleViewPublished = useCallback(() => {
        const publishedPostId = artifactData?.task?.publishedPostId;
        if (publishedPostId) navigate(`/blog/${publishedPostId}`);
    }, [artifactData, navigate]);

    return {
        artifactData,
        draftPostId,
        artifactLoading,
        artifactError,
        selectedVersionId,
        isPublishing,
        isSavingDraft,
        setSelectedVersionId,
        handleCloseArtifact,
        handlePublishArtifact,
        handleCreateArtifactDraft,
        handleViewPublished,
    };
};

export default useAgentArtifact;
