import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogService, BLOG_STATUS } from '../services/blogService';
import {
    ensurePublishRequestId, getPublishRequestId, clearPublishRequestId, saveDraft
} from '../services/publishStorage';

/**
 * 博客发布页提交逻辑：发布（幂等 + 结果轮询兜底）与保存草稿
 */
const usePublishSubmit = ({ formData, isEditMode, editId, toast, consumeDraft }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const buildPayload = useCallback((publish) => ({
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        categoryId: formData.categoryId,
        tags: formData.tags,
        publish,
    }), [formData]);

    const handlePublish = useCallback(async () => {
        if (!formData.title || !formData.content || !formData.categoryId) {
            toast.warning(t('blog.fillRequired'));
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await blogService.updateBlog(editId, buildPayload(true));
                await blogService.updateBlogStatus(editId, BLOG_STATUS.PUBLISHED);
                toast.success(t('blog.publishSuccess'));
                navigate('/profile');
                return;
            }

            const requestId = ensurePublishRequestId();
            await blogService.publishBlog(buildPayload(true), { headers: { 'Idempotency-Key': requestId }, timeout: 0 });
            clearPublishRequestId();
            consumeDraft();
            toast.success(t('blog.publishSuccess'));
            navigate('/blog/');
        } catch (err) {
            if (isEditMode) {
                toast.error(err.message || t('blog.publishError'));
                return;
            }
            const isUncertain = err.code === 'ECONNABORTED' || !err.response;
            if (isUncertain) {
                const requestId = getPublishRequestId();
                for (let attempt = 0; attempt < 5; attempt += 1) {
                    if (attempt) await new Promise((resolve) => setTimeout(resolve, 1000));
                    try {
                        const status = await blogService.getPublishStatus(requestId, { timeout: 5000, _silent: true, dedupe: false });
                        if (status.status === 'published') {
                            clearPublishRequestId();
                            consumeDraft();
                            toast.success(t('blog.publishSuccess'));
                            navigate('/blog/');
                            return;
                        }
                    } catch { /* keep checking until the confirmation window closes */ }
                }
                toast.warning(t('blog.publishStatusUnknown'));
            } else {
                toast.error(err.message || t('blog.publishError'));
            }
        } finally {
            setLoading(false);
        }
    }, [formData, isEditMode, editId, toast, consumeDraft, t, navigate, buildPayload]);

    const handleSaveDraft = useCallback(async () => {
        if (!formData.title || !formData.content || !formData.categoryId) {
            toast.warning(t('blog.fillRequired'));
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await blogService.updateBlog(editId, buildPayload(false));
                await blogService.updateBlogStatus(editId, BLOG_STATUS.DRAFT);
                toast.success(t('blog.saveDraftServerSuccess'));
                navigate('/profile');
                return;
            }

            await blogService.publishBlog(buildPayload(false));
            consumeDraft();
            toast.success(t('blog.saveDraftServerSuccess'));
            navigate('/profile');
        } catch (err) {
            if (!isEditMode) {
                if (saveDraft(formData)) {
                    toast.warning(t('blog.saveDraftLocalFallback'));
                    return;
                }
            }
            toast.error(err.message || t('blog.saveDraftError'));
        } finally {
            setLoading(false);
        }
    }, [formData, isEditMode, editId, toast, consumeDraft, t, navigate, buildPayload]);

    return { loading, handlePublish, handleSaveDraft };
};

export default usePublishSubmit;