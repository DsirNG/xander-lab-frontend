import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ChevronLeft, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/common/CodeBlock';
import SEOHead from '@components/seo/SEOHead';
import { blogService } from '../services/blogService';

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
                <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />
            );
        }
        // 行内代码
        return (
            <code
                className="px-1.5 py-0.5 rounded-md bg-slate-100  text-primary text-[0.85em] font-mono font-medium"
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
                    className="rounded-xl border border-slate-200  shadow-sm w-full"
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
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 ">
                <table {...props}>{children}</table>
            </div>
        );
    },
    // 引用块
    blockquote({ children, ...props }) {
        return (
            <blockquote
                className="border-l-4 border-primary/50 bg-primary/5 pl-4 py-2 my-4 rounded-r-lg text-slate-600  [&>p]:my-1"
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
                <div className="h-3 w-20 bg-slate-200 rounded-xl mb-6" />

                {/* 文章头部骨架 */}
                <header className="mb-8">
                    {/* 分类标签 */}
                    <div className="h-5 w-20 bg-slate-200 rounded-full mb-4" />

                    {/* 标题 */}
                    <div className="space-y-3 mb-4">
                        <div className="h-8 w-full bg-slate-200 rounded-xl" />
                        <div className="h-8 w-4/5 bg-slate-200 rounded-xl" />
                    </div>

                    {/* 元信息行：作者、日期、阅读时间 */}
                    <div className="flex items-center gap-4 mt-5">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-slate-200 rounded-full" />
                            <div className="h-3 w-16 bg-slate-200 rounded-xl" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-slate-200 rounded-full" />
                            <div className="h-3 w-24 bg-slate-200 rounded-xl" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-slate-200 rounded-full" />
                            <div className="h-3 w-14 bg-slate-200 rounded-xl" />
                        </div>
                    </div>
                </header>

                {/* Tips 提示区域骨架 */}
                <div className="mb-8 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex gap-3">
                        <div className="w-5 h-5 bg-slate-200 rounded-full flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-full bg-slate-200 rounded-xl" />
                            <div className="h-3 w-3/4 bg-slate-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* 文章段落骨架 */}
                <div className="space-y-4 mb-10">
                    <div className="h-4 w-full bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[96%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[92%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[97%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[70%] bg-slate-200 rounded-xl" />

                    <div className="pt-2" />

                    <div className="h-4 w-full bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[94%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[88%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[95%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[60%] bg-slate-200 rounded-xl" />

                    <div className="pt-2" />

                    <div className="h-4 w-full bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[91%] bg-slate-200 rounded-xl" />
                    <div className="h-4 w-[50%] bg-slate-200 rounded-xl" />
                </div>

                {/* 底部标签骨架 */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-slate-200 rounded-full" />
                        <div className="h-6 w-20 bg-slate-200 rounded-full" />
                        <div className="h-6 w-14 bg-slate-200 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-xl font-bold text-slate-900  mb-2">404</h2>
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
            {/* SEO: 每篇博客独立的 meta 信息和结构化数据 */}
            <SEOHead
                title={blog.title}
                description={blog.summary || blog.content?.slice(0, 160).replace(/[#*`\n]/g, '')}
                keywords={blog.tags?.join(', ')}
                canonical={`/blog/${blog.id}`}
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
                        logo: { '@type': 'ImageObject', url: 'https://xander-lab.dsircity.top/logo-512.png' }
                    },
                    mainEntityOfPage: {
                        '@type': 'WebPage',
                        '@id': `https://xander-lab.dsircity.top/blog/${blog.id}`
                    },
                    keywords: blog.tags?.join(', ') || ''
                }}
            />

            <Link
                to="/blog"
                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-primary transition-colors mb-6"
            >
                <ChevronLeft aria-hidden="true" className="w-4 h-4 mr-0.5" />
                {t('blog.backToBlog')}
            </Link>

            {/* 文章头部 */}
            <header className="mb-8">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wide uppercase mb-4">
                    {blog.categoryName || blog.category}
                </span>

                <h1 className="text-2xl md:text-3xl font-black text-slate-900  mb-4 leading-tight tracking-tight">
                    {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 ">
                    <div className="flex items-center">
                        <User aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <span className="font-medium text-slate-700 ">{blog.author}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <time dateTime={blog.date}>{blog.date}</time>
                    </div>
                    <div className="flex items-center">
                        <Clock aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <span>{blog.readTime}</span>
                    </div>
                    {blog.views != null && (
                        <div className="flex items-center">
                            <Eye aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            <span>{blog.views.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* 文章提示 (Tips) */}
            {blog.tips && (
                <div className="mb-8 p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-amber-600 text-xs font-bold font-mono">i</span>
                            </div>
                        </div>
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            {blog.tips}
                        </p>
                    </div>
                </div>
            )}

            {/* 文章内容 - Markdown 渲染 */}
            <div className="prose prose-slate prose-sm sm:prose-base max-w-none mb-10 prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                >
                    {blog.content}
                </ReactMarkdown>
            </div>

            {/* 底部标签 */}
            <div className="border-t border-slate-200  pt-6">
                <div className="flex flex-wrap gap-2">
                    {blog.tags.map(tag => (
                        <Link
                            key={tag}
                            to={`/blog/tags?tag=${encodeURIComponent(tag)}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-colors"
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
