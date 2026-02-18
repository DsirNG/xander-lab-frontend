import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ChevronLeft, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { blogService } from '../services/blogService';

/**
 * Markdown 代码块组件
 * 支持语法高亮 + 复制按钮
 */
const CodeBlock = ({ language, children }) => {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 my-4">
            {/* 头部：语言标签 + 复制按钮 */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-950 border-b border-slate-700">
                <span className="text-xs font-mono font-medium text-slate-400">
                    {language || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">已复制</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            <span>复制</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    fontSize: '0.85rem',
                    background: '#0f172a',
                    lineHeight: '1.7',
                    borderRadius: '0',
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

/**
 * Markdown 自定义渲染组件映射
 */
const markdownComponents = {
    // 代码块渲染
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        // 判断是否是代码块（有 language class 标识）
        if (match) {
            return (
                <CodeBlock language={match[1]}>
                    {children}
                </CodeBlock>
            );
        }
        // 行内代码
        return (
            <code
                className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-primary dark:text-indigo-400 text-[0.85em] font-mono font-medium"
                {...props}
            >
                {children}
            </code>
        );
    },
    // 自定义链接（新窗口打开外部链接）
    a({ href, children, ...props }) {
        const isExternal = href && (href.startsWith('http') || href.startsWith('//'));
        return (
            <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-primary hover:text-primary-dark underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                {...props}
            >
                {children}
            </a>
        );
    },
    // 图片渲染
    img({ src, alt, ...props }) {
        return (
            <figure className="my-6">
                <img
                    src={src}
                    alt={alt}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full"
                    loading="lazy"
                    {...props}
                />
                {alt && (
                    <figcaption className="text-center text-xs text-slate-400 mt-2">
                        {alt}
                    </figcaption>
                )}
            </figure>
        );
    },
    // 表格包裹响应式容器
    table({ children, ...props }) {
        return (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <table {...props}>{children}</table>
            </div>
        );
    },
    // 引用块
    blockquote({ children, ...props }) {
        return (
            <blockquote
                className="border-l-4 border-primary/50 bg-primary/5 dark:bg-primary/10 pl-4 py-2 my-4 rounded-r-lg text-slate-600 dark:text-slate-300 [&>p]:my-1"
                {...props}
            >
                {children}
            </blockquote>
        );
    },
};

/**
 * 博客详情页
 * 展示单篇文章的完整内容，使用 Markdown 渲染
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
                    {blog.categoryName || blog.category}
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

            {/* 文章内容 - Markdown 渲染 */}
            <div className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none mb-10 prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                >
                    {blog.content}
                </ReactMarkdown>
            </div>

            {/* 底部标签 */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="flex flex-wrap gap-2">
                    {blog.tags.map(tag => (
                        <Link
                            key={tag}
                            to={`/blog/tags?tag=${encodeURIComponent(tag)}`}
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
