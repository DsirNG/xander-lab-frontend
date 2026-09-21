import { useCallback, useEffect, useState } from "react";
import {
    getBlogAgentTask,
    publishBlogAgentTask,
} from "@features/blog";

/**
 * Owns the optional blog artifact side panel attached to an agent conversation.
 * The page composes the panel with the conversation layout only.
 */
const useAgentArtifact = ({
    blogTaskId,
    navigate,
    searchParams,
    setSearchParams,
    t,
    toast,
}) => {
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

    const handleCloseArtifact = useCallback(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("blogTaskId");
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

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

    const handleCreateArtifactDraft = useCallback(() => {
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
    }, [artifactData, navigate, selectedVersionId, t, toast]);

    const handleViewPublished = useCallback(() => {
        const publishedPostId = artifactData?.task?.publishedPostId;
        if (publishedPostId) navigate(`/blog/${publishedPostId}`);
    }, [artifactData, navigate]);

    return {
        artifactData,
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
