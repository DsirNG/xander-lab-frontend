import React, { memo } from "react";
import { Clock, User } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * 博客卡片组件
 * 展示单篇文章的摘要信息
 */
const BlogCard = memo(({ blog }) => {
    return (
        <Link
            to={`/blog/${blog.id}/`}
            className="group block bg-canvas rounded-xl p-5 border border-border hover:border-border-strong hover:shadow-sm transition-all duration-200"
        >
            {/* 分类 + 日期 */}
            <div className="flex flex-wrap items-center text-caption text-ink-muted mb-2.5 gap-x-3 gap-y-1">
                <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full font-medium">
                    {blog.categoryName || blog.category}
                </span>
                <span className="flex items-center">
                    <Clock aria-hidden="true" className="w-3 h-3 mr-1" />
                    {blog.date}
                </span>
                <span className="flex items-center">
                    <User aria-hidden="true" className="w-3 h-3 mr-1" />
                    {blog.author}
                </span>
            </div>

            {/* 标题 */}
            <div className="text-base font-bold text-ink mb-1.5 group-hover:text-accent transition-colors line-clamp-1">
                {blog.title}
            </div>

            {/* 摘要 */}
            <div className="text-sm text-ink-muted mb-3 line-clamp-2 leading-relaxed">
                {blog.summary}
            </div>

            {/* 标签 + 阅读时间 */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-3 border-t border-border/50">
                {blog.tags.slice(0, 3).map((tag, index) => (
                    <span
                        key={index}
                        className="text-micro text-ink-muted bg-surface-muted px-2 py-0.5 rounded-full"
                    >
                        #{tag}
                    </span>
                ))}
                {blog.readTime && (
                    <span className="text-micro text-ink-faint ml-auto">
                        {blog.readTime}
                    </span>
                )}
            </div>
        </Link>
    );
});
BlogCard.displayName = "BlogCard";

BlogCard.propTypes = {
    blog: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        title: PropTypes.string.isRequired,
        summary: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
        category: PropTypes.string,
        author: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        readTime: PropTypes.string,
    }).isRequired,
};

export default BlogCard;
