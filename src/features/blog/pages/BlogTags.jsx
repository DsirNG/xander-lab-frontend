import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Tag, Hash, ChevronLeft, FileText } from "lucide-react";
import { blogService } from "../services/blogService";
import BlogCard from "../components/BlogCard";
import Pagination from "@components/common/Pagination";
import SEOHead from "@components/seo/SEOHead";

const PAGE_SIZE = 10;

const tagLevelStyles = {
    1: "text-xs px-2.5 py-1",
    2: "text-xs px-3 py-1.5",
    3: "text-sm px-3.5 py-1.5",
    4: "text-sm px-4 py-2",
    5: "text-base px-4 py-2 font-semibold",
};

/**
 * 标签云页面
 * 展示所有标签，点击标签筛选相关文章
 */
const BlogTags = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [allTags, setAllTags] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [blogsLoading, setBlogsLoading] = useState(false);

    const activeTag = searchParams.get("tag") || "";

    // 加载所有标签
    useEffect(() => {
        const controller = new AbortController();

        const fetchTags = async () => {
            try {
                const tags = await blogService.getAllTags({
                    signal: controller.signal,
                });
                setAllTags(tags);
            } catch (error) {
                if (
                    error.name === "CanceledError" ||
                    error.code === "ERR_CANCELED"
                )
                    return;
                console.error("Failed to fetch tags:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();

        return () => controller.abort();
    }, []);

    // 根据选中标签加载文章（分页）
    useEffect(() => {
        if (!activeTag) {
            setFilteredBlogs([]);
            setFilteredTotal(0);
            return;
        }

        const controller = new AbortController();

        const fetchBlogs = async () => {
            setBlogsLoading(true);
            try {
                const data = await blogService.getBlogs(
                    { tag: activeTag, page, size: PAGE_SIZE },
                    { signal: controller.signal },
                );
                // 此时 data 是 PageData 对象
                setFilteredBlogs(data.records || []);
                setFilteredTotal(Number(data.total) || 0);
            } catch (error) {
                if (
                    error.name === "CanceledError" ||
                    error.code === "ERR_CANCELED"
                )
                    return;
                console.error("Failed to fetch blogs by tag:", error);
                setFilteredBlogs([]);
                setFilteredTotal(0);
            } finally {
                setBlogsLoading(false);
            }
        };
        fetchBlogs();

        return () => controller.abort();
    }, [activeTag, page]);

    // 切换标签时回到第一页
    useEffect(() => {
        setPage(1);
    }, [activeTag]);

    // 根据文章数量计算标签大小等级 (1-5)
    const getTagLevel = (count) => {
        const counts = allTags.map((t) => t.count);
        const max = counts.length > 0 ? Math.max(...counts) : 1;
        const ratio = count / max;
        if (ratio >= 0.8) return 5;
        if (ratio >= 0.6) return 4;
        if (ratio >= 0.4) return 3;
        if (ratio >= 0.2) return 2;
        return 1;
    };

    return (
        <div className="space-y-6">
            {/* SEO: 标签云页面 meta */}
            <SEOHead
                title={t("blog.allTags", "Tags")}
                description="DinQorAI 博客标签 — 按主题浏览前端技术文章"
                canonical="/blog/tags/"
            />

            {/* 页面头部 */}
            <div className="border-b border-border pb-5">
                <Link
                    to="/blog/"
                    className="inline-flex items-center text-xs font-medium text-ink-muted hover:text-accent transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-0.5" />
                    {t("blog.backToBlog")}
                </Link>

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/10">
                        <Hash className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-ink tracking-tight">
                            {t("blog.allTags")}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                            {loading
                                ? t("blog.loading")
                                : t("blog.tagsCount", {
                                      count: allTags.length,
                                  })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 标签云 */}
            {loading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className="h-8 bg-surface-muted rounded-full"
                            style={{ width: `${60 + i * 15}px` }}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                        const level = getTagLevel(tag.count);
                        const isActive =
                            activeTag.toLowerCase() === tag.name.toLowerCase();

                        return (
                            <Link
                                key={tag.name}
                                to={
                                    isActive
                                        ? "/blog/tags/"
                                        : `/blog/tags/?tag=${encodeURIComponent(tag.name)}`
                                }
                                className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 ${tagLevelStyles[level]} ${
                                    isActive
                                        ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                                        : "bg-canvas text-ink-secondary border-border hover:border-accent/50 hover:text-accent hover:shadow-sm"
                                }`}
                            >
                                <Tag className="w-3 h-3" />
                                <span>{tag.name}</span>
                                <span
                                    className={`text-micro font-medium px-1.5 py-0.5 rounded-full ${
                                        isActive
                                            ? "bg-canvas/20 text-white"
                                            : "bg-surface-muted text-ink-muted"
                                    }`}
                                >
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
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-border pb-4">
                        <FileText className="w-4 h-4 shrink-0 text-ink-faint" />
                        <div className="min-w-0 truncate text-sm font-semibold text-ink-secondary">
                            {t("blog.tagArticles", { tag: activeTag })}
                        </div>
                        <span className="text-micro font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                            {blogsLoading ? "..." : filteredTotal || 0}
                        </span>
                    </div>

                    {blogsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-48 bg-surface-muted rounded-xl"
                                />
                            ))}
                        </div>
                    ) : filteredBlogs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredBlogs.map((blog) => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                            <Pagination
                                page={page}
                                pageSize={PAGE_SIZE}
                                total={filteredTotal}
                                onPageChange={setPage}
                                hideWhenEmpty
                            />
                        </>
                    ) : (
                        <div className="text-center py-10 text-sm text-ink-muted">
                            {t("blog.noArticles")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogTags;
