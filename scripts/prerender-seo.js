#!/usr/bin/env node

/**
 * SEO 预渲染脚本
 * 在 Vite 构建完成后，为博客页面生成独立的 HTML 文件，
 * 包含正确的 meta tags、OG tags、JSON-LD 结构化数据和文章摘要内容。
 *
 * 搜索引擎爬虫（尤其是百度）可以直接读取 HTML 内容，无需执行 JS。
 *
 * 用法: node scripts/prerender-seo.js
 *
 * @module scripts/prerender-seo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ 配置 ============
const SITE_URL = 'https://xander.dsircity.top';
// 构建环境可通过 SEO_API_BASE 覆盖默认公网 API。生产 Docker 构建默认由
// docker-compose 注入 host.docker.internal:30002/api，以直连部署机 Spring Boot 服务。
const API_BASE = process.env.SEO_API_BASE || 'https://xander.dsircity.top/api';
const API_TIMEOUT_MS = 15_000;
const API_RETRY_COUNT = 3;
const DIST_DIR = path.join(__dirname, '..', 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const BRAND_KEYWORDS = 'xanderblog, 博客, xander博客, xanderlab, xander-lab';

// ============ 工具函数 ============

/**
 * 从 Markdown 内容中提取纯文本摘要
 * @param {string} markdown - Markdown 原文
 * @param {number} [maxLen=160] - 最大长度
 * @returns {string} 纯文本摘要
 */
function extractSummary(markdown, maxLen = 160) {
  if (!markdown) return '';
  return markdown
    .replace(/#{1,6}\s/g, '')        // 去掉标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1')  // 粗体
    .replace(/\*(.*?)\*/g, '$1')      // 斜体
    .replace(/`(.*?)`/g, '$1')        // 行内代码
    .replace(/```[\s\S]*?```/g, '')   // 代码块
    .replace(/!\[.*?\]\(.*?\)/g, '')  // 图片
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // 链接保留文字
    .replace(/>\s*/g, '')             // 引用
    .replace(/\n+/g, ' ')            // 换行转空格
    .trim()
    .slice(0, maxLen);
}

/**
 * 转义 HTML 特殊字符，防止注入
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 从生产 API 获取博客列表（全量）
 * @returns {Promise<Array>} 博客列表
 */
async function fetchAllBlogs() {
  async function requestJson(url) {
    let lastError;

    for (let attempt = 1; attempt <= API_RETRY_COUNT; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
        if (!response.ok) {
          throw new Error(`API 返回 HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        lastError = error;
        const cause = error.cause;
        const detail = cause
          ? ` (${cause.code || cause.name || 'network error'}: ${cause.message || cause})`
          : '';
        if (attempt < API_RETRY_COUNT) {
          console.warn(`  博客 API 第 ${attempt} 次请求失败：${error.message}${detail}，正在重试...`);
        }
      }
    }

    const finalCause = lastError.cause;
    const finalDetail = finalCause
      ? ` (${finalCause.code || finalCause.name || 'network error'}: ${finalCause.message || finalCause})`
      : '';
    throw new Error(`博客 API 连续 ${API_RETRY_COUNT} 次请求失败：${lastError.message}${finalDetail}`);
  }

  // 先获取第一页，确定总数
  const firstJson = await requestJson(`${API_BASE}/blog/posts?page=1&size=100`);
  const data = firstJson.data || firstJson;
  const records = data.records || [];
  const total = data.total || records.length;

  // 如果第一页已经拿全了
  if (records.length >= total) return records;

  // 否则继续翻页（理论上 100 条/页够用了）
  const allRecords = [...records];
  let page = 2;
  while (allRecords.length < total) {
    const json = await requestJson(`${API_BASE}/blog/posts?page=${page}&size=100`);
    const pageData = json.data || json;
    const pageRecords = pageData.records || [];
    if (pageRecords.length === 0) break;
    allRecords.push(...pageRecords);
    page++;
  }
  return allRecords;
}

/**
 * 生成博客详情页的 HTML meta 片段
 * @param {Object} blog - 博客对象
 * @returns {string} HTML meta 标签字符串
 */
function buildBlogMetaTags(blog) {
  const title = escapeHtml(blog.title);
  const desc = escapeHtml(blog.summary || extractSummary(blog.content));
  const keywords = BRAND_KEYWORDS;
  const url = `${SITE_URL}/blog/${blog.id}/`;

  return `
    <!-- Prerendered SEO: Blog #${blog.id} -->
    <title>${title} | Xander Lab</title>
    <meta name="title" content="${title} | Xander Lab" />
    <meta name="description" content="${desc}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title} | Xander Lab" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:site_name" content="Xander Lab" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} | Xander Lab" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
  `.trim();
}

/**
 * 生成博客详情页的 JSON-LD 结构化数据
 * @param {Object} blog
 * @returns {string} JSON-LD script 标签
 */
function buildBlogJsonLd(blog) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.summary || extractSummary(blog.content),
    author: { '@type': 'Person', name: blog.author || 'Xander Lab' },
    datePublished: blog.date || new Date().toISOString().split('T')[0],
    publisher: {
      '@type': 'Organization',
      name: 'Xander Lab',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-512.png` }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${blog.id}/`
    },
    keywords: (blog.tags || []).join(', ')
  };
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

/**
 * 生成博客详情页的 noscript 回退内容（对百度爬虫尤其重要）
 * @param {Object} blog
 * @returns {string} HTML 内容
 */
function buildBlogNoscriptContent(blog) {
  const tags = (blog.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join(' ');
  const summary = blog.summary || extractSummary(blog.content, 500);

  return `
    <noscript>
      <article>
        <header>
          <span>${escapeHtml(blog.categoryName || blog.category || '')}</span>
          <h1>${escapeHtml(blog.title)}</h1>
          <p>
            <span>${escapeHtml(blog.author || '')}</span>
            <time datetime="${blog.date || ''}">${blog.date || ''}</time>
            <span>${escapeHtml(blog.readTime || '')}</span>
          </p>
        </header>
        <div>
          <p>${escapeHtml(summary)}</p>
        </div>
        <footer>${tags}</footer>
      </article>
    </noscript>
  `.trim();
}

/**
 * 基于 dist/index.html 生成某个路由的独立 HTML 文件
 * 替换 <title> 和 meta 区域，注入路由特定内容
 *
 * @param {string} baseHtml - dist/index.html 原始内容
 * @param {Object} options
 * @param {string} options.metaTags - 替换的 meta 标签 HTML
 * @param {string} options.jsonLd - JSON-LD script 标签
 * @param {string} [options.noscriptContent] - noscript 回退内容
 * @returns {string} 完整 HTML
 */
function generatePageHtml(baseHtml, { metaTags, jsonLd, noscriptContent }) {
  let html = baseHtml;

  // 1. 先从原始 HTML 中移除旧的 canonical（在注入新 meta 之前）
  html = html.replace(/<link rel="canonical"[^>]*\/?>\s*\n?/i, '');

  // 2. 移除旧的 <title>
  html = html.replace(/<title>[^<]*<\/title>\s*\n?/i, '');

  // 3. 替换主 meta 标签区域（从 Primary Meta Tags 到 Twitter Card 结束）
  html = html.replace(
    /<!-- Primary Meta Tags -->[\s\S]*?<!-- Twitter Card -->[\s\S]*?(?=<!-- Additional SEO|$)/i,
    metaTags + '\n'
  );

  // 4. 替换原有的 JSON-LD
  html = html.replace(
    /<!-- Structured Data \(JSON-LD\) -->[\s\S]*?<\/script>\s*/i,
    `<!-- Structured Data (JSON-LD) -->\n    ${jsonLd}\n`
  );

  // 5. 替换 noscript 内容（如果有提供）
  if (noscriptContent) {
    html = html.replace(
      /<noscript>[\s\S]*?<\/noscript>/i,
      noscriptContent
    );
  }

  return html;
}

/**
 * 确保目录存在并写入 HTML 文件
 * @param {string} route - 路由路径（如 /blog/23）
 * @param {string} html - HTML 内容
 */
function writeRouteHtml(route, html) {
  const dir = path.join(DIST_DIR, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

/**
 * 生成动态 sitemap.xml（包含所有博客 URL）
 * @param {Array} blogs - 博客列表
 */
function generateDynamicSitemap(blogs) {
  const today = new Date().toISOString().split('T')[0];

  // 静态页面
  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/blog/', priority: '0.8', changefreq: 'daily' },
    { loc: '/blog/tags/', priority: '0.6', changefreq: 'weekly' },
    { loc: '/components', priority: '0.8', changefreq: 'weekly' },
    { loc: '/modules/drag-drop/', priority: '0.7', changefreq: 'monthly' },
  ];

  const urls = [...staticUrls];

  // 博客文章页
  for (const blog of blogs) {
    urls.push({
      loc: `/blog/${blog.id}/`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: blog.date || today,
    });
  }

  const urlEntries = urls.map(u => {
    const lastmod = u.lastmod || today;
    return `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`  sitemap.xml 已更新: ${urls.length} 个 URL`);
}

// ============ 主流程 ============

async function main() {
  console.log('\n🔧 SEO 预渲染开始...\n');

  // 检查 dist/index.html 是否存在
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('❌ dist/index.html 不存在，请先运行 vite build');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  let blogCount = 0;

  // ---- 1. 博客详情页预渲染 ----
  console.log('📝 获取博客列表...');
  const blogs = await fetchAllBlogs();

  if (blogs.length > 0) {
    console.log(`  找到 ${blogs.length} 篇博客，开始生成 HTML...`);

    for (const blog of blogs) {
      const metaTags = buildBlogMetaTags(blog);
      const jsonLd = buildBlogJsonLd(blog);
      const noscript = buildBlogNoscriptContent(blog);
      const html = generatePageHtml(baseHtml, { metaTags, jsonLd, noscriptContent: noscript });
      writeRouteHtml(`/blog/${blog.id}`, html);
      blogCount++;
    }
    console.log(`  ✅ ${blogCount} 篇博客 HTML 已生成`);
  }

  // ---- 2. 博客列表页预渲染 ----
  console.log('📋 生成博客列表页...');
  const blogListMeta = `
    <title>Blog | Xander Lab</title>
    <meta name="title" content="Blog | Xander Lab" />
    <meta name="description" content="Xander Lab 技术博客 — 前端架构、React 实践、UI 组件设计等技术文章" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${SITE_URL}/blog/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_URL}/blog/" />
    <meta property="og:title" content="Blog | Xander Lab" />
    <meta property="og:description" content="Xander Lab 技术博客 — 前端架构、React 实践、UI 组件设计等技术文章" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:site_name" content="Xander Lab" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Blog | Xander Lab" />
    <meta name="twitter:description" content="Xander Lab 技术博客 — 前端架构、React 实践、UI 组件设计等技术文章" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
  `.trim();

  const blogListJsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog | Xander Lab',
    description: 'Technical articles on frontend architecture, React patterns, and UI component design',
    url: `${SITE_URL}/blog/`,
    isPartOf: { '@id': `${SITE_URL}/#website` }
  })}</script>`;

  const blogListHtml = generatePageHtml(baseHtml, {
    metaTags: blogListMeta,
    jsonLd: blogListJsonLd,
  });
  writeRouteHtml('/blog', blogListHtml);
  console.log('  ✅ /blog/index.html 已生成');

  // ---- 3. 标签页预渲染 ----
  console.log('🏷️  生成标签页...');
  const tagsMeta = `
    <title>Tags | Xander Lab</title>
    <meta name="title" content="Tags | Xander Lab" />
    <meta name="description" content="Xander Lab 博客标签 — 按主题浏览前端技术文章" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${SITE_URL}/blog/tags/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_URL}/blog/tags/" />
    <meta property="og:title" content="Tags | Xander Lab" />
    <meta property="og:description" content="Xander Lab 博客标签 — 按主题浏览前端技术文章" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:site_name" content="Xander Lab" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Tags | Xander Lab" />
    <meta name="twitter:description" content="Xander Lab 博客标签 — 按主题浏览前端技术文章" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
  `.trim();

  const tagsJsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tags | Xander Lab',
    url: `${SITE_URL}/blog/tags/`,
  })}</script>`;

  const tagsHtml = generatePageHtml(baseHtml, {
    metaTags: tagsMeta,
    jsonLd: tagsJsonLd,
  });
  writeRouteHtml('/blog/tags', tagsHtml);
  console.log('  ✅ /blog/tags/index.html 已生成');

  // ---- 4. 生成动态 sitemap ----
  console.log('🗺️  生成 sitemap.xml...');
  generateDynamicSitemap(blogs);

  // ---- 5. 汇总 ----
  console.log(`\n✅ SEO 预渲染完成！`);
  console.log(`   博客详情页: ${blogCount} 个`);
  console.log(`   博客列表页: 1 个 (/blog)`);
  console.log(`   标签页:     1 个 (/blog/tags)`);
  console.log(`   sitemap:    ${blogCount + 5} 个 URL`);
  console.log('');
}

main().catch(err => {
  console.error('❌ 预渲染失败，已阻止发布以保留现有 sitemap:', err.message);
  process.exit(1);
});
