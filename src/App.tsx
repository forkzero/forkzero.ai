import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { BlogPage } from './pages/BlogPage'
import { GettingStartedPage } from './pages/GettingStartedPage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { PrivacyPage } from './pages/PrivacyPage'

type PageRoute = 'home' | 'reader' | 'getting-started' | 'blog' | 'blog-post' | 'design-system' | 'privacy'

export function parseRoute(path: string): { page: PageRoute; slug?: string } {
  if (path === '/reader' || path === '/reader/') return { page: 'reader' }
  if (path === '/getting-started' || path === '/getting-started/') return { page: 'getting-started' }
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
  const route = parseRoute(window.location.pathname)

  switch (route.page) {
    case 'reader':
      return <ReaderPage />
    case 'getting-started':
      return <GettingStartedPage />
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
