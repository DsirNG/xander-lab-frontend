import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, Filter, X } from 'lucide-react';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';

/**
 * 博客首页 - 文章列表
 * 支持搜索筛选、分类筛选、网格/列表视图切换
 */
const BlogHome = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const data = await blogService.getBlogs({ search, category, tag });
                setBlogs(data);
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [search, category, tag]);

    const clearFilters = () => {
        setSearchParams({});
    };

    // 页面标题
    const pageTitle = tag
        ? `${t('blog.tagLabel')}: ${tag}`
        : category
            ? `${t('blog.categoryLabel')}: ${category}`
            : search
                ? `${t('blog.searchLabel')}: "${search}"`
                : t('blog.latestPosts');

    return (
        <div className="space-y-6">
            {/* 头部区域 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                        {pageTitle}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {loading
                            ? t('blog.loading')
                            : `${t('blog.foundArticles', { count: blogs.length })}`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {(search || category || tag) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            {t('blog.clearFilters')}
                        </button>
                    )}

                    {/* 视图切换 - 手机端隐藏（手机端始终单列，切换无视觉差异） */}
                    <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            aria-label={t('blog.gridView')}
                        >
                            <Grid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            aria-label={t('blog.listView')}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 文章列表 */}
            {loading ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4 animate-pulse`}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    ))}
                </div>
            ) : blogs.length > 0 ? (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                        : 'flex flex-col gap-4'
                }>
                    {blogs.map(blog => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <Filter className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-base font-medium text-slate-900 dark:text-white mb-1">
                        {t('blog.noArticles')}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
                        {t('blog.noArticlesHint')}
                    </p>
                    {(search || category || tag) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                        >
                            {t('blog.viewAll')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogHome;
