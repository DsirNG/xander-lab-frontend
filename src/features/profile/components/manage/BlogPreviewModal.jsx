import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { blogService } from '@features/blog/services/blogService';
import BlogMarkdown from '@features/blog/components/BlogMarkdown';
import LoadingSpinner from '@components/common/LoadingSpinner';

const BlogPreviewModal = ({ postId, onClose }) => {
    const { t } = useTranslation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!postId) return;
        
        let isMounted = true;
        setLoading(true);
        setError(false);

        blogService.getMyBlogById(postId)
            .then(data => {
                if (isMounted) setPost(data);
            })
            .catch(() => {
                if (isMounted) setError(true);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [postId]);

    if (!postId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 shrink-0">
                    <h2 className="text-lg font-bold text-ink truncate">
                        {post?.title || (loading ? t('common.loading', '加载中...') : t('profile.blogManage.preview', '文章预览'))}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-surface">
                    <div className="mx-auto max-w-3xl bg-white rounded-[20px] p-6 md:p-12 shadow-sm min-h-full">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : error || !post ? (
                            <div className="flex h-64 items-center justify-center text-danger">
                                {t('profile.blogManage.loadError', '加载失败，请重试')}
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-3xl font-bold text-ink mb-6">{post.title}</h1>
                                {post.summary && (
                                    <div className="mb-8 rounded-lg bg-surface-muted/50 p-4 text-sm text-ink-secondary leading-relaxed border-l-4 border-accent">
                                        {post.summary}
                                    </div>
                                )}
                                <div className="prose prose-slate max-w-none prose-headings:text-ink prose-a:text-accent">
                                    <BlogMarkdown content={post.content || ''} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPreviewModal;
