import { useEffect, useState } from "react";
import Modal from "@shared/ui/overlays/Modal";
import { useTranslation } from "react-i18next";
import { blogService } from "../../services/blogService";
import BlogMarkdown from "../BlogMarkdown";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";

const BlogPreviewModal = ({ postId, onClose }) => {
    const { t } = useTranslation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        if (!postId) return undefined;
        const controller = new AbortController();
        setPost(null);
        setLoading(true);
        setError(false);
        blogService
            .getMyBlogById(postId, { signal: controller.signal })
            .then((data) => {
                if (!controller.signal.aborted) setPost(data);
            })
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [postId]);
    if (!postId) return null;
    return (
        <Modal
            isOpen
            onClose={onClose}
            title={post?.title || t("profile.blogManage.preview")}
            width="max-w-5xl"
        >
            <div className="max-h-[70dvh] overflow-y-auto">
                {loading ? (
                    <LoadingSpinner
                        fullScreen={false}
                        text={t("common.loading")}
                    />
                ) : error ? (
                    <p className="py-10 text-center text-danger">
                        {t("profile.blogManage.loadError")}
                    </p>
                ) : post ? (
                    <BlogMarkdown content={post.content || ""} />
                ) : null}
            </div>
        </Modal>
    );
};

export default BlogPreviewModal;
