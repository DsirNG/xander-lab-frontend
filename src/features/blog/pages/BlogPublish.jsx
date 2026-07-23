import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Send, Save, Tag as TagIcon,
    ChevronLeft, Layout, Type, AlignLeft, Hash, Loader2,
    Eye, Edit3, Info, Settings, X
} from 'lucide-react';
import { blogService } from '../services/blogService';
import BlogMarkdown from '../components/BlogMarkdown';
import BlogMediaInsert from '../components/BlogMediaInsert';
import { useToast } from '@/hooks/useToast';
import useIsMobile from '@hooks/useIsMobile';
import CustomSelect from '@/components/common/CustomSelect';
import CreatableMultiSelect from '@/components/common/CreatableMultiSelect';

const DRAFT_STORAGE_KEY = 'xander-lab:blog-publish-draft';
const PUBLISH_REQUEST_STORAGE_KEY = 'xander-lab:blog-publish-request';

const createPublishRequestId = () => globalThis.crypto?.randomUUID?.()
    || `publish-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * 博客发布页面
 * Blog Publish Page - Premium Split Layout (Left: Editor, Right: Settings)
 */
const BlogPublish = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
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

    // --- 移动端设置面板控制 ---
    const isMobile = useIsMobile();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const toggleSettings = () => setIsSettingsOpen(prev => !prev);

    useEffect(() => {
        if (!isMobile) setIsSettingsOpen(false);
    }, [isMobile]);

    const contentTextareaRef = useRef(null);

    useEffect(() => {
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
            if (draft && typeof draft === 'object') {
                setFormData(prev => ({ ...prev, ...draft, tags: Array.isArray(draft.tags) ? draft.tags : [] }));
            }
        } catch {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
    }, []);
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
                if (formattedOptions.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: prev.categoryId || formattedOptions[0].value
                    }));
                }

                // tagData is typically [{ name: 'React', count: 5 }, ...]
                setAvailableTags(tagData.map(t => t.name));
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
        return () => controller.abort();
    }, []);

    const handlePublish = async () => {
        if (!formData.title || !formData.content || !formData.categoryId) {
            toast.warning(t('blog.fillRequired'));
            return;
        }

        setLoading(true);
        const requestId = localStorage.getItem(PUBLISH_REQUEST_STORAGE_KEY) || createPublishRequestId();
        localStorage.setItem(PUBLISH_REQUEST_STORAGE_KEY, requestId);
        try {
            await blogService.publishBlog(formData, { headers: { 'Idempotency-Key': requestId }, timeout: 0 });
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            localStorage.removeItem(PUBLISH_REQUEST_STORAGE_KEY);
            toast.success(t('blog.publishSuccess'));
            navigate('/blog/');
        } catch (err) {
            const isUncertain = err.code === 'ECONNABORTED' || !err.response;
            if (isUncertain) {
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

    const handleSaveDraft = () => {
        try {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
            toast.success(t('blog.saveDraftSuccess'));
        } catch (error) {
            console.error('Failed to save blog draft:', error);
            toast.error(t('blog.saveDraftError'));
        }
    };

    const handleInsertMarkdown = useCallback((markdown) => {
        const textarea = contentTextareaRef.current;
        const start = textarea?.selectionStart ?? formData.content.length;
        const end = textarea?.selectionEnd ?? start;
        setFormData((current) => ({
            ...current,
            content: `${current.content.slice(0, start)}${markdown}${current.content.slice(end)}`,
        }));
        requestAnimationFrame(() => {
            textarea?.focus();
            const cursor = start + markdown.length;
            textarea?.setSelectionRange(cursor, cursor);
        });
    }, [formData.content]);

    return (
        <div className="h-dvh bg-slate-50 flex flex-col overflow-hidden font-sans">
            {/* 顶部导航栏 / Header */}
            <header className="h-16 shrink-0 border-b border-slate-200/60 flex items-center justify-between gap-2 px-3 sm:px-6 bg-white z-20 shadow-sm relative">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => navigate('/blog/')}
                        className="p-2 -ml-2 text-slate-400 hover:bg-slate-100  rounded-xl transition-all group"
                        title={t('blog.backToBlog')}
                    >
                        <ChevronLeft className="w-5 h-5 transition-transform" />
                    </button>
                    <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
                    <span className="truncate text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        {/*<span className="w-2 h-2 rounded-full bg-primary animate-pulse ring-4 ring-primary/20"></span>*/}
                        {t('blog.publishTitle')}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                    <button
                        onClick={handleSaveDraft}
                        disabled={loading}
                        title={t('blog.saveDraft')}
                        className="flex p-2 sm:px-5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors items-center gap-2 rounded-xl hover:bg-slate-100 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> <span className="hidden md:inline">{t('blog.saveDraft')}</span>
                    </button>
                    {/* 移动端设置面板切换按钮 */}
                    <button
                        onClick={toggleSettings}
                        className="lg:hidden p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all"
                        title={t('blog.publishSettings', 'Document Settings')}
                    >
                        {isSettingsOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-3 sm:px-6 py-2 bg-slate-900 hover:bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/0 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
                {/* 主编辑区 / Left Pane - Editor & Preview */}
                <main className="flex-1 min-w-0 flex flex-col relative bg-white rounded-tr-[0.5rem] border-r border-t border-slate-200 lg:border-r lg:border-t shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 transition-all overflow-hidden mt-2 ml-2">
                    <div className="absolute top-3 right-3 sm:top-6 sm:right-8 z-20">
                        <div className="flex bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50 shadow-sm">
                            <button
                                onClick={() => { setIsPreview(false); setTimeout(() => contentTextareaRef.current?.focus(), 10); }}
                                className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-white  text-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700  hover:bg-slate-200/50 '}`}
                            >
                                <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">{t('blog.edit', 'Edit')}</span>
                            </button>
                            <button
                                onClick={() => setIsPreview(true)}
                                className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-white  text-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700  hover:bg-slate-200/50 '}`}
                            >
                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">{t('blog.preview', 'Preview')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center scroll-smooth">
                        <div className="w-full max-w-4xl px-5 sm:px-8 md:px-16 pt-20 pb-10 flex flex-col gap-10 min-h-full">
                            {/* 标题 */}
                            <div className="relative group">
                                {!isPreview && (
                                    <div className="absolute -left-10 top-5 text-slate-200 pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Type className="w-6 h-6" />
                                    </div>
                                )}
                                <textarea
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t('blog.titlePlaceholder')}
                                    rows={1}
                                    className={`w-full text-3xl sm:text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-slate-900 resize-none break-words ${isPreview ? 'hidden' : 'placeholder:text-slate-200'}`}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            {/* 内容区 */}
                            <div className={`flex-1 relative group ${isPreview ? 'hidden' : 'flex'}`}>
                                <div className="absolute -left-10 top-2 text-slate-200 pointer-events-none transition-colors group-focus-within:text-primary">
                                    <Hash className="w-6 h-6" />
                                </div>
                                <div className="w-full">
                                <BlogMediaInsert onInsert={handleInsertMarkdown} disabled={loading} />
                                <textarea
                                    ref={contentTextareaRef}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder={t('blog.contentPlaceholder')}
                                    className="w-full h-full min-h-[60vh] bg-transparent border-none outline-none text-lg leading-[1.8] text-slate-700  placeholder:text-slate-300 resize-none font-medium mb-20"
                                />
                                </div>
                            </div>

                            {/* 预览区 */}
                            {isPreview && (
                                <div className="prose prose-slate max-w-none pt-2 mb-20">
                                    {formData.title && (
                                        <h1 className="text-4xl md:text-5xl font-black mb-12 text-slate-900  leading-tight">
                                            {formData.title}
                                        </h1>
                                    )}
                                    {formData.content ? (
                                        <BlogMarkdown content={formData.content} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                                            <Info className="w-16 h-16 mb-6 opacity-30" />
                                            <p className="text-sm font-bold uppercase tracking-widest italic">{t('blog.noContent', 'No content yet')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* 移动端遮罩层 */}
                {isSettingsOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/30 z-30"
                        style={{ top: '64px' }}
                        onClick={toggleSettings}
                    />
                )}

                {/* 侧边栏 / Right Pane - Configuration */}
                <aside className={`
                    fixed lg:static
                    top-[64px] right-0 bottom-0
                    w-[min(20rem,100vw)] lg:w-[420px] shrink-0
                    bg-slate-50 flex flex-col z-40
                    transform transition-transform duration-300 ease-in-out
                    ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 lg:p-10 space-y-12 pb-32">

                        {/* 状态与控制面板 */}
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400  mb-8 block flex items-center gap-3">
                                <span className="h-px bg-slate-200  flex-1"></span>
                                DOCUMENT SETTINGS
                                <span className="h-px bg-slate-200  flex-1"></span>
                            </span>

                            {/* 分类 / Category */}
                            <section className="space-y-4 mb-10">
                                <div className="flex items-center gap-2 text-slate-500 group">
                                    <Layout className="w-4 h-4 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.categoryLabel')}</span>
                                </div>
                                <CustomSelect
                                    options={categories}
                                    value={formData.categoryId}
                                    onChange={val => setFormData({ ...formData, categoryId: val })}
                                    placeholder={t('blog.categoryPlaceholder')}
                                    className="w-full shadow-sm bg-white  rounded-2xl"
                                />
                            </section>

                            {/* 标签 / Tags */}
                            <section className="space-y-4 mb-10 relative">
                                <div className="flex items-center justify-between group mb-2">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <TagIcon className="w-4 h-4 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.tagLabel')}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">Press Enter ↵</span>
                                </div>
                                <CreatableMultiSelect
                                    value={formData.tags}
                                    onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                                    options={availableTags}
                                />
                            </section>

                            {/* 摘要 / Abstract */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <AlignLeft className="w-4 h-4 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.summaryLabel')}</span>
                                    </div>
                                    <span className={`text-[10px] font-medium ${formData.summary.length > 200 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {formData.summary.length} / 200
                                    </span>
                                </div>
                                <textarea
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                    placeholder={t('blog.summaryPlaceholder')}
                                    className="w-full bg-white  border border-slate-200/60  rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none h-40 shadow-sm text-slate-800  placeholder:text-slate-400 custom-scrollbar"
                                />
                            </section>
                        </div>

                    </div>

                    {/* 底部渐变遮罩，改善侧边栏滚动视觉效果 */}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10"></div>
                </aside>
            </div>
        </div>
    );
};

export default BlogPublish;
