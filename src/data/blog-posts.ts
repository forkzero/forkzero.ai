import { INSTALL_CMD, LATTICE_DASHBOARD_URL, GITHUB_REPO_URL } from '../constants'

export interface BlogAuthor {
  name: string
  bio: string
  github?: string
  x?: string
}

export interface BlogSource {
  name: string
  author: string
  description: string
  url: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  date: string
  author: BlogAuthor
  excerpt: string
  content: string
  discussionPrompt?: string
  sources?: BlogSource[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 'post-001',
    slug: 'context-engineering-knowledge-layer',
    title: 'Context Engineering Needs a Knowledge Layer',
    date: '2026-02-10',
    author: {
      name: 'George Moon',
      bio: 'Building knowledge coordination tools for human-agent collaboration.',
      github: 'https://github.com/georgemoon',
      x: 'https://x.com/georgemoon',
    },
    excerpt:
      'Context engineering is the term of the moment. But most approaches focus on runtime — what fills the context window for each LLM call. The missing piece is upstream: where does the knowledge come from, and is it still valid?',
    discussionPrompt:
      "What's your experience with context engineering? Are your agents working from structured knowledge or just RAG?",
    sources: [
      {
        name: 'Context Engineering',
        author: 'Andrej Karpathy',
        description: 'The tweet that popularized the term, reframing prompt engineering as context engineering.',
        url: 'https://x.com/karpathy/status/1937902205765607626',
      },
      {
        name: 'Effective Context Engineering for AI Agents',
        author: 'Anthropic',
        description: 'A comprehensive guide to building agents that use context effectively.',
        url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
      },
      {
        name: 'Context Engineering',
        author: 'Tobi Lutke',
        description: '"The art of providing all the context for the task to be plausibly solvable by the LLM."',
        url: 'https://x.com/tobi/status/1935533422589399127',
      },
      {
        name: 'The Rise of Context Engineering',
        author: 'LangChain',
        description:
          'Harrison Chase organizes context engineering into four strategies: write, select, compress, isolate.',
        url: 'https://blog.langchain.com/the-rise-of-context-engineering/',
      },
      {
        name: 'Context Engineering for AI Agents',
        author: 'Manus',
        description: 'Lessons from production — KV-cache hit rate as the most important metric.',
        url: 'https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus',
      },
      {
        name: 'Context Engineering Is In, Prompt Engineering Is Out',
        author: 'Gartner',
        description: 'The analyst take on why context engineering has replaced prompt engineering.',
        url: 'https://www.gartner.com/en/articles/context-engineering',
      },
    ],
    content: `Context engineering is the term of the moment. Andrej Karpathy, Tobi Lutke, and Gartner all agree: it has replaced prompt engineering as the core discipline for building with LLMs.

But most of the conversation focuses on runtime — what fills the context window for each call. There's a missing layer underneath.

## The standard framing

Harrison Chase at LangChain organized context engineering into four strategies: **write** context (persist for later retrieval), **select** context (pull what's relevant), **compress** context (reduce tokens), and **isolate** context (segregate via sub-agents).

> Anthropic's guide defines the goal as finding "the smallest set of high-signal tokens that maximize the likelihood of your desired outcome."
> — Anthropic, *Effective Context Engineering for AI Agents*

Manus reported that KV-cache hit rate is their most important metric in production.

These are useful frameworks. They describe the mechanics of filling a context window well. But they share an assumption: that the knowledge you're selecting from is already organized, versioned, and traceable.

Usually, it isn't.

## The missing layer

RAG retrieves semantically similar text. It answers "what documents mention authentication?" It cannot answer: **"What's the chain of reasoning from research to code, and is it still valid?"**

Consider what an agent actually needs when implementing a feature:

- Which requirement is it satisfying?
- What thesis does that requirement derive from?
- What research supports that thesis?
- Has anything changed since the requirement was written?

This is knowledge coordination, not information retrieval. The relationships between decisions matter as much as the decisions themselves. And when knowledge changes — a source is updated, a thesis is challenged — downstream decisions need to be flagged, not silently ignored.

## Knowledge as a graph problem

This is the problem Lattice solves. It's a knowledge coordination protocol that connects research, strategy, requirements, and implementation into a traversable, version-aware graph.

<!-- diagram:lattice-flow -->

**Version-bound edges** connect them:
- A source *supports* a thesis
- A thesis *derives* a requirement
- An implementation *satisfies* a requirement

:::insight
Every edge records the version of both source and target. When a node changes, edges bound to the old version are flagged as potentially stale. This is drift detection — and it's something no vector store provides.
:::

## In practice

An agent is tasked with implementing \`REQ-AUTH-001\`. Instead of searching a codebase blindly, it queries the Lattice graph:

1. **Get the requirement** — title, body, acceptance criteria, priority
2. **Traverse to the thesis** — understand *why* this requirement exists
3. **Read the source** — access the original research that motivated the thesis
4. **Check for drift** — are any edges bound to outdated versions?

The agent now has full traceability from research to code. If the underlying source has been updated since the requirement was written, drift detection flags it before the agent builds on stale assumptions.

Lattice is file-based (YAML in a \`.lattice/\` directory) and Git-native. No database, no separate state. The same version control that tracks your code tracks your knowledge graph.

## Complementary, not competing

Lattice isn't a replacement for LangChain, vector stores, or any runtime context engineering tool. It operates at a different layer.

Runtime context engineering answers: **"What should fill this context window right now?"**

Lattice answers: **"What is the structured knowledge that informs those decisions, and is it still valid?"**

Think of it as the coordination layer underneath. RAG selects *from* knowledge; Lattice ensures that knowledge is organized, versioned, and traceable. The four strategies Chase describes — write, select, compress, isolate — all work better when the underlying knowledge has structure.

> Context engineering is "the art of providing all the context for the task to be plausibly solvable by the LLM." Lattice makes that context trustworthy.
> — Tobi Lutke

## Get started

\`\`\`bash
# Install
${INSTALL_CMD}

# Initialize a lattice in your project
lattice init
\`\`\`

- [Lattice on GitHub](${GITHUB_REPO_URL})
- [Live dashboard](${LATTICE_DASHBOARD_URL})
- [Forkzero](https://forkzero.ai)`,
  },
  {
    id: 'post-002',
    slug: 'knowledge-graph-search-engine',
    title: 'Your Knowledge Graph Needs a Search Engine',
    date: '2026-03-07',
    author: {
      name: 'George Moon',
      bio: 'Building knowledge coordination tools for human-agent collaboration.',
      github: 'https://github.com/georgemoon',
      x: 'https://x.com/georgemoon',
    },
    excerpt:
      "Lattice gives you traceability. But traceability assumes you know what you're looking for. QMD adds the missing piece: semantic search over your knowledge graph, running entirely on-device.",
    discussionPrompt:
      'How do you search your knowledge bases today? Structured queries, semantic search, or something else?',
    sources: [
      {
        name: 'QMD',
        author: 'Tobi Lutke',
        description: 'An on-device search engine combining BM25, vector embeddings, and LLM re-ranking.',
        url: 'https://github.com/tobi/qmd',
      },
      {
        name: 'Lattice',
        author: 'Forkzero',
        description:
          'A knowledge coordination protocol connecting research, strategy, requirements, and implementation.',
        url: 'https://github.com/forkzero/lattice',
      },
    ],
    content: `Lattice gives you traceability — a versioned graph from research to code. You can traverse it, check for drift, and give agents full context for any requirement.

But traceability assumes you know what you're looking for. You know the requirement ID. You know which thesis to check. You can formulate the exact query.

What about the question you *can't* quite formulate? "Something about token expiry that came up in that security review." "The research that made us rethink session handling." That's not a graph traversal — it's a search problem.

## Two kinds of search

Lattice search is structured. Query by ID, priority, category, or graph proximity. It's exact and fast:

\`\`\`bash
lattice search --query "auth" --priority P0
lattice search --related-to REQ-AUTH-001
\`\`\`

But some questions are fuzzy. They're about concepts, associations, half-remembered context. Structured search can't help when you don't have the right keywords or don't know which node to start from.

That's where semantic search comes in.

## QMD: local hybrid search

[QMD](https://github.com/tobi/qmd) is a local search engine by Tobi Lutke. It combines three retrieval strategies — **BM25 full-text search**, **vector embeddings**, and **LLM re-ranking** — all running on-device. No API calls, no cloud dependency.

It ships with an MCP server, so agents can query it directly. 13k+ GitHub stars and actively maintained.

The key insight: QMD indexes files using glob masks. Point it at any directory and it indexes what's there. Including YAML.

## Zero-config integration

QMD can index your \`.lattice/\` directory directly — no export step, no format conversion:

\`\`\`bash
# Add your lattice as a QMD collection
qmd collection add .lattice/ --name lattice --mask "**/*.yaml"

# Annotate each layer for better context
qmd context add qmd://lattice/sources "Research backing strategic theses"
qmd context add qmd://lattice/theses "Strategic claims derived from research"
qmd context add qmd://lattice/requirements "Testable specifications"
qmd context add qmd://lattice/implementations "Code bindings satisfying requirements"

# Build the index
qmd embed
\`\`\`

That's it. Your knowledge graph is now semantically searchable.

## How it fits together

![Lattice + QMD architecture: structured and semantic search converging in an agent workflow](/blog/qmd-lattice-integration.svg)

Two paths from the same source of truth. Lattice provides structured traversal — by ID, metadata, and graph edges. QMD provides semantic discovery — fuzzy matching, conceptual similarity, cross-layer connections you didn't explicitly model.

## Complementary, not competing

These tools answer different questions from the same data:

\`\`\`bash
# Structured: exact, filtered
lattice search --query "auth" --priority P0

# Semantic: fuzzy, conceptual
qmd query "how do we handle expired tokens"

# Graph traversal: follow edges
lattice search --related-to REQ-AUTH-001

# Conceptual discovery: find related ideas
qmd query "security implications of session management"
\`\`\`

Lattice search is for when you know what you're looking for. QMD is for when you know what you're *thinking about*.

## Dual MCP for agents

Both tools expose MCP servers. An agent configured with both gets the best of each:

- **lattice_search** — structured graph queries, drift detection, version-bound edges
- **qmd_search / qmd_query** — semantic discovery, fuzzy matching, cross-collection results

Configure both in your \`.mcp.json\` and agents can choose the right tool for each sub-task. Need the exact spec for a requirement? Lattice. Need to find everything related to a concept? QMD.

## What would make it even better

The integration works today with no changes to either tool. But two enhancements would make it smoother:

1. **\`lattice integrate qmd\`** — A convenience command that auto-configures the QMD collection, sets up context annotations per layer, and runs the initial embed. Replaces the six-line setup with one command.

2. **Title comments in YAML** — If lattice added a \`# Title: ...\` comment header to YAML files, QMD's title extractor could use it for better chunking and display. Currently it falls back to filename for non-markdown files.

Neither is required — but both would reduce friction.

## Get started

\`\`\`bash
# Install Lattice
${INSTALL_CMD}

# Install QMD
npm install -g @tobilu/qmd

# Initialize and index
lattice init
qmd collection add .lattice/ --name lattice --mask "**/*.yaml"
qmd embed
\`\`\`

- [Lattice on GitHub](${GITHUB_REPO_URL})
- [QMD on GitHub](https://github.com/tobi/qmd)
- [Live dashboard](${LATTICE_DASHBOARD_URL})`,
  },
]
