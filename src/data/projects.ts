import { products, type Product } from './products'

/**
 * Homepage "Open Source" grid. Products flagged `showOnHomepage` in
 * products.ts come first (the first entry is the featured card); other
 * open-source projects without a forkzero.ai product page follow.
 */

export interface Project {
  name: string
  tagline: string
  description: string
  status: string
  statusColor: string
  tech: string[]
  url: string
  readerUrl?: string
}

function productToProject(p: Product): Project {
  return {
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    status: p.status,
    statusColor: p.statusColor,
    tech: p.tech ?? [],
    url: p.repoUrl ?? `https://forkzero.ai${p.gettingStartedPath}`,
    readerUrl: p.readerUrl,
  }
}

const otherProjects: Project[] = [
  {
    name: 'Team of Rivals',
    tagline: 'Multi-agent debate system',
    description:
      'Multiple AI agents debate proposals from different perspectives, surfacing blind spots and building stronger solutions through structured disagreement.',
    status: 'Private Beta',
    statusColor: '#f59e0b',
    tech: ['React', 'TypeScript', 'Hono'],
    url: 'https://github.com/forkzero/team-of-rivals-v2',
  },
  {
    name: 's3proxy',
    tagline: 'Streaming S3 proxy',
    description:
      'A lightweight proxy that streams S3 objects directly to clients. Signed URL generation, range requests, and multi-tenant bucket routing.',
    status: 'Production v3.x',
    statusColor: 'hsl(180, 100%, 50%)',
    tech: ['TypeScript', 'Node.js'],
    url: 'https://github.com/forkzero/s3proxy',
  },
]

export const projects: Project[] = [...products.filter((p) => p.showOnHomepage).map(productToProject), ...otherProjects]
