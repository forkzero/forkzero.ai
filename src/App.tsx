import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { getProductByGettingStartedPath } from './data/products'

// Each page is its own chunk, loaded on demand. scripts/prerender.ts adds
// <link rel="modulepreload"> for the right chunk to each pre-rendered page
// (see PAGE_SOURCES there), so the chunk downloads alongside the entry bundle.
/** Dynamic import for each page; App.test.ts checks each resolves to a component. */
export const pageLoaders = {
  home: () => import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
  reader: () => import('./pages/ReaderPage').then((m) => ({ default: m.ReaderPage })),
  blog: () => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })),
  gettingStarted: () => import('./pages/GettingStartedPage').then((m) => ({ default: m.GettingStartedPage })),
  designSystem: () => import('./pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })),
  privacy: () => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
}

const HomePage = lazy(pageLoaders.home)
const ReaderPage = lazy(pageLoaders.reader)
const BlogPage = lazy(pageLoaders.blog)
const GettingStartedPage = lazy(pageLoaders.gettingStarted)
const DesignSystemPage = lazy(pageLoaders.designSystem)
const PrivacyPage = lazy(pageLoaders.privacy)

/**
 * Getting Started page component for each product slug in src/data/products.ts.
 * Every registered product needs an entry here (enforced by App.test.ts).
 */
export const gettingStartedPages: Record<string, LazyExoticComponent<ComponentType>> = {
  lattice: GettingStartedPage,
}

type PageRoute = 'home' | 'reader' | 'getting-started' | 'blog' | 'blog-post' | 'design-system' | 'privacy'

export function parseRoute(path: string): { page: PageRoute; slug?: string } {
  if (path === '/reader' || path === '/reader/') return { page: 'reader' }
  const product = getProductByGettingStartedPath(path)
  if (product) return { page: 'getting-started', slug: product.slug }
  if (path === '/design-system' || path === '/design-system/') return { page: 'design-system' }
  if (path === '/privacy' || path === '/privacy/') return { page: 'privacy' }
  if (path === '/blog' || path === '/blog/') return { page: 'blog' }
  if (path.startsWith('/blog/')) {
    const slug = path.replace(/^\/blog\//, '').replace(/\/$/, '')
    return { page: 'blog-post', slug }
  }
  return { page: 'home' }
}

export function App() {
  // Pre-rendered pages have an empty #root until JS runs, so a null fallback
  // matches what visitors already see while the page chunk loads.
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  )
}

function Page() {
  const route = parseRoute(window.location.pathname)

  switch (route.page) {
    case 'reader':
      return <ReaderPage />
    case 'getting-started': {
      const ProductPage = route.slug ? gettingStartedPages[route.slug] : undefined
      return ProductPage ? <ProductPage /> : <HomePage />
    }
    case 'design-system':
      return <DesignSystemPage />
    case 'privacy':
      return <PrivacyPage />
    case 'blog':
      return <BlogPage />
    case 'blog-post':
      return <BlogPage slug={route.slug} />
    default:
      return <HomePage />
  }
}
