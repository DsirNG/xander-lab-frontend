import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Tag, Hash, BookOpen, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { blogService } from '../services/blogService';

/**
 * 博客侧边栏组件
 * 包含搜索、分类筛选、热门标签、最新发布
 * @param {Function} onNavigate - 导航回调，移动端点击后关闭抽屉
 */
const BlogSidebar = ({ onNavigate }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const activeCategory = searchParams.get('category') || '';
    const activeTag = searchParams.get('tag') || '';

    // 同步 URL 搜索参数到输入框
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        setSearchTerm(urlSearch);
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, recent, tags] = await Promise.all([
                    blogService.getCategories(),
                    blogService.getRecentBlogs(5),
                    blogService.getPopularTags(8)
                ]);
                setCategories(cats);
                setRecentPosts(recent);
                setPopularTags(tags);
            } catch (error) {
                console.error('Sidebar data fetch error:', error);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }

        // 保留当前已选的分类和标签
        if (activeCategory) {
            params.set('category', activeCategory);
        }
        if (activeTag) {
            params.set('tag', activeTag);
        }

        const queryString = params.toString();
        navigate(queryString ? `/blog?${queryString}` : '/blog');
        onNavigate?.();
    };

    return (
        <div className="space-y-6">
            {/* 搜索框 */}
            <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    {t('blog.search')}
                </h3>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder={t('blog.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                </form>
            </section>

            {/* 分类列表 */}
            <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1.5" />
                    {t('blog.categories')}
                </h3>
                <ul className="space-y-1">
                    <li>
                        <Link
                            to="/blog"
                            onClick={() => onNavigate?.()}
                            className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${!activeCategory
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span>{t('blog.allCategories')}</span>
                        </Link>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link
                                to={`/blog?category=${cat.id}`}
                                onClick={() => onNavigate?.()}
                                className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span>{cat.name}</span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${activeCategory === cat.id
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                    {cat.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 热门标签 */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                        <Hash className="w-3.5 h-3.5 mr-1.5" />
                        {t('blog.popularTags')}
                    </h3>
                    <Link
                        to="/blog/tags"
                        onClick={() => onNavigate?.()}
                        className="text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-0.5"
                    >
                        {t('blog.viewAllTags')}
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {popularTags.map((tag) => {
                        const isActive = activeTag.toLowerCase() === tag.name.toLowerCase();
                        return (
                            <Link
                                key={tag.name}
                                to={isActive ? '/blog' : `/blog?tag=${encodeURIComponent(tag.name)}`}
                                onClick={() => onNavigate?.()}
                                className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-all ${isActive
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary'
                                    }`}
                            >
                                <span>{tag.name}</span>
                                <span className={`text-[9px] ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                                    {tag.count}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* 最新发布 */}
            <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    {t('blog.recentPosts')}
                </h3>
                <div className="space-y-3">
                    {recentPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/blog/${post.id}`}
                            onClick={() => onNavigate?.()}
                            className="block group"
                        >
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
                                {post.title}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                                {post.date} · {post.readTime}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

BlogSidebar.propTypes = {
    onNavigate: PropTypes.func,
};

export default BlogSidebar;
