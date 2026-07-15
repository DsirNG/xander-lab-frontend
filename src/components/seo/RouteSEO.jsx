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
  '/blog/': {
    title: 'Frontend Engineering Blog',
    description: 'Read Xander Lab articles on frontend architecture, React engineering, and UI component design.',
  },
  '/blog/tags/': {
    title: 'Blog Topics',
    description: 'Browse Xander Lab frontend engineering articles by topic.',
  },
};

const PRIVATE_PATHS = ['/login', '/studio', '/components/share', '/blog/publish'];

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

  if (isPrivate || isNotFound) {
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
