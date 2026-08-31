import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Tag, Hash, BookOpen, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { blogService } from "../services/blogService";

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
    const [searchTerm, setSearchTerm] = useState("");

    const activeCategory = searchParams.get("category") || "";
    const activeTag = searchParams.get("tag") || "";

    // 同步 URL 搜索参数到输入框
    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        setSearchTerm(urlSearch);
    }, [searchParams]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const [cats, recent, tags] = await Promise.all([
                    blogService.getCategories({ signal: controller.signal }),
                    blogService.getRecentBlogs(5, {
                        signal: controller.signal,
                    }),
                    blogService.getPopularTags(8, {
                        signal: controller.signal,
                    }),
                ]);
                setCategories(cats);
                setRecentPosts(recent);
                setPopularTags(tags);
            } catch (error) {
                if (
                    error.name === "CanceledError" ||
                    error.code === "ERR_CANCELED"
                )
                    return;
                console.error("Sidebar data fetch error:", error);
            }
        };
        fetchData();

        return () => controller.abort();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
            params.set("search", searchTerm.trim());
        }

        // 保留当前已选的分类和标签
        if (activeCategory) {
            params.set("category", activeCategory);
        }
        if (activeTag) {
            params.set("tag", activeTag);
        }

        const queryString = params.toString();
        navigate(queryString ? `/blog/?${queryString}` : "/blog/");
        onNavigate?.();
    };

    return (
        <div className="space-y-6">
            {/* 搜索框 */}
            <section>
                <div className="text-caption font-bold uppercase tracking-widest text-ink-faint mb-3">
                    {t("blog.search")}
                </div>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder={t("blog.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label={t("blog.search")}
                        className="w-full h-11 pl-9 pr-4 bg-canvas border border-border rounded-xl text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                </form>
            </section>

            {/* 分类列表 */}
            <section>
                <div className="text-caption font-bold uppercase tracking-widest text-ink-faint mb-3 flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1.5" />
                    {t("blog.categories")}
                </div>
                <ul className="space-y-1">
                    <li>
                        <Link
                            to="/blog/"
                            onClick={() => onNavigate?.()}
                            className={`flex items-center justify-between px-2 py-2.5 rounded-lg text-sm transition-colors ${
                                !activeCategory
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-ink-secondary hover:bg-surface-muted"
                            }`}
                        >
                            <span>{t("blog.allCategories")}</span>
                        </Link>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link
                                to={`/blog/?category=${cat.id}`}
                                onClick={() => onNavigate?.()}
                                className={`flex items-center justify-between px-2 py-2.5 rounded-lg text-sm transition-colors ${
                                    activeCategory === cat.id
                                        ? "bg-accent/10 text-accent font-medium"
                                        : "text-ink-secondary hover:bg-surface-muted"
                                }`}
                            >
                                <span>{cat.name}</span>
                                <span
                                    className={`text-micro font-medium px-1.5 py-0.5 rounded-full transition-colors ${
                                        activeCategory === cat.id
                                            ? "bg-accent/20 text-accent"
                                            : "bg-surface-muted text-ink-muted"
                                    }`}
                                >
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
                    <div className="text-caption font-bold uppercase tracking-widest text-ink-faint flex items-center">
                        <Hash className="w-3.5 h-3.5 mr-1.5" />
                        {t("blog.popularTags")}
                    </div>
                    <Link
                        to="/blog/tags/"
                        onClick={() => onNavigate?.()}
                        className="text-micro text-ink-faint hover:text-accent transition-colors flex items-center gap-0.5"
                    >
                        {t("blog.viewAllTags")}
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {popularTags.map((tag) => {
                        const isActive =
                            activeTag.toLowerCase() === tag.name.toLowerCase();
                        return (
                            <Link
                                key={tag.name}
                                to={
                                    isActive
                                        ? "/blog/"
                                        : `/blog/?tag=${encodeURIComponent(tag.name)}`
                                }
                                onClick={() => onNavigate?.()}
                                className={`inline-flex items-center gap-1 text-caption px-2.5 py-1.5 rounded-full border transition-all ${
                                    isActive
                                        ? "bg-accent text-white border-accent"
                                        : "bg-canvas/60 text-ink-muted border-border hover:border-accent/50 hover:text-accent"
                                }`}
                            >
                                <span>{tag.name}</span>
                                <span
                                    className={`text-micro ${isActive ? "text-white/70" : "text-ink-faint"}`}
                                >
                                    {tag.count}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* 最新发布 */}
            <section>
                <div className="text-caption font-bold uppercase tracking-widest text-ink-faint mb-3 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    {t("blog.recentPosts")}
                </div>
                <div className="space-y-3">
                    {recentPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/blog/${post.id}/`}
                            onClick={() => onNavigate?.()}
                            className="block group"
                        >
                            <div className="text-sm font-medium text-ink-secondary group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-1">
                                {post.title}
                            </div>
                            <span className="text-caption text-ink-faint">
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
