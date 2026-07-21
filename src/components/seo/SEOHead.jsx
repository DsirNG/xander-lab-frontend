/**
 * SEO Head 组件 - 基于 react-helmet-async
 * 为每个页面注入独立的 title、description、OG tags 和 JSON-LD 结构化数据
 *
 * @module components/seo/SEOHead
 */

import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://xander.dsircity.top';
const SITE_NAME = 'Xander Lab';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const BRAND_KEYWORDS = 'xanderblog, 博客, xander博客, xanderlab, xander-lab';

/**
 * SEOHead - 页面级 SEO 元信息注入
 *
 * @param {Object} props
 * @param {string} props.title - 页面标题（不含站点后缀）
 * @param {string} [props.description] - 页面描述
 * @param {string} [props.keywords] - 关键词（逗号分隔）
 * @param {string} [props.canonical] - 规范化 URL 路径（如 /blog/23）
 * @param {string} [props.ogImage] - OG 封面图 URL
 * @param {string} [props.ogType='website'] - OG 类型
 * @param {Object} [props.jsonLd] - JSON-LD 结构化数据对象
 * @param {boolean} [props.noindex=false] - 是否禁止索引
 * @returns {JSX.Element}
 */
export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  jsonLd,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - UI Infrastructure & Interactive Component Showcase`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta name="keywords" content={keywords || BRAND_KEYWORDS} />
      <meta name="robots" content={noindex ? 'noindex' : 'index, follow'} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {/* JSON-LD 结构化数据 */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, BRAND_KEYWORDS };
