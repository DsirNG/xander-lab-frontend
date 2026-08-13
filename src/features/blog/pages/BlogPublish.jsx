import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, X } from 'lucide-react';
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

    const { formData, setField, resetFromPost, setDefaultCategory, draftStatus, isDraftBarVisible, dismissDraftBar, consumeDraft } = usePublishForm({ isEditMode });

    const onDataReady = useCallback(({ post, formattedOptions, error }) => {
        if (error) {
            if (isEditMode) {
                toast.error(error.message || t('blog.articleNotFound'));
                navigate('/profile', { replace: true });
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
        navigate(isEditMode ? '/profile' : '/blog/');
    };

    if (pageLoading) {
        return <LoadingSpinner fullScreen text={t('blog.loading')} />;
    }

    return (
        <div className="h-dvh bg-surface flex flex-col overflow-hidden font-sans">
            <PublishHeader
                t={t}
                isEditMode={isEditMode}
                loading={loading}
                isSettingsOpen={isSettingsOpen}
                onBack={handleBack}
                onSaveDraft={handleSaveDraft}
                onToggleSettings={toggleSettings}
                onPublish={handlePublish}
            />

            {isDraftBarVisible && !isEditMode && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-border bg-canvas/95 px-4 py-2 text-xs font-semibold text-ink-secondary shadow-lg backdrop-blur">
                    <Save className="w-3.5 h-3.5 text-accent" />
                    {draftStatus === 'restored' ? t('blog.draftRestored') : t('blog.draftAutoSaved')}
                    <button
                        onClick={dismissDraftBar}
                        title={t('blog.draftDismiss')}
                        aria-label={t('blog.draftDismiss')}
                        className="text-ink-faint hover:text-ink transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 min-w-0 flex flex-col relative bg-canvas rounded-tr-[0.5rem] border-r border-t border-border lg:border-r lg:border-t shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 transition-all overflow-hidden mt-2 ml-2">
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center scroll-smooth">
                        <div className="w-full max-w-4xl px-5 sm:px-8 md:px-16 pt-20 pb-10 flex flex-col gap-10 min-h-full">
                            <PublishEditor
                                ref={editorRef}
                                t={t}
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
                        </div>
                    </div>
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