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
import { SUBSCRIBE_API_URL } from '../src/constants.js'

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

// --- Subscribe API ---

async function postSubscribe(body: unknown, headers?: Record<string, string>) {
  const res = await fetch(SUBSCRIBE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text)
  } catch {
    // non-JSON response
  }
  return { res, json }
}

describe('subscribe API — security', () => {
  it('rejects requests without Origin header', async () => {
    const { res, json } = await postSubscribe({ email: 'no-origin@test.com' })
    expect(res.status).toBe(403)
    expect(json.error).toBe('Forbidden')
  })

  it('rejects requests with wrong Origin', async () => {
    const { res, json } = await postSubscribe({ email: 'wrong-origin@test.com' }, { Origin: 'https://evil.com' })
    expect(res.status).toBe(403)
    expect(json.error).toBe('Forbidden')
  })

  it('rejects oversized body', async () => {
    const { res, json } = await postSubscribe({ email: 'a'.repeat(2000) + '@x.com' }, { Origin: 'https://forkzero.ai' })
    expect(res.status).toBe(413)
    expect(json.error).toBe('Request too large')
  })

  it('rejects invalid email', async () => {
    const { res, json } = await postSubscribe({ email: 'not-an-email' }, { Origin: 'https://forkzero.ai' })
    expect(res.status).toBe(400)
    expect(json.error).toContain('email')
  })

  it('silently discards honeypot submissions', async () => {
    const { res, json } = await postSubscribe(
      { email: 'honeypot-test@test.com', website: 'http://spam.com' },
      { Origin: 'https://forkzero.ai' },
    )
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })
})

describe('subscribe API — happy path', () => {
  it('accepts valid subscription', async () => {
    const { res, json } = await postSubscribe(
      { email: `smoke-test-${Date.now()}@forkzero.ai` },
      { Origin: 'https://forkzero.ai' },
    )
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })

  it('handles duplicate gracefully', async () => {
    const email = `dupe-test-${Date.now()}@forkzero.ai`
    const headers = { Origin: 'https://forkzero.ai' }
    await postSubscribe({ email }, headers)
    const { res, json } = await postSubscribe({ email }, headers)
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
  })

  it('returns CORS headers', async () => {
    const { res } = await postSubscribe(
      { email: `cors-test-${Date.now()}@forkzero.ai` },
      { Origin: 'https://forkzero.ai' },
    )
    expect(res.headers.get('access-control-allow-origin')).toBe('https://forkzero.ai')
  })
})
