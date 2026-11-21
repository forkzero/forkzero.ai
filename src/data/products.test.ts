import { describe, it, expect } from 'vitest'
import { products, getProduct, getProductByGettingStartedPath } from './products'
import { projects, productToProject } from './projects'
import { blogPosts } from './blog-posts'

describe('product registry', () => {
  it('has unique slugs', () => {
    const slugs = products.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('puts each Getting Started page under its slug', () => {
    for (const p of products) {
      expect(p.gettingStartedPath).toBe(`/${p.slug}/getting-started`)
    }
  })

  it('looks up products by slug', () => {
    expect(getProduct('lattice')?.name).toBe('Lattice')
    expect(getProduct('nope')).toBeUndefined()
  })

  it('looks up products by Getting Started path, tolerating a trailing slash', () => {
    expect(getProductByGettingStartedPath('/lattice/getting-started')?.slug).toBe('lattice')
    expect(getProductByGettingStartedPath('/lattice/getting-started/')?.slug).toBe('lattice')
    expect(getProductByGettingStartedPath('/getting-started')).toBeUndefined()
    expect(getProductByGettingStartedPath('/')).toBeUndefined()
  })

  it('tags blog posts only with registered products', () => {
    for (const post of blogPosts) {
      if (post.product) expect(getProduct(post.product), `${post.slug} → ${post.product}`).toBeDefined()
    }
  })
})

describe('homepage projects', () => {
  it('leads with the homepage products, in registry order', () => {
    const homepageProducts = products.filter((p) => p.showOnHomepage).map((p) => p.name)
    expect(projects.slice(0, homepageProducts.length).map((p) => p.name)).toEqual(homepageProducts)
  })

  it('falls back to the Getting Started page and no tech tags when a product has no repo or tech', () => {
    const lattice = getProduct('lattice')!
    const card = productToProject({ ...lattice, repoUrl: undefined, tech: undefined })
    expect(card.url).toBe('https://forkzero.ai/lattice/getting-started')
    expect(card.tech).toEqual([])
  })

  it('keeps the other open-source projects', () => {
    expect(projects.map((p) => p.name)).toEqual(expect.arrayContaining(['Team of Rivals', 's3proxy']))
  })
})
