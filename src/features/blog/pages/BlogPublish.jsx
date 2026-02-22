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
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        summary: '',
        content: '',
        tags: []
    });

    const [tagInput, setTagInput] = useState('');
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

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput.trim());
        }
    };

    const addTag = (tagName) => {
        if (!formData.tags.includes(tagName)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagName]
            }));
        }
        setTagInput('');
        setIsTagDropdownOpen(false);
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tagToRemove)
        });
    };

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
        <div className="h-screen bg-slate-50 dark:bg-[#030712] flex flex-col overflow-hidden font-sans">
            {/* 顶部导航栏 / Header */}
            <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800/50 rounded-xl transition-all group"
                        title={t('blog.backToBlog')}
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ring-4 ring-indigo-500/20"></span>
                        {t('blog.publishTitle')}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50">
                        <Save className="w-4 h-4" /> {t('blog.saveDraft')}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-6 py-2 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 hover:text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/0 hover:shadow-indigo-600/30 dark:hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
                <main className="flex-1 flex flex-col relative bg-white dark:bg-[#030712] rounded-tr-[2.5rem] border-r border-t border-slate-200 dark:border-slate-800/80 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] dark:shadow-none z-10 transition-all overflow-hidden mt-2 ml-2">
                    <div className="absolute top-6 right-8 z-20">
                        <div className="flex bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                            <button
                                onClick={() => { setIsPreview(false); setTimeout(() => contentTextareaRef.current?.focus(), 10); }}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 scale-95'}`}
                            >
                                <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">编辑</span>
                            </button>
                            <button
                                onClick={() => setIsPreview(true)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 scale-95'}`}
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
                                    <div className="absolute -left-10 top-5 text-slate-200 dark:text-slate-800 pointer-events-none transition-colors group-focus-within:text-indigo-500">
                                        <Type className="w-6 h-6" />
                                    </div>
                                )}
                                <textarea
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t('blog.titlePlaceholder')}
                                    rows={1}
                                    className={`w-full text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-slate-900 dark:text-white resize-none break-words ${isPreview ? 'hidden' : 'placeholder:text-slate-200 dark:placeholder:text-slate-800'}`}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            {/* 内容区 */}
                            <div className={`flex-1 relative group ${isPreview ? 'hidden' : 'flex'}`}>
                                <div className="absolute -left-10 top-2 text-slate-200 dark:text-slate-800 pointer-events-none transition-colors group-focus-within:text-indigo-500">
                                    <Hash className="w-6 h-6" />
                                </div>
                                <textarea
                                    ref={contentTextareaRef}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder={t('blog.contentPlaceholder')}
                                    className="w-full h-full min-h-[60vh] bg-transparent border-none outline-none text-lg leading-[1.8] text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none font-medium mb-20"
                                />
                            </div>

                            {/* 预览区 */}
                            {isPreview && (
                                <div className="prose prose-slate dark:prose-invert max-w-none pt-2 mb-20">
                                    {formData.title && (
                                        <h1 className="text-4xl md:text-5xl font-black mb-12 text-slate-900 dark:text-white leading-tight">
                                            {formData.title}
                                        </h1>
                                    )}
                                    {formData.content ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-40 text-slate-300 dark:text-slate-700">
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
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8 block flex items-center gap-3">
                                <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></span>
                                DOCUMENT SETTINGS
                                <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></span>
                            </span>

                            {/* 分类 / Category */}
                            <section className="space-y-4 mb-10">
                                <div className="flex items-center gap-2 text-slate-500 group">
                                    <Layout className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.categoryLabel')}</span>
                                </div>
                                <CustomSelect
                                    options={categories}
                                    value={formData.categoryId}
                                    onChange={val => setFormData({ ...formData, categoryId: val })}
                                    placeholder={t('blog.categoryPlaceholder')}
                                    className="w-full shadow-sm bg-white dark:bg-slate-900 rounded-2xl"
                                />
                            </section>

                            {/* 标签 / Tags */}
                            <section className="space-y-4 mb-10 relative">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <TagIcon className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.tagLabel')}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">Press Enter ↵</span>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[56px] p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 dark:hover:border-rose-900 transition-colors group/tag cursor-pointer" onClick={() => removeTag(tag)}>
                                            {tag}
                                            <X className="w-3.5 h-3.5 opacity-50 group-hover/tag:opacity-100" />
                                        </span>
                                    ))}
                                    <div className="relative flex-1 min-w-[120px]">
                                        <input
                                            value={tagInput}
                                            onChange={e => {
                                                setTagInput(e.target.value);
                                                setIsTagDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsTagDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsTagDropdownOpen(false), 200)}
                                            onKeyDown={handleAddTag}
                                            placeholder={formData.tags.length === 0 ? "e.g. React, Architecture..." : ''}
                                            className="w-full bg-transparent border-none outline-none text-sm px-2 py-1.5 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200"
                                        />

                                        {/* Tag 自定义下拉选择器 */}
                                        {isTagDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-[240px] max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-1">
                                                {availableTags
                                                    .filter(t => !formData.tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase()))
                                                    .map(tag => (
                                                        <div
                                                            key={tag}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addTag(tag);
                                                            }}
                                                            className="px-4 py-2.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-2"
                                                        >
                                                            <Hash className="w-3.5 h-3.5 opacity-50" /> {tag}
                                                        </div>
                                                    ))}
                                                {/* 如果用户输入了一个不存在的新标签，给个提示 */}
                                                {tagInput.trim() && !availableTags.includes(tagInput.trim()) && (
                                                    <div className="px-4 py-2.5 text-[12px] font-medium text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700/50 mt-1 first:border-0 first:mt-0 italic flex items-center justify-between">
                                                        <span>创建标签 "{tagInput}"</span>
                                                        <span className="text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold">Enter</span>
                                                    </div>
                                                )}
                                                {/* 如果全部选完 */}
                                                {!tagInput && availableTags.filter(t => !formData.tags.includes(t)).length === 0 && (
                                                    <div className="px-4 py-3 text-[11px] text-center text-slate-400 italic">
                                                        暂无推荐标签，输入按回车创建
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* 摘要 / Abstract */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <AlignLeft className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
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
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none h-40 shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 custom-scrollbar"
                                />
                            </section>
                        </div>

                    </div>

                    {/* 底部渐变遮罩，改善侧边栏滚动视觉效果 */}
                    <div className="absolute bottom-0 left-0 w-[420px] h-12 bg-gradient-to-t from-slate-50 dark:from-[#030712] to-transparent pointer-events-none z-10"></div>
                </aside >
            </div>
        </div>
    );
};

export default BlogPublish;
