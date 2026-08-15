import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, Filter, X, Loader2 } from 'lucide-react';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import SEOHead from '@components/seo/SEOHead';

const getHasMore = (data, loadedCount = 0) => {
    const current = Number(data?.current);
    const pages = Number(data?.pages);
    const total = Number(data?.total);

    if (Number.isFinite(current) && Number.isFinite(pages) && pages > 0) {
        return current < pages;
    }

    if (Number.isFinite(total) && total >= 0) {
        return loadedCount < total;
    }

    return data?.hasMore === true;
};

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
    const [total, setTotal] = useState(0);

    // 分页状态
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const abortRef = useRef(null);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';

    // 重置并拉取首屏数据
    useEffect(() => {
        const controller = new AbortController();
        abortRef.current = controller;

        const fetchInitialBlogs = async () => {
            setLoading(true);
            setPage(1);
            try {
                const data = await blogService.getBlogs(
                    { search, category, tag, page: 1, size: 10 },
                    { signal: controller.signal }
                );
                // 严格对接新的 PageData 结构
                const records = data.records || [];
                setBlogs(records);
                setTotal(Number(data.total) || 0);
                setHasMore(getHasMore(data, records.length));
            } catch (error) {
                if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
                console.error('Failed to fetch blogs:', error);
                setBlogs([]);
                setTotal(0);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialBlogs();

        return () => controller.abort();
    }, [search, category, tag]);

    // 加载更多（useCallback 避免 IntersectionObserver 闭包过期）
    const fetchMoreBlogs = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        const controller = new AbortController();
        abortRef.current = controller;

        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const data = await blogService.getBlogs(
                { search, category, tag, page: nextPage, size: 10 },
                { signal: controller.signal }
            );
            if (data && data.records) {
                setBlogs(prev => [...prev, ...data.records]);
                setHasMore(getHasMore(data, (nextPage - 1) * 10 + data.records.length));
                setPage(Number(data.current) || nextPage);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
            console.error('Failed to fetch more blogs:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [page, loadingMore, hasMore, search, category, tag]);

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
    }, [loading, loadingMore, hasMore, fetchMoreBlogs]);

    // 组件卸载时取消请求
    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

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
            {/* SEO: 博客列表页 meta */}
            <SEOHead
                title={t('blog.latestPosts', 'Blog')}
                description="Xander Lab 技术博客 — 前端架构、React 实践、UI 组件设计等技术文章"
                canonical="/blog/"
                ogType="website"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'Blog | Xander Lab',
                    description: 'Technical articles on frontend architecture, React patterns, and UI component design',
                    url: 'https://xander.dsircity.top/blog/',
                    isPartOf: { '@id': 'https://xander.dsircity.top/#website' }
                }}
            />

            {/* 头部区域 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5">
                <div className="flex-1">
                    <div className="text-xl font-bold text-ink tracking-tight mb-1">
                        {getPageTitle()}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-ink-muted">
                            {loading ? t('blog.loading') : t('blog.foundArticles', { count: total })}
                        </div>
                        {loadingMore && <Loader2 className="w-3 h-3 text-accent animate-spin" />}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {(search || category || tag) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center px-2.5 py-1.5 text-xs font-medium text-ink-secondary bg-surface-muted rounded-lg hover:bg-border transition-colors"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            {t('blog.clearFilters')}
                        </button>
                    )}

                    <div className="hidden md:flex bg-surface-muted p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            aria-label={t('common.aria.gridView', 'Grid view')}
                            aria-pressed={viewMode === 'grid'}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-canvas shadow-sm text-accent'
                                : 'text-ink-faint hover:text-ink-secondary'
                                }`}
                        >
                            <Grid aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            aria-label={t('common.aria.listView', 'List view')}
                            aria-pressed={viewMode === 'list'}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-canvas shadow-sm text-accent'
                                : 'text-ink-faint hover:text-ink-secondary'
                                }`}
                        >
                            <List aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 文章列表 */}
            {loading && page === 1 ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-4 animate-pulse`}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-surface-muted rounded-xl" />
                    ))}
                </div>
            ) : blogs?.length > 0 ? (
                <div className="space-y-6">
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
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
                            <Loader2 className="w-6 h-6 text-accent animate-spin" />
                        </div>
                    )}

                    {!hasMore && blogs.length > 5 && (
                        <div className="text-center text-xs text-ink-faint py-6">
                            — {t('blog.noMoreArticles')} —
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-surface rounded-2xl border border-dashed border-border">
                    <div className="w-14 h-14 bg-surface-muted rounded-full flex items-center justify-center mb-3">
                        <Filter className="w-7 h-7 text-ink-faint" />
                    </div>
                    <div className="text-base font-medium text-ink mb-1">
                        {t('blog.noArticles')}
                    </div>
                    <div className="text-sm text-ink-muted max-w-sm mx-auto mb-5">
                        {t('blog.noArticlesHint')}
                    </div>
                    {(search || category || tag) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20"
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
