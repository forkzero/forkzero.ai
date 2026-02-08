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

export const projects: Project[] = [
  {
    name: 'Lattice',
    tagline: 'Knowledge coordination protocol',
    description:
      'Connects research, strategy, requirements, and implementation into a traversable knowledge graph. Agents and humans trace any decision back to its source.',
    status: 'Active',
    statusColor: '#10b981',
    tech: ['Rust', 'MCP', 'YAML'],
    url: 'https://github.com/forkzero/lattice',
    readerUrl: 'https://forkzero.ai/reader?url=https://forkzero.github.io/lattice/lattice-data.json',
  },
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
    statusColor: '#3b82f6',
    tech: ['TypeScript', 'Node.js'],
    url: 'https://github.com/forkzero/s3proxy',
  },
]
