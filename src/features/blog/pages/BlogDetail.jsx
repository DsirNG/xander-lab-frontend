import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ChevronLeft, Eye, BookOpen, Minimize2 } from 'lucide-react';
import SEOHead from '@components/seo/SEOHead';
import { blogService } from '../services/blogService';
import BlogMarkdown from '../components/BlogMarkdown';
import usePureReading from '@/hooks/usePureReading';

/**
 * Markdown 自定义渲染组件映射
 */
/* const markdownComponents = {
    // 代码块渲染
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        // 判断是否是代码块（有 language class 标识）
        if (match) {
            return (
                <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />
            );
        }
        // 行内代码
        return (
            <code
                className="px-1.5 py-0.5 rounded-md bg-surface-muted text-accent text-[0.85em] font-mono font-medium"
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
                className="text-accent hover:text-accent-fg underline underline-offset-2 decoration-accent/30 hover:decoration-accent transition-colors"
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
                    className="rounded-xl border border-border shadow-sm w-full"
                    loading="lazy"
                    {...props}
                />
                {alt && (
                    <figcaption className="text-center text-xs text-ink-faint mt-2">
                        {alt}
                    </figcaption>
                )}
            </figure>
        );
    },
    // 表格包裹响应式容器
    table({ children, ...props }) {
        return (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table {...props}>{children}</table>
            </div>
        );
    },
    // 引用块
    blockquote({ children, ...props }) {
        return (
            <blockquote
                className="border-l-4 border-accent/50 bg-accent/5 pl-4 py-2 my-4 rounded-r-lg text-ink-secondary [&>div]:my-1"
                {...props}
            >
                {children}
            </blockquote>
        );
    },
}; */

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
    const { isPureReading, togglePureReading } = usePureReading();

    useEffect(() => {
        const controller = new AbortController();

        const fetchBlog = async () => {
            setLoading(true);
            try {
                const data = await blogService.getBlogById(id, { signal: controller.signal });
                setBlog(data);
                // 记录阅读（fire-and-forget，后端按 userId/IP 24h 去重防刷）
                blogService.recordView(id).catch(() => {});
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();

        return () => controller.abort();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-3xl animate-pulse">
                {/* 返回链接占位 */}
                <div className="h-3 w-20 bg-border rounded-xl mb-6" />

                {/* 文章头部骨架 */}
                <header className="mb-8">
                    {/* 分类标签 */}
                    <div className="h-5 w-20 bg-border rounded-full mb-4" />

                    {/* 标题 */}
                    <div className="space-y-3 mb-4">
                        <div className="h-8 w-full bg-border rounded-xl" />
                        <div className="h-8 w-4/5 bg-border rounded-xl" />
                    </div>

                    {/* 元信息行：作者、日期、阅读时间 */}
                    <div className="flex items-center gap-4 mt-5">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-border rounded-full" />
                            <div className="h-3 w-16 bg-border rounded-xl" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-border rounded-full" />
                            <div className="h-3 w-24 bg-border rounded-xl" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-border rounded-full" />
                            <div className="h-3 w-14 bg-border rounded-xl" />
                        </div>
                    </div>
                </header>

                {/* Tips 提示区域骨架 */}
                <div className="mb-8 p-4 rounded-xl border border-border bg-surface">
                    <div className="flex gap-3">
                        <div className="w-5 h-5 bg-border rounded-full flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-full bg-border rounded-xl" />
                            <div className="h-3 w-3/4 bg-border rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* 文章段落骨架 */}
                <div className="space-y-4 mb-10">
                    <div className="h-4 w-full bg-border rounded-xl" />
                    <div className="h-4 w-[96%] bg-border rounded-xl" />
                    <div className="h-4 w-[92%] bg-border rounded-xl" />
                    <div className="h-4 w-[97%] bg-border rounded-xl" />
                    <div className="h-4 w-[70%] bg-border rounded-xl" />

                    <div className="pt-2" />

                    <div className="h-4 w-full bg-border rounded-xl" />
                    <div className="h-4 w-[94%] bg-border rounded-xl" />
                    <div className="h-4 w-[88%] bg-border rounded-xl" />
                    <div className="h-4 w-[95%] bg-border rounded-xl" />
                    <div className="h-4 w-[60%] bg-border rounded-xl" />

                    <div className="pt-2" />

                    <div className="h-4 w-full bg-border rounded-xl" />
                    <div className="h-4 w-[91%] bg-border rounded-xl" />
                    <div className="h-4 w-[50%] bg-border rounded-xl" />
                </div>

                {/* 底部标签骨架 */}
                <div className="border-t border-border pt-6">
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-border rounded-full" />
                        <div className="h-6 w-20 bg-border rounded-full" />
                        <div className="h-6 w-14 bg-border rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="text-xl font-bold text-ink mb-2">404</div>
                <div className="text-sm text-ink-muted mb-5">{t('blog.articleNotFound')}</div>
                <Link
                    to="/blog/"
                    className="px-5 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                    {t('blog.backToBlog')}
                </Link>
            </div>
        );
    }

    return (
        <article className="max-w-3xl w-full">
            {/* 浮动退出纯净阅读按钮 */}
            {isPureReading && (
                <div className="fixed top-5 right-6 z-50 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={togglePureReading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink/90 text-canvas hover:bg-ink backdrop-blur-md shadow-lg text-xs font-bold transition-all hover:scale-105 border border-white/20 active:scale-95 cursor-pointer"
                        title={t('blog.pureReadingHint', '纯净阅读模式 (按 Esc 退出)')}
                    >
                        <Minimize2 className="w-4 h-4 text-accent" />
                        <span>{t('blog.exitPureReading', '退出纯净阅读')}</span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-canvas/20 rounded text-canvas/80 ml-1">
                            ESC
                        </kbd>
                    </button>
                </div>
            )}

            {/* SEO: 每篇博客独立的 meta 信息和结构化数据 */}
            <SEOHead
                title={blog.title}
                description={blog.summary || blog.content?.slice(0, 160).replace(/[#*`\n]/g, '')}
                keywords={blog.tags?.join(', ')}
                canonical={`/blog/${blog.id}/`}
                ogType="article"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: blog.title,
                    description: blog.summary || '',
                    author: { '@type': 'Person', name: blog.author },
                    datePublished: blog.date,
                    publisher: {
                        '@type': 'Organization',
                        name: 'Xander Lab',
                        logo: { '@type': 'ImageObject', url: 'https://xander.dsircity.top/logo-512.png' }
                    },
                    mainEntityOfPage: {
                        '@type': 'WebPage',
                        '@id': `https://xander.dsircity.top/blog/${blog.id}/`
                    },
                    keywords: blog.tags?.join(', ') || ''
                }}
            />

            <div className="flex items-center justify-between mb-6">
                <Link
                    to="/blog/"
                    className="inline-flex items-center text-xs font-medium text-ink-muted hover:text-accent transition-colors"
                >
                    <ChevronLeft aria-hidden="true" className="w-4 h-4 mr-0.5" />
                    {t('blog.backToBlog')}
                </Link>

            {/* 窗口固定纯净阅读按钮 (非纯净模式下固定悬浮在窗口右下角) */}
            {!isPureReading && (
                <div className="fixed bottom-8 right-8 z-40">
                    <button
                        type="button"
                        onClick={togglePureReading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface/90 text-ink hover:text-accent hover:border-accent backdrop-blur-md shadow-xl border border-border text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
                        title={t('blog.pureReadingHint', '纯净阅读模式 (按 Esc 退出)')}
                    >
                        <BookOpen className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                        <span>{t('blog.pureReading', '纯净阅读')}</span>
                    </button>
                </div>
            )}

            {!isPureReading && (
                <button
                    type="button"
                    onClick={togglePureReading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted text-ink-secondary hover:bg-accent/10 hover:text-accent text-xs font-bold transition-all shadow-xs border border-border/60 cursor-pointer"
                    title={t('blog.pureReadingHint', '纯净阅读模式 (按 Esc 退出)')}
                >
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    <span>{t('blog.pureReading', '纯净阅读')}</span>
                </button>
            )}
            </div>

            {/* 文章头部 */}
            <header className="mb-8">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-micro font-bold tracking-wide uppercase mb-4">
                    {blog.categoryName || blog.category}
                </span>

                <div className="text-2xl md:text-3xl font-black text-ink mb-4 leading-tight tracking-tight">
                    {blog.title}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                    <div className="flex items-center">
                        <User aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-ink-faint" />
                        <span className="font-medium text-ink-secondary">{blog.author}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-ink-faint" />
                        <time dateTime={blog.date}>{blog.date}</time>
                    </div>
                    <div className="flex items-center">
                        <Clock aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-ink-faint" />
                        <span>{blog.readTime}</span>
                    </div>
                    {blog.views != null && (
                        <div className="flex items-center">
                            <Eye aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-ink-faint" />
                            <span>{blog.views.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* 文章提示 (Tips) */}
            {blog.tips && (
                <div className="mb-8 p-4 rounded-xl border border-warning/30 bg-warning-soft">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-warning-soft flex items-center justify-center ring-1 ring-warning/30">
                                <span className="text-warning text-xs font-bold font-mono">i</span>
                            </div>
                        </div>
                        <div className="text-sm text-warning-fg leading-relaxed font-medium break-words">
                            {blog.tips}
                        </div>
                    </div>
                </div>
            )}

            {/* 文章内容 - Markdown 渲染 */}
            <BlogMarkdown content={blog.content} className="mb-10" />

            {/* 底部标签 */}
            <div className="border-t border-border pt-6">
                <div className="flex flex-wrap gap-2">
                    {blog.tags.map(tag => (
                        <Link
                            key={tag}
                            to={`/blog/tags/?tag=${encodeURIComponent(tag)}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-muted text-ink-secondary hover:bg-accent hover:text-white transition-colors"
                        >
                            <Tag aria-hidden="true" className="w-3 h-3 mr-1.5" />
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default BlogDetail;
