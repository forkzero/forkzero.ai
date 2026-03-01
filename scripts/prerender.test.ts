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
    expect(html).toContain('<title>Forkzero — Knowledge Coordination for AI-Native Teams</title>')
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
    expect(html).toContain('<title>Getting Started — Forkzero</title>')
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

  it('has WebPage JSON-LD', () => {
    const html = readFileSync(file, 'utf-8')
    expect(html).toContain('"@type":"WebPage"')
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
    expect(html).toContain('Context engineering is the term of the moment')
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
    expect(html).toContain('The standard framing')
    expect(html).toContain('The missing layer')
    expect(html).toContain('Knowledge as a graph problem')
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
