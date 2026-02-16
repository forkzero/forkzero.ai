import { describe, it, expect } from 'vitest'
import { parseRoute } from './App'

describe('parseRoute', () => {
  it('returns home for /', () => {
    expect(parseRoute('/')).toEqual({ page: 'home' })
  })

  it('returns home for unknown paths', () => {
    expect(parseRoute('/about')).toEqual({ page: 'home' })
    expect(parseRoute('/foo/bar')).toEqual({ page: 'home' })
  })

  it('returns reader for /reader', () => {
    expect(parseRoute('/reader')).toEqual({ page: 'reader' })
  })

  it('returns reader for /reader/ with trailing slash', () => {
    expect(parseRoute('/reader/')).toEqual({ page: 'reader' })
  })

  it('returns getting-started for /getting-started', () => {
    expect(parseRoute('/getting-started')).toEqual({ page: 'getting-started' })
  })

  it('returns getting-started for /getting-started/ with trailing slash', () => {
    expect(parseRoute('/getting-started/')).toEqual({ page: 'getting-started' })
  })

  it('returns blog listing for /blog', () => {
    expect(parseRoute('/blog')).toEqual({ page: 'blog' })
  })

  it('returns blog listing for /blog/ with trailing slash', () => {
    expect(parseRoute('/blog/')).toEqual({ page: 'blog' })
  })

  it('returns blog-post with slug for /blog/<slug>', () => {
    expect(parseRoute('/blog/my-post')).toEqual({ page: 'blog-post', slug: 'my-post' })
  })

  it('strips trailing slash from blog post slug', () => {
    expect(parseRoute('/blog/my-post/')).toEqual({ page: 'blog-post', slug: 'my-post' })
  })

  it('handles multi-segment slugs', () => {
    // Unlikely but tests the regex
    expect(parseRoute('/blog/context-engineering-knowledge-layer')).toEqual({
      page: 'blog-post',
      slug: 'context-engineering-knowledge-layer',
    })
  })
})
