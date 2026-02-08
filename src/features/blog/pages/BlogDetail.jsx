import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ChevronLeft } from 'lucide-react';
import { blogService } from '../services/blogService';

/**
 * 博客详情页
 * 展示单篇文章的完整内容
 */
const BlogDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const data = await blogService.getBlogById(id);
                setBlog(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">404</h2>
                <p className="text-sm text-slate-500 mb-5">{t('blog.articleNotFound')}</p>
                <Link
                    to="/blog"
                    className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    {t('blog.backToBlog')}
                </Link>
            </div>
        );
    }

    return (
        <article className="max-w-3xl">
            {/* 返回导航 */}
            <Link
                to="/blog"
                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-primary transition-colors mb-6"
            >
                <ChevronLeft className="w-4 h-4 mr-0.5" />
                {t('blog.backToBlog')}
            </Link>

            {/* 文章头部 */}
            <header className="mb-8">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wide uppercase mb-4">
                    {blog.category}
                </span>

                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                    {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{blog.author}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <time dateTime={blog.date}>{blog.date}</time>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <span>{blog.readTime}</span>
                    </div>
                </div>
            </header>

            {/* 文章内容 */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
                {/* 实际项目中接入 Markdown 渲染器 */}
                <div className="whitespace-pre-wrap leading-relaxed text-sm text-slate-700 dark:text-slate-300">
                    {blog.content}
                </div>
            </div>

            {/* 底部标签 */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="flex flex-wrap gap-2">
                    {blog.tags.map(tag => (
                        <Link
                            key={tag}
                            to={`/blog?search=${tag}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-primary dark:hover:text-white transition-colors"
                        >
                            <Tag className="w-3 h-3 mr-1.5" />
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default BlogDetail;
