import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, Filter, X, Loader2 } from 'lucide-react';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';

/**
 * 博客首页 - 文章列表
 * 支持搜索筛选、分类筛选、滚动加载、网格/列表视图切换
 */
const BlogHome = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    // 分页状态
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';

    // 重置并拉取首屏数据
    useEffect(() => {
        const fetchInitialBlogs = async () => {
            setLoading(true);
            setPage(1);
            try {
                const data = await blogService.getBlogs({ search, category, tag, page: 1, size: 10 });
                // 严格对接新的 PageData 结构
                setBlogs(data.records || []);
                setHasMore(data.hasMore || false);
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
                setBlogs([]);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialBlogs();
    }, [search, category, tag]);

    // 加载更多
    const fetchMoreBlogs = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const data = await blogService.getBlogs({ search, category, tag, page: nextPage, size: 10 });
            if (data && data.records) {
                setBlogs(prev => [...prev, ...data.records]);
                setPage(nextPage);
                setHasMore(data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch more blogs:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // 监听滚动到末尾
    const lastElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreBlogs();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, page]);

    const clearFilters = () => {
        setSearchParams({});
    };

    // 组合页面标题，处理多重筛选
    const getPageTitle = () => {
        let parts = [];
        if (tag) parts.push(`${t('blog.tagLabel')}: ${tag}`);
        if (category) parts.push(`${t('blog.categoryLabel')}: ${category}`);
        if (search) parts.push(`${t('blog.searchLabel')}: "${search}"`);

        return parts.length > 0 ? parts.join(' + ') : t('blog.latestPosts');
    };

    return (
        <div className="space-y-6">
            {/* 头部区域 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                        {getPageTitle()}
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {loading ? t('blog.loading') : `${t('blog.foundArticles', { count: blogs?.length || 0 })}`}
                        </p>
                        {loadingMore && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                    </div>
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

                    <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <Grid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 文章列表 */}
            {loading && page === 1 ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4 animate-pulse`}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    ))}
                </div>
            ) : blogs?.length > 0 ? (
                <div className="space-y-6">
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                            : 'flex flex-col gap-4'
                    }>
                        {blogs.map((blog, index) => {
                            if (blogs?.length === index + 1) {
                                return (
                                    <div ref={lastElementRef} key={blog.id}>
                                        <BlogCard blog={blog} />
                                    </div>
                                );
                            } else {
                                return <BlogCard key={blog.id} blog={blog} />;
                            }
                        })}
                    </div>

                    {/* 加载更多指示器 */}
                    {loadingMore && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}

                    {!hasMore && blogs.length > 5 && (
                        <p className="text-center text-xs text-slate-400 py-6">
                            — {t('blog.noMoreArticles')} —
                        </p>
                    )}
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
