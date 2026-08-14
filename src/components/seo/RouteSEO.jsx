import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead, { SITE_URL } from './SEOHead';

const PUBLIC_PAGES = {
  '/': {
    titleKey: 'seo.home.title',
    descriptionKey: 'seo.home.description',
  },
  '/infra/': {
    titleKey: 'seo.infra.title',
    descriptionKey: 'seo.infra.description',
  },
  '/modules/': {
    titleKey: 'seo.modules.title',
    descriptionKey: 'seo.modules.description',
  },
  '/components/': {
    titleKey: 'seo.components.title',
    descriptionKey: 'seo.components.description',
  },
};

const PRIVATE_PATHS = ['/login', '/workspace', '/components/share'];

// 页面自身渲染了独立 SEOHead 的路径前缀，RouteSEO 不重复注入
const PAGE_OWNED_SEO_PREFIXES = ['/blog/'];

function normalisePathname(pathname) {
  if (pathname === '/') return pathname;
  return `${pathname.replace(/\/+$/, '')}/`;
}

export default function RouteSEO() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const canonical = normalisePathname(pathname);
  const page = PUBLIC_PAGES[canonical];
  const isPrivate = PRIVATE_PATHS.some(path => canonical === `${path}/` || canonical.startsWith(`${path}/`));
  const isNotFound = !page && !canonical.startsWith('/blog/') && !canonical.startsWith('/components/') && !canonical.startsWith('/modules/') && !canonical.startsWith('/infra/');

  if (page) {
    return <SEOHead title={t(page.titleKey)} description={t(page.descriptionKey)} canonical={canonical} />;
  }

  if (isPrivate) {
    return <SEOHead canonical={canonical} noindex />;
  }

  // 博客列表/详情/标签页已由页面级 SEOHead 提供独立 meta，跳过全局注入
  if (PAGE_OWNED_SEO_PREFIXES.some(prefix => canonical.startsWith(prefix))) {
    return null;
  }

  if (isNotFound) {
    return <SEOHead canonical={canonical} noindex />;
  }

  return (
    <SEOHead
      title={t('seo.default.title')}
      description={t('seo.default.description')}
      canonical={canonical}
    />
  );
}

export { PUBLIC_PAGES, SITE_URL };
