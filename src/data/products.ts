/**
 * Central product registry for forkzero.ai.
 *
 * Every Forkzero product (Lattice, future products) is defined here once.
 * Other parts of the site derive from this registry:
 *
 * - BlogPage: product tag pill on posts (via blog-posts.ts `product` field)
 * - projects.ts: products with `showOnHomepage: true` lead the homepage
 *   "Open Source" grid
 * - scripts/prerender.ts: pre-renders each product's Getting Started page and
 *   lists it in the sitemap
 * - src/App.tsx: route resolution for each product's `gettingStartedPath`
 *   (the page component itself is registered in App.tsx)
 *
 * When adding a new product, read docs/ADDING_A_PRODUCT.md.
 */

import { colors } from '@forkzero/ui'
import { GITHUB_REPO_URL, LATTICE_DASHBOARD_URL } from '../constants'

export interface Product {
  /** URL slug — also used as the blog `product` tag value. */
  slug: string
  /** Display name, e.g. "Lattice". */
  name: string
  /** One-line description shown on product cards. */
  tagline: string
  /** Longer description shown on homepage card and meta tags. */
  description: string
  /** Accent color used for the blog pill and product branding. */
  color: string
  /** Lifecycle state. Used as a human label and for the status pill. */
  status: 'Active' | 'Private Beta' | 'Coming Soon' | 'Archived'
  /** Status pill color (CSS color). */
  statusColor: string
  /** Where the product's Getting Started page lives on forkzero.ai, e.g. "/lattice/getting-started". */
  gettingStartedPath: string
  /** Short meta description for the Getting Started page. */
  gettingStartedDescription: string
  /** External repo or homepage URL (optional). */
  repoUrl?: string
  /** Hosted dashboard / reader URL (optional). */
  readerUrl?: string
  /** Primary tech stack tags for the homepage card (optional). */
  tech?: string[]
  /** Whether to show this product on the homepage "Open Source" grid. */
  showOnHomepage: boolean
}

export const products: Product[] = [
  {
    slug: 'lattice',
    name: 'Lattice',
    tagline: 'Knowledge coordination protocol',
    description:
      'The knowledge coordination protocol. Four layers (sources, theses, requirements, implementations) connected by version-bound edges with automatic drift detection. CLI, MCP server, and Claude Code integration built in.',
    color: colors.accentBlue,
    status: 'Active',
    statusColor: '#10b981',
    gettingStartedPath: '/lattice/getting-started',
    gettingStartedDescription:
      'Install Lattice and start building a knowledge-coordinated codebase in under five minutes.',
    repoUrl: GITHUB_REPO_URL,
    readerUrl: LATTICE_DASHBOARD_URL,
    tech: ['Rust', 'MCP', 'YAML'],
    showOnHomepage: true,
  },
]

/** Lookup a product by its slug. Returns undefined if not registered. */
export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

/** Lookup the product whose Getting Started page lives at `path` (trailing slash tolerated). */
export function getProductByGettingStartedPath(path: string): Product | undefined {
  const normalized = path.length > 1 ? path.replace(/\/$/, '') : path
  return products.find((p) => p.gettingStartedPath === normalized)
}
