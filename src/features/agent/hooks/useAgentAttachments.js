import { useCallback, useState } from "react";
import { agentConversationService } from "../services/agentConversationService";

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

/**
 * Shared by the full-screen and workspace agent entry points.
 * Attachment rules are Agent-specific, so this remains inside the Feature.
 */
const useAgentAttachments = ({ t, toast }) => {
    const [attachments, setAttachments] = useState([]);
    const [uploadingAttachments, setUploadingAttachments] = useState(false);

    const handleFilesSelected = useCallback(
        async (files) => {
            const remaining = Math.max(
                0,
                MAX_ATTACHMENTS - attachments.length,
            );
            if (!remaining) {
                toast.warning(t("blog.agentChat.attachmentLimit"));
                return;
            }

            const selected = files.slice(0, remaining);
            if (files.length > remaining)
                toast.warning(t("blog.agentChat.attachmentLimit"));

            const valid = selected.filter((file) => {
                if (file.size <= MAX_ATTACHMENT_SIZE_BYTES) return true;
                toast.warning(
                    t("blog.agentChat.attachmentTooLarge", {
                        name: file.name,
                    }),
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
                        [...current, ...uploaded].slice(0, MAX_ATTACHMENTS),
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

    const clearAttachments = useCallback(() => setAttachments([]), []);

    return {
        attachments,
        uploadingAttachments,
        handleFilesSelected,
        handleRemoveAttachment,
        clearAttachments,
    };
};

export default useAgentAttachments;
