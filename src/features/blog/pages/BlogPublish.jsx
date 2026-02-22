import React, { useState, useEffect } from 'react';
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

/**
 * 博客发布页面
 * Blog Publish Page - modern and clean writing experience
 */
const BlogPublish = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isPreview, setIsPreview] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        summary: '',
        content: '',
        tags: []
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await blogService.getCategories();
                setCategories(data);
                // 默认选择第一个分类
                if (data && data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: data[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                });
            }
            setTagInput('');
        }
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* 顶部导航栏 / Header */}
            <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title={t('blog.backToBlog')}
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="text-sm font-black uppercase italic tracking-widest text-slate-900 dark:text-white">
                        {t('blog.publishTitle')}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> {t('blog.saveDraft')}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {t('blog.publishing')}</>
                        ) : (
                            <><Send className="w-4 h-4" /> {t('blog.publishNow')}</>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 space-y-8">
                {/* 核心卡片容器 */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-10">
                        {/* 标题 / Title */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 group">
                                <Type className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.titleLabel')}</span>
                            </div>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder={t('blog.titlePlaceholder')}
                                className="w-full text-3xl md:text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-100 dark:placeholder:text-slate-800 text-slate-900 dark:text-white"
                            />
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 分类 / Category */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-400 group">
                                    <Layout className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.categoryLabel')}</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none text-slate-700 dark:text-slate-200"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronLeft className="w-4 h-4 -rotate-90" />
                                    </div>
                                </div>
                            </section>

                            {/* 标签 / Tags */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-400 group">
                                    <TagIcon className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.tagLabel')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[50px] p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[11px] font-bold text-indigo-600 flex items-center gap-1.5 shadow-sm">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder={t('blog.tagsPlaceholder')}
                                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1 min-w-[150px] dark:placeholder:text-slate-700 text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </section>
                        </div>

                        {/* 摘要 / Abstract */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 group">
                                <AlignLeft className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.summaryLabel')}</span>
                            </div>
                            <textarea
                                value={formData.summary}
                                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                placeholder={t('blog.summaryPlaceholder')}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-medium leading-relaxed outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none h-24 text-slate-700 dark:text-slate-200"
                            />
                        </section>

                        {/* 内容 / Content - 增强可见性 */}
                        <section className="space-y-4 pb-10">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-2 text-slate-400 group">
                                    <Hash className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('blog.contentLabel')}</span>
                                </div>
                                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                                    <button
                                        onClick={() => setIsPreview(false)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Edit3 className="w-3 h-3" /> 编辑
                                    </button>
                                    <button
                                        onClick={() => setIsPreview(true)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Eye className="w-3 h-3" /> 预览
                                    </button>
                                </div>
                            </div>

                            <div className={`relative min-h-[500px] rounded-3xl transition-all ${!isPreview ? 'bg-slate-50/50 dark:bg-slate-950/30 ring-1 ring-slate-100 dark:ring-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/50' : ''}`}>
                                {!isPreview ? (
                                    <textarea
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        placeholder={t('blog.contentPlaceholder')}
                                        className="w-full min-h-[500px] bg-transparent border-none outline-none text-base md:text-lg font-medium leading-relaxed p-8 placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-800 dark:text-slate-200 custom-scrollbar"
                                    />
                                ) : (
                                    <div className="p-8 prose prose-slate dark:prose-invert max-w-none">
                                        {formData.content ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
                                                <Info className="w-10 h-10 mb-4 opacity-20" />
                                                <p className="text-sm font-bold uppercase tracking-widest italic">暂无内容预览 // Null Content</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogPublish;
