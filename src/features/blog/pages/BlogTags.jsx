import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Tag, Hash, ChevronLeft, FileText } from 'lucide-react';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';

/**
 * 标签云页面
 * 展示所有标签，点击标签筛选相关文章   
 */
const BlogTags = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [allTags, setAllTags] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogsLoading, setBlogsLoading] = useState(false);

    const activeTag = searchParams.get('tag') || '';

    // 加载所有标签
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await blogService.getAllTags();
                setAllTags(tags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();
    }, []);

    // 根据选中标签加载文章
    useEffect(() => {
        if (!activeTag) {
            setFilteredBlogs([]);
            return;
        }
        const fetchBlogs = async () => {
            setBlogsLoading(true);
            try {
                const data = await blogService.getBlogs({ tag: activeTag, size: 20 });
                // 此时 data 是 PageData 对象
                setFilteredBlogs(data.records || []);
            } catch (error) {
                console.error('Failed to fetch blogs by tag:', error);
                setFilteredBlogs([]);
            } finally {
                setBlogsLoading(false);
            }
        };
        fetchBlogs();
    }, [activeTag]);

    // 根据文章数量计算标签大小等级 (1-5)
    const getTagLevel = (count) => {
        const counts = allTags.map(t => t.count);
        const max = counts.length > 0 ? Math.max(...counts) : 1;
        const ratio = count / max;
        if (ratio >= 0.8) return 5;
        if (ratio >= 0.6) return 4;
        if (ratio >= 0.4) return 3;
        if (ratio >= 0.2) return 2;
        return 1;
    };

    const tagLevelStyles = {
        1: 'text-xs px-2.5 py-1',
        2: 'text-xs px-3 py-1.5',
        3: 'text-sm px-3.5 py-1.5',
        4: 'text-sm px-4 py-2',
        5: 'text-base px-4 py-2 font-semibold',
    };

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
                <Link
                    to="/blog"
                    className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-primary transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-0.5" />
                    {t('blog.backToBlog')}
                </Link>

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Hash className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {t('blog.allTags')}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {loading
                                ? t('blog.loading')
                                : t('blog.tagsCount', { count: allTags.length })
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* 标签云 */}
            {loading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full" style={{ width: `${60 + i * 15}px` }} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                        const level = getTagLevel(tag.count);
                        const isActive = activeTag.toLowerCase() === tag.name.toLowerCase();

                        return (
                            <Link
                                key={tag.name}
                                to={isActive ? '/blog/tags' : `/blog/tags?tag=${encodeURIComponent(tag.name)}`}
                                className={`
                                    inline-flex items-center gap-1.5 rounded-full border transition-all duration-200
                                    ${tagLevelStyles[level]}
                                    ${isActive
                                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                        : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary dark:hover:text-primary hover:shadow-sm'
                                    }
                                `}
                            >
                                <Tag className="w-3 h-3" />
                                <span>{tag.name}</span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {tag.count}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* 选中标签后展示文章列表 */}
            {activeTag && (
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('blog.tagArticles', { tag: activeTag })}
                        </h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {blogsLoading ? '...' : (filteredBlogs?.length || 0)}
                        </span>
                    </div>

                    {blogsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                            {[1, 2].map(i => (
                                <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                            ))}
                        </div>
                    ) : filteredBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredBlogs.map(blog => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-sm text-slate-500">
                            {t('blog.noArticles')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogTags;

