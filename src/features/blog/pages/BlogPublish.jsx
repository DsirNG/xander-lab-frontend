import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Send, Save, X, Tag as TagIcon,
    ChevronLeft, Layout, Type, AlignLeft, Hash, Loader2,
    Eye, Edit3, Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogService } from '../services/blogService';
import { useToast } from '@/hooks/useToast';
import CustomSelect from '../../components/pages/codeComponent/CustomSelect';
import CreatableMultiSelect from '@/components/common/CreatableMultiSelect';

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

    const contentTextareaRef = useRef(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catData, tagData] = await Promise.all([
                    blogService.getCategories(),
                    blogService.getAllTags()
                ]);

                const formattedOptions = catData.map(c => ({ value: String(c.id), label: c.name }));
                setCategories(formattedOptions);
                if (formattedOptions.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: formattedOptions[0].value }));
                }

                // tagData is typically [{ name: 'React', count: 5 }, ...]
                setAvailableTags(tagData.map(t => t.name));
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    const handlePublish = async () => {
        if (!formData.title || !formData.content || !formData.categoryId) {
            toast.warning(t('blog.fillRequired'));
            return;
        }

        setLoading(true);
        try {
            await blogService.publishBlog(formData);
            toast.success(t('blog.publishSuccess'));
            navigate('/blog');
        } catch (err) {
            toast.error(err.message || t('blog.publishError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-slate-50  flex flex-col overflow-hidden font-sans">
            {/* 顶部导航栏 / Header */}
            <header className="h-16 shrink-0 border-b border-slate-200 /60 flex items-center justify-between px-6 bg-white  z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100  rounded-xl transition-all group"
                        title={t('blog.backToBlog')}
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 "></div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900  flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse ring-4 ring-primary/20"></span>
                        {t('blog.publishTitle')}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 rounded-xl hover:bg-slate-100 ">
                        <Save className="w-4 h-4" /> {t('blog.saveDraft')}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-6 py-2 bg-slate-900  hover:bg-primary  text-white  hover:text-white rounded-xl text-xs font-black shadow-lg shadow-primary/0 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
                <main className="flex-1 flex flex-col relative bg-white  rounded-tr-[2.5rem] border-r border-t border-slate-200 /80 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 transition-all overflow-hidden mt-2 ml-2">
                    <div className="absolute top-6 right-8 z-20">
                        <div className="flex bg-slate-100/80 /80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50 /50 shadow-sm">
                            <button
                                onClick={() => { setIsPreview(false); setTimeout(() => contentTextareaRef.current?.focus(), 10); }}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-white  text-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700  hover:bg-slate-200/50  scale-95'}`}
                            >
                                <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">编辑</span>
                            </button>
                            <button
                                onClick={() => setIsPreview(true)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-white  text-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700  hover:bg-slate-200/50  scale-95'}`}
                            >
                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">预览</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center scroll-smooth">
                        <div className="w-full max-w-4xl px-12 md:px-16 py-20 flex flex-col gap-10 min-h-full">
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
                                    className={`w-full text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-slate-900  resize-none break-words ${isPreview ? 'hidden' : 'placeholder:text-slate-200'}`}
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
                                <textarea
                                    ref={contentTextareaRef}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder={t('blog.contentPlaceholder')}
                                    className="w-full h-full min-h-[60vh] bg-transparent border-none outline-none text-lg leading-[1.8] text-slate-700  placeholder:text-slate-300 resize-none font-medium mb-20"
                                />
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
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                                            <Info className="w-16 h-16 mb-6 opacity-30" />
                                            <p className="text-sm font-bold uppercase tracking-widest italic">尚未输入内容 // No Content</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* 侧边栏 / Right Pane - Configuration */}
                <aside className="w-[420px] shrink-0 bg-transparent flex flex-col z-0 mt-2">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-10 space-y-12 pb-32">

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
                    <div className="absolute bottom-0 left-0 w-[420px] h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10"></div>
                </aside >
            </div>
        </div>
    );
};

export default BlogPublish;
