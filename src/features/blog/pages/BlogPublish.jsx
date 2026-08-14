import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublishHeader from '../components/PublishHeader';
import PublishSettings from '../components/PublishSettings';
import PublishEditor from '../components/PublishEditor';
import usePublishData from '../hooks/usePublishData';
import usePublishForm from '../hooks/usePublishForm';
import usePublishSubmit from '../hooks/usePublishSubmit';
import { useToast } from '@/hooks/useToast';
import useIsMobile from '@hooks/useIsMobile';
import LoadingSpinner from '@components/common/LoadingSpinner';

/**
 * 博客发布 / 编辑页面
 */
const BlogPublish = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const isEditMode = Boolean(editId);

    const [isPreview, setIsPreview] = useState(false);
    const isMobile = useIsMobile();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const toggleSettings = () => setIsSettingsOpen(prev => !prev);
    const editorRef = useRef(null);

    const { formData, setField, resetFromPost, setDefaultCategory, draftStatus, isDraftStatusVisible, consumeDraft } = usePublishForm({ isEditMode });

    const onDataReady = useCallback(({ post, formattedOptions, error }) => {
        if (error) {
            if (isEditMode) {
                toast.error(error.message || t('blog.articleNotFound'));
                navigate('/workspace/blog-manage', { replace: true });
            }
            return;
        }
        if (post) {
            resetFromPost(post);
            setDefaultCategory(formattedOptions?.[0]?.value);
        } else if (formattedOptions?.length > 0) {
            setDefaultCategory(formattedOptions[0].value);
        }
    }, [isEditMode, toast, navigate, t, resetFromPost, setDefaultCategory]);

    const { pageLoading, categories, availableTags } = usePublishData({ editId, isEditMode, onDataReady });

    const { loading, handlePublish, handleSaveDraft } = usePublishSubmit({ formData, isEditMode, editId, toast, consumeDraft });

    useEffect(() => {
        if (!isMobile) setIsSettingsOpen(false);
    }, [isMobile]);

    const handleBack = () => {
        if (window.history.state?.idx > 0) {
            navigate(-1);
        } else {
            navigate(isEditMode ? '/workspace/blog-manage' : '/workspace');
        }
    };

    if (pageLoading) {
        return <LoadingSpinner fullScreen text={t('blog.loading')} />;
    }

    return (
        <div className="h-dvh bg-canvas flex flex-col overflow-hidden font-sans">
            <PublishHeader
                t={t}
                isEditMode={isEditMode}
                loading={loading}
                isSettingsOpen={isSettingsOpen}
                draftStatus={draftStatus}
                showDraftStatus={isDraftStatusVisible && !isEditMode}
                onBack={handleBack}
                onSaveDraft={handleSaveDraft}
                onToggleSettings={toggleSettings}
                onPublish={handlePublish}
            />

            <div className="flex-1 min-h-0 relative">
                <main className="h-full min-w-0 overflow-hidden">
                    <PublishEditor
                        ref={editorRef}
                        isPreview={isPreview}
                        onEditMode={() => {
                            setIsPreview(false);
                            setTimeout(() => editorRef.current?.focus(), 10);
                        }}
                        onPreviewMode={() => setIsPreview(true)}
                        title={formData.title}
                        onTitleChange={(title) => setField('title', title)}
                        content={formData.content}
                        onContentChange={(content) => setField('content', content)}
                        disabled={loading}
                    />
                </main>

                <PublishSettings
                    t={t}
                    isSettingsOpen={isSettingsOpen}
                    categories={categories}
                    availableTags={availableTags}
                    values={formData}
                    onChange={setField}
                    onToggleSettings={toggleSettings}
                />
            </div>
        </div>
    );
};

export default BlogPublish;
