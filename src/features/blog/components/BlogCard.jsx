import React from 'react';
import { Clock, User } from 'lucide-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * 博客卡片组件
 * 展示单篇文章的摘要信息
 */
const BlogCard = ({ blog }) => {
    return (
        <Link
            to={`/blog/${blog.id}`}
            className="group block bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200"
        >
            {/* 分类 + 日期 */}
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2.5 gap-3">
                <span className="bg-primary/5 text-primary dark:bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                    {blog.categoryName || blog.category}
                </span>
                <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {blog.date}
                </span>
                <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {blog.author}
                </span>
            </div>

            {/* 标题 */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                {blog.title}
            </h3>

            {/* 摘要 */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                {blog.summary}
            </p>

            {/* 标签 + 阅读时间 */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                {blog.tags.slice(0, 3).map((tag, index) => (
                    <span
                        key={index}
                        className="text-[10px] text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                    >
                        #{tag}
                    </span>
                ))}
                {blog.readTime && (
                    <span className="text-[10px] text-slate-400 ml-auto">
                        {blog.readTime}
                    </span>
                )}
            </div>
        </Link>
    );
};

BlogCard.propTypes = {
    blog: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
