import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { BlogPage } from './pages/BlogPage'
import { GettingStartedPage } from './pages/GettingStartedPage'

export function parseRoute(path: string): { page: string; slug?: string } {
  if (path === '/reader' || path === '/reader/') return { page: 'reader' }
  if (path === '/getting-started' || path === '/getting-started/') return { page: 'getting-started' }
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
    case 'blog':
      return <BlogPage />
    case 'blog-post':
      return <BlogPage slug={route.slug} />
    default:
      return <HomePage />
  }
}
