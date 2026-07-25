import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Send, Save, Tag as TagIcon,
    ChevronLeft, Layout, Type, AlignLeft, Loader2,
    Eye, Edit3, Info, Settings, X
} from 'lucide-react';
import { blogService, BLOG_STATUS } from '../services/blogService';
import BlogMarkdown from '../components/BlogMarkdown';
import BlogMarkdownComposer from '../components/BlogMarkdownComposer';
import { useToast } from '@/hooks/useToast';
import useIsMobile from '@hooks/useIsMobile';
import CustomSelect from '@/components/common/CustomSelect';
import CreatableMultiSelect from '@/components/common/CreatableMultiSelect';
import LoadingSpinner from '@components/common/LoadingSpinner';

const DRAFT_STORAGE_KEY = 'xander-lab:blog-publish-draft';
const PUBLISH_REQUEST_STORAGE_KEY = 'xander-lab:blog-publish-request';

const createPublishRequestId = () => globalThis.crypto?.randomUUID?.()
    || `publish-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [isPreview, setIsPreview] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        summary: '',
        content: '',
        tags: []
    });

    const isMobile = useIsMobile();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const toggleSettings = () => setIsSettingsOpen(prev => !prev);

    useEffect(() => {
        if (!isMobile) setIsSettingsOpen(false);
    }, [isMobile]);

    const contentTextareaRef = useRef(null);

    useEffect(() => {
        if (isEditMode) return;
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
            if (draft && typeof draft === 'object') {
                setFormData(prev => ({ ...prev, ...draft, tags: Array.isArray(draft.tags) ? draft.tags : [] }));
            }
        } catch {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
    }, [isEditMode]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const [catData, tagData] = await Promise.all([
                    blogService.getCategories({ signal: controller.signal }),
                    blogService.getAllTags({ signal: controller.signal })
                ]);

                const formattedOptions = catData.map(c => ({ value: String(c.id), label: c.name }));
                setCategories(formattedOptions);

                if (isEditMode) {
                    const post = await blogService.getMyBlogById(editId, { signal: controller.signal });
                    setFormData({
                        title: post.title || '',
                        categoryId: post.category != null ? String(post.category) : (formattedOptions[0]?.value || ''),
                        summary: post.summary || '',
                        content: post.content || '',
                        tags: Array.isArray(post.tags) ? post.tags : [],
                    });
                } else if (formattedOptions.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: prev.categoryId || formattedOptions[0].value
                    }));
                }

                setAvailableTags(tagData.map(item => item.name));
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                console.error('Failed to fetch data:', err);
                if (isEditMode) {
                    toast.error(err.message || t('blog.articleNotFound'));
                    navigate('/profile', { replace: true });
                }
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per edit id
    }, [editId, isEditMode, navigate]);

    const buildPayload = (publish) => ({
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        categoryId: formData.categoryId,
        tags: formData.tags,
        publish,
    });

    const handlePublish = async () => {
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

            const requestId = localStorage.getItem(PUBLISH_REQUEST_STORAGE_KEY) || createPublishRequestId();
            localStorage.setItem(PUBLISH_REQUEST_STORAGE_KEY, requestId);
            await blogService.publishBlog(buildPayload(true), { headers: { 'Idempotency-Key': requestId }, timeout: 0 });
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            localStorage.removeItem(PUBLISH_REQUEST_STORAGE_KEY);
            toast.success(t('blog.publishSuccess'));
            navigate('/blog/');
        } catch (err) {
            if (isEditMode) {
                toast.error(err.message || t('blog.publishError'));
                return;
            }
            const isUncertain = err.code === 'ECONNABORTED' || !err.response;
            if (isUncertain) {
                const requestId = localStorage.getItem(PUBLISH_REQUEST_STORAGE_KEY);
                for (let attempt = 0; attempt < 5; attempt += 1) {
                    if (attempt) await new Promise((resolve) => setTimeout(resolve, 1000));
                    try {
                        const status = await blogService.getPublishStatus(requestId, { timeout: 5000, _silent: true, dedupe: false });
                        if (status.status === 'published') {
                            localStorage.removeItem(DRAFT_STORAGE_KEY);
                            localStorage.removeItem(PUBLISH_REQUEST_STORAGE_KEY);
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
    };

    const handleSaveDraft = async () => {
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
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            toast.success(t('blog.saveDraftServerSuccess'));
            navigate('/profile');
        } catch (err) {
            // Fallback: keep local draft for new posts only
            if (!isEditMode) {
                try {
                    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
                    toast.warning(t('blog.saveDraftLocalFallback'));
                    return;
                } catch (error) {
                    console.error('Failed to save blog draft:', error);
                }
            }
            toast.error(err.message || t('blog.saveDraftError'));
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(isEditMode ? '/profile' : '/blog/');
    };

    if (pageLoading) {
        return <LoadingSpinner fullScreen text={t('blog.loading')} />;
    }

    return (
        <div className="h-dvh bg-surface flex flex-col overflow-hidden font-sans">
            <header className="h-16 shrink-0 border-b border-border/60 flex items-center justify-between gap-2 px-3 sm:px-6 bg-canvas z-20 shadow-sm relative">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 text-ink-faint hover:bg-surface-muted rounded-xl transition-all group"
                        title={isEditMode ? t('blog.backToManage') : t('blog.backToBlog')}
                    >
                        <ChevronLeft className="w-5 h-5 transition-transform" />
                    </button>
                    <div className="hidden sm:block h-4 w-px bg-border"></div>
                    <span className="truncate text-xs font-black uppercase tracking-widest text-ink flex items-center gap-2">
                        {isEditMode ? t('blog.editTitle') : t('blog.publishTitle')}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                    <button
                        onClick={handleSaveDraft}
                        disabled={loading}
                        title={t('blog.saveDraft')}
                        className="flex p-2 sm:px-5 text-xs font-bold text-ink-muted hover:text-ink transition-colors items-center gap-2 rounded-xl hover:bg-surface-muted disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> <span className="hidden md:inline">{t('blog.saveDraft')}</span>
                    </button>
                    <button
                        onClick={toggleSettings}
                        className="lg:hidden p-2 text-ink-muted hover:text-accent hover:bg-surface-muted rounded-xl transition-all"
                        title={t('blog.publishSettings', 'Document Settings')}
                    >
                        {isSettingsOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-3 sm:px-6 py-2 bg-ink hover:bg-accent text-white rounded-xl text-xs font-black shadow-lg shadow-accent/0 hover:shadow-accent/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {t('blog.publishing')}</>
                        ) : (
                            <><Send className="w-4 h-4" /> {t('blog.publishNow')}</>
                        )}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 min-w-0 flex flex-col relative bg-canvas rounded-tr-[0.5rem] border-r border-t border-border lg:border-r lg:border-t shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 transition-all overflow-hidden mt-2 ml-2">
                    <div className="absolute top-3 right-3 sm:top-6 sm:right-8 z-20">
                        <div className="flex bg-surface-muted/80 backdrop-blur-md p-1 rounded-2xl border border-border/50 shadow-sm">
                            <button
                                onClick={() => { setIsPreview(false); setTimeout(() => contentTextareaRef.current?.focus(), 10); }}
                                className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-caption font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-canvas text-accent shadow-sm scale-100' : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-muted/50 '}`}
                            >
                                <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">{t('blog.edit', 'Edit')}</span>
                            </button>
                            <button
                                onClick={() => setIsPreview(true)}
                                className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-caption font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-canvas text-accent shadow-sm scale-100' : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-muted/50 '}`}
                            >
                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">{t('blog.preview', 'Preview')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center scroll-smooth">
                        <div className="w-full max-w-4xl px-5 sm:px-8 md:px-16 pt-20 pb-10 flex flex-col gap-10 min-h-full">
                            <div className="relative group">
                                {!isPreview && (
                                    <div className="absolute -left-10 top-5 text-border-strong pointer-events-none transition-colors group-focus-within:text-accent">
                                        <Type className="w-6 h-6" />
                                    </div>
                                )}
                                <textarea
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t('blog.titlePlaceholder')}
                                    rows={1}
                                    className={`w-full text-3xl sm:text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-ink resize-none break-words ${isPreview ? 'hidden' : 'placeholder:text-border-strong'}`}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            <div className={`flex-1 relative group ${isPreview ? 'hidden' : 'flex'}`}>
                                <div className="w-full">
                                <BlogMarkdownComposer
                                    ref={contentTextareaRef}
                                    value={formData.content}
                                    onChange={(content) => setFormData((current) => ({ ...current, content }))}
                                    placeholder={t('blog.contentPlaceholder')}
                                    disabled={loading}
                                />
                                </div>
                            </div>

                            {isPreview && (
                                <div className="prose max-w-none pt-2 mb-20">
                                    {formData.title && (
                                        <h1 className="text-4xl md:text-5xl font-black mb-12 text-ink leading-tight">
                                            {formData.title}
                                        </h1>
                                    )}
                                    {formData.content ? (
                                        <BlogMarkdown content={formData.content} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-40 text-ink-faint">
                                            <Info className="w-16 h-16 mb-6 opacity-30" />
                                            <p className="text-sm font-bold uppercase tracking-widest italic">{t('blog.noContent', 'No content yet')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {isSettingsOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/30 z-30"
                        style={{ top: '64px' }}
                        onClick={toggleSettings}
                    />
                )}

                <aside className={`fixed lg:static top-[64px] right-0 bottom-0 w-[min(20rem,100vw)] lg:w-[420px] shrink-0 bg-surface flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 lg:p-10 space-y-12 pb-32">
                        <div>
                            <span className="text-micro font-black uppercase tracking-[0.2em] text-ink-faint mb-8 block flex items-center gap-3">
                                <span className="h-px bg-border flex-1"></span>
                                DOCUMENT SETTINGS
                                <span className="h-px bg-border flex-1"></span>
                            </span>

                            <section className="space-y-4 mb-10">
                                <div className="flex items-center gap-2 text-ink-muted group">
                                    <Layout className="w-4 h-4 group-hover:text-accent transition-colors" />
                                    <span className="text-micro font-black uppercase tracking-widest">{t('blog.categoryLabel')}</span>
                                </div>
                                <CustomSelect
                                    options={categories}
                                    value={formData.categoryId}
                                    onChange={val => setFormData({ ...formData, categoryId: val })}
                                    placeholder={t('blog.categoryPlaceholder')}
                                    className="w-full shadow-sm bg-canvas rounded-2xl"
                                />
                            </section>

                            <section className="space-y-4 mb-10 relative">
                                <div className="flex items-center justify-between group mb-2">
                                    <div className="flex items-center gap-2 text-ink-muted">
                                        <TagIcon className="w-4 h-4 group-hover:text-accent transition-colors" />
                                        <span className="text-micro font-black uppercase tracking-widest">{t('blog.tagLabel')}</span>
                                    </div>
                                    <span className="text-micro text-ink-faint font-medium">Press Enter ↵</span>
                                </div>
                                <CreatableMultiSelect
                                    value={formData.tags}
                                    onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                                    options={availableTags}
                                />
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-ink-muted">
                                        <AlignLeft className="w-4 h-4 group-hover:text-accent transition-colors" />
                                        <span className="text-micro font-black uppercase tracking-widest">{t('blog.summaryLabel')}</span>
                                    </div>
                                    <span className={`text-micro font-medium ${formData.summary.length > 200 ? 'text-danger' : 'text-ink-faint'}`}>
                                        {formData.summary.length} / 200
                                    </span>
                                </div>
                                <textarea
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                    placeholder={t('blog.summaryPlaceholder')}
                                    className="w-full bg-canvas border border-border/60 rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all resize-none h-40 shadow-sm text-ink placeholder:text-ink-faint custom-scrollbar"
                                />
                            </section>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10"></div>
                </aside>
            </div>
        </div>
    );
};

export default BlogPublish;
