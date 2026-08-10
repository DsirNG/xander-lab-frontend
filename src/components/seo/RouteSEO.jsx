import { useLocation } from 'react-router-dom';
import SEOHead, { SITE_URL } from './SEOHead';

const PUBLIC_PAGES = {
  '/': {
    title: 'UI Infrastructure & Interactive Component Showcase',
    description: 'Explore Xander Lab UI infrastructure, React components, drag-and-drop systems, anchored overlays, and frontend architecture demonstrations.',
  },
  '/infra/': {
    title: 'UI Infrastructure Systems',
    description: 'Learn how Xander Lab approaches reusable UI infrastructure, positioning systems, and resilient frontend architecture.',
  },
  '/modules/': {
    title: 'Interactive Frontend Modules',
    description: 'Explore practical frontend modules and interactive demonstrations built with React at Xander Lab.',
  },
  '/components/': {
    title: 'React Component Showcase',
    description: 'Browse reusable React components, implementation guides, and interactive UI examples from Xander Lab.',
  },
};

const PRIVATE_PATHS = ['/login', '/workspace', '/components/share', '/blog/publish', '/blog/agent', '/profile'];

// 页面自身渲染了独立 SEOHead 的路径前缀，RouteSEO 不重复注入
const PAGE_OWNED_SEO_PREFIXES = ['/blog/'];

function normalisePathname(pathname) {
  if (pathname === '/') return pathname;
  return `${pathname.replace(/\/+$/, '')}/`;
}

export default function RouteSEO() {
  const { pathname } = useLocation();
  const canonical = normalisePathname(pathname);
  const page = PUBLIC_PAGES[canonical];
  const isPrivate = PRIVATE_PATHS.some(path => canonical === `${path}/` || canonical.startsWith(`${path}/`));
  const isNotFound = !page && !canonical.startsWith('/blog/') && !canonical.startsWith('/components/') && !canonical.startsWith('/modules/') && !canonical.startsWith('/infra/');

  if (page) {
    return <SEOHead {...page} canonical={canonical} />;
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
      title="Frontend Engineering Resource"
      description="Explore Xander Lab's frontend engineering resources and interactive UI demonstrations."
      canonical={canonical}
    />
  );
}

export { PUBLIC_PAGES, SITE_URL };
