import { describe, it, expect } from 'vitest'
import { blogPosts } from './blog-posts'

describe('blog posts data integrity', () => {
  it('has at least one post', () => {
    expect(blogPosts.length).toBeGreaterThan(0)
  })

  it('all posts have required fields', () => {
    for (const post of blogPosts) {
      expect(post.id).toBeTruthy()
      expect(post.slug).toBeTruthy()
      expect(post.title).toBeTruthy()
      expect(post.date).toBeTruthy()
      expect(post.author).toBeTruthy()
      expect(post.excerpt).toBeTruthy()
      expect(post.content).toBeTruthy()
    }
  })

  it('all slugs are unique', () => {
    const slugs = blogPosts.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all IDs are unique', () => {
    const ids = blogPosts.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('slugs contain only valid URL characters', () => {
    for (const post of blogPosts) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('dates are valid ISO date strings', () => {
    for (const post of blogPosts) {
      const parsed = new Date(post.date)
      expect(parsed.toString()).not.toBe('Invalid Date')
    }
  })

  it('excerpts are shorter than content', () => {
    for (const post of blogPosts) {
      expect(post.excerpt.length).toBeLessThan(post.content.length)
    }
  })
})
