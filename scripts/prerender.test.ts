import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { blogPosts } from '../src/data/blog-posts.js'

const distDir = join(import.meta.dirname, '..', 'dist')

beforeAll(() => {
  // Build if dist doesn't exist
  if (!existsSync(join(distDir, 'index.html'))) {
    execSync('npm run build', { cwd: join(import.meta.dirname, '..'), stdio: 'pipe' })
  }
}, 120_000)

describe('pre-rendered homepage', () => {
  const file = join(distDir, 'index.html')

  it('has correct title', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<title>Lattice by Forkzero — Knowledge Graph for AI-Native Teams</title>')
  })

  it('has meta description', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<meta name="description"')
    expect(html).toContain('knowledge graph')
  })

  it('has og:type website', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('og:type" content="website"')
  })

  it('has canonical URL', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<link rel="canonical" href="https://forkzero.ai/"')
  })

  it('has noscript fallback with projects', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<noscript>')
    expect(html).toContain('Lattice')
    expect(html).toContain('knowledge graph')
  })

  it('has noscript navigation links', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<nav>')
    expect(html).toContain('href="/getting-started"')
    expect(html).toContain('href="/blog"')
    expect(html).toContain('href="/privacy"')
  })

  it('has Organization JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"Organization"')
    expect(html).toContain('"name":"Forkzero"')
  })

  it('has WebSite JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"WebSite"')
  })

  it('has SoftwareApplication JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"SoftwareApplication"')
    expect(html).toContain('"name":"Lattice"')
  })
})

describe('pre-rendered getting-started', () => {
  const file = join(distDir, 'getting-started', 'index.html')

  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })

  it('has correct title', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<title>Get Started with Lattice — Forkzero</title>')
  })

  it('has meta description', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<meta name="description"')
    expect(html).toContain('Install Lattice')
  })

  it('has og:type website', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('og:type" content="website"')
  })

  it('has noscript fallback with install command', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<noscript>')
    expect(html).toContain('lattice init --skill')
  })

  it('has WebPage JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"WebPage"')
  })

  it('has BreadcrumbList JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html).toContain('Getting Started')
  })
})

describe('pre-rendered reader', () => {
  const file = join(distDir, 'reader', 'index.html')

  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })

  it('has correct title', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<title>Lattice Dashboard — Forkzero</title>')
  })

  it('has meta description', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<meta name="description"')
    expect(html).toContain('Interactive viewer')
  })

  it('has og:type website', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('og:type" content="website"')
  })

  it('has noscript fallback', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<noscript>')
    expect(html).toContain('Lattice Dashboard')
  })

  it('has WebPage JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"WebPage"')
  })

  it('has BreadcrumbList JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html).toContain('Dashboard')
  })
})

describe('pre-rendered blog listing', () => {
  const file = join(distDir, 'blog', 'index.html')

  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })

  it('has correct title', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<title>Blog — Forkzero</title>')
  })

  it('has meta description', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<meta name="description"')
    expect(html).toContain('context engineering')
  })

  it('has OG tags', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
    expect(html).toContain('og:type')
    expect(html).toContain('og:url')
  })

  it('has og:type website', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('og:type" content="website"')
  })

  it('has canonical URL', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<link rel="canonical" href="https://forkzero.ai/blog"')
  })

  it('has noscript fallback with post links', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<noscript>')
    for (const post of blogPosts) {
      expect(html).toContain(`/blog/${post.slug}`)
    }
  })

  it('has CollectionPage JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"CollectionPage"')
  })

  it('has BreadcrumbList JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"BreadcrumbList"')
  })
})

describe('pre-rendered blog post', () => {
  const post = blogPosts[0]
  const file = join(distDir, 'blog', post.slug, 'index.html')

  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })

  it('has post title in <title>', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain(`<title>${post.title} — Forkzero</title>`)
  })

  it('has post excerpt in meta description', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<meta name="description"')
    // Check a portion of the excerpt is present (attr-escaped)
    const excerptSnippet = post.excerpt.slice(0, 40)
    expect(html).toContain(excerptSnippet)
  })

  it('has og:type article', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('og:type" content="article"')
  })

  it('has canonical URL', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain(`<link rel="canonical" href="https://forkzero.ai/blog/${post.slug}"`)
  })

  it('has noscript fallback with article content', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<noscript>')
    expect(html).toContain('<article')
    expect(html).toContain(post.author.name)
  })

  it('noscript contains post headings', () => {
    const html = readFileSync(file, 'utf-8')
    // Extract h2 headings from the post content
    const headings = post.content.match(/^## .+/gm)
    expect(headings).not.toBeNull()
    // Check the first few headings appear in the noscript output
    for (const h of headings!.slice(0, 3)) {
      expect(html).toContain(h.slice(3)) // strip "## " prefix
    }
  })

  it('has BlogPosting JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"BlogPosting"')
    expect(html).toContain(`"headline":"${post.title}"`)
  })

  it('has BreadcrumbList JSON-LD with 3 levels', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html).toContain('"position":3')
  })
})

describe('sitemap.xml', () => {
  const file = join(distDir, 'sitemap.xml')

  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })

  it('contains all pages', () => {
    const xml = readFileSync(file, 'utf-8')
    expect(xml).toContain('https://forkzero.ai/')
    expect(xml).toContain('https://forkzero.ai/getting-started')
    expect(xml).toContain('https://forkzero.ai/blog')
    expect(xml).toContain('https://forkzero.ai/privacy')
  })

  it('contains all blog posts', () => {
    const xml = readFileSync(file, 'utf-8')
    for (const post of blogPosts) {
      expect(xml).toContain(`https://forkzero.ai/blog/${post.slug}`)
    }
  })

  it('has lastmod dates', () => {
    const xml = readFileSync(file, 'utf-8')
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/)
  })
})

describe('404.html', () => {
  const file = join(distDir, '404.html')

  it('exists', () => {
    expect(existsSync(file)).toBe(true)
  })

  it('has noindex meta tag', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<meta name="robots" content="noindex"')
  })

  it('has correct title', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<title>Page not found — Forkzero</title>')
  })

  it('has noscript fallback with link to homepage', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('<noscript>')
    expect(html).toContain('href="/"')
  })
})
