/**
 * Smoke tests against the live deployed site.
 *
 * Run manually after deploys:
 *   npx vitest run scripts/smoke.test.ts
 *
 * These tests hit forkzero.ai over HTTPS and verify HTTP status codes,
 * redirects, headers, and basic content expectations.
 */

import { describe, it, expect } from 'vitest'
import { blogPosts } from '../src/data/blog-posts.js'

const BASE = process.env.SITE_URL ?? 'https://forkzero.ai'

async function head(path: string, opts?: { redirect?: RequestRedirect }) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'HEAD',
    redirect: opts?.redirect ?? 'manual',
  })
  return res
}

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' })
  const text = await res.text()
  return { res, text }
}

// --- HTTP status codes ---

describe('status codes', () => {
  it.each(['/', '/blog', '/getting-started', '/privacy', '/reader'])('%s returns 200', async (path) => {
    const res = await head(path)
    expect(res.status).toBe(200)
  })

  it.each(blogPosts.map((p) => `/blog/${p.slug}`))('%s returns 200', async (path) => {
    const res = await head(path)
    expect(res.status).toBe(200)
  })

  it('non-existent page returns 404', async () => {
    const res = await head('/this-page-does-not-exist-' + Date.now())
    expect(res.status).toBe(404)
  })
})

// --- Trailing slash redirects ---

describe('trailing slash redirects', () => {
  it.each(['/blog/', '/getting-started/', '/privacy/', '/reader/'])('%s redirects to non-trailing', async (path) => {
    const res = await head(path)
    expect(res.status).toBe(301)
    const location = res.headers.get('location')
    expect(location).toBe(path.slice(0, -1))
  })
})

// --- Security headers ---

describe('security headers', () => {
  it('has HSTS', async () => {
    const res = await head('/')
    expect(res.headers.get('strict-transport-security')).toContain('max-age=')
  })

  it('has X-Frame-Options', async () => {
    const res = await head('/')
    expect(res.headers.get('x-frame-options')).toBe('DENY')
  })

  it('has X-Content-Type-Options', async () => {
    const res = await head('/')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('has Referrer-Policy', async () => {
    const res = await head('/')
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
  })

  it('has Permissions-Policy', async () => {
    const res = await head('/')
    expect(res.headers.get('permissions-policy')).toContain('geolocation=()')
  })
})

// --- Content checks ---

describe('page content', () => {
  it('homepage has correct title', async () => {
    const { text } = await get('/')
    expect(text).toContain('<title>Lattice by Forkzero')
  })

  it('homepage has JSON-LD', async () => {
    const { text } = await get('/')
    expect(text).toContain('application/ld+json')
    expect(text).toContain('"@type":"Organization"')
  })

  it('blog post has BlogPosting schema', async () => {
    const { text } = await get(`/blog/${blogPosts[0].slug}`)
    expect(text).toContain('"@type":"BlogPosting"')
  })

  it('404 page has noindex', async () => {
    const { text } = await get('/this-does-not-exist-' + Date.now())
    expect(text).toContain('content="noindex"')
  })

  it('404 page has correct title', async () => {
    const { text } = await get('/this-does-not-exist-' + Date.now())
    expect(text).toContain('<title>Page not found')
  })
})

// --- Static assets ---

describe('static assets', () => {
  it('robots.txt is accessible', async () => {
    const { res, text } = await get('/robots.txt')
    expect(res.status).toBe(200)
    expect(text).toContain('Sitemap:')
  })

  it('sitemap.xml is accessible', async () => {
    const { res, text } = await get('/sitemap.xml')
    expect(res.status).toBe(200)
    expect(text).toContain('<urlset')
    expect(text).toContain('forkzero.ai')
  })

  it('llms.txt is accessible', async () => {
    const { res, text } = await get('/llms.txt')
    expect(res.status).toBe(200)
    expect(text).toContain('Lattice')
  })

  it('og-default.png is accessible', async () => {
    const res = await head('/og-default.png')
    expect(res.status).toBe(200)
  })

  it('hashed assets have immutable cache', async () => {
    // Fetch homepage to find a hashed asset URL
    const { text } = await get('/')
    const match = text.match(/\/assets\/[^"]+\.js/)
    expect(match).not.toBeNull()

    const res = await head(`${match![0]}`)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('immutable')
  })
})
