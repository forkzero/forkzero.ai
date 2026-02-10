export interface BlogPost {
  id: string
  slug: string
  title: string
  date: string
  author: string
  excerpt: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 'post-001',
    slug: 'context-engineering-knowledge-layer',
    title: 'Context Engineering Needs a Knowledge Layer',
    date: '2026-02-10',
    author: 'George Moon',
    excerpt:
      'Context engineering is the term of the moment. But most approaches focus on runtime — what fills the context window for each LLM call. The missing piece is upstream: where does the knowledge come from, and is it still valid?',
    content: `Context engineering is the term of the moment. Andrej Karpathy, Tobi Lutke, and Gartner all agree: it has replaced prompt engineering as the core discipline for building with LLMs.

But most of the conversation focuses on runtime — what fills the context window for each call. There's a missing layer underneath.

## The standard framing

Harrison Chase at LangChain organized context engineering into four strategies: **write** context (persist for later retrieval), **select** context (pull what's relevant), **compress** context (reduce tokens), and **isolate** context (segregate via sub-agents).

Anthropic's guide defines the goal as finding "the smallest set of high-signal tokens that maximize the likelihood of your desired outcome." Manus reported that KV-cache hit rate is their most important metric in production.

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

**Typed nodes** represent different kinds of knowledge:
- **Sources**: Primary research (papers, articles, data)
- **Theses**: Strategic claims derived from research
- **Requirements**: Testable specifications derived from theses
- **Implementations**: Code that satisfies requirements

**Version-bound edges** connect them:
- A source *supports* a thesis
- A thesis *derives* a requirement
- An implementation *satisfies* a requirement

Every edge records the version of both source and target. When a node changes, edges bound to the old version are flagged as potentially stale. This is drift detection — and it's something no vector store provides.

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

As Tobi Lutke put it: context engineering is "the art of providing all the context for the task to be plausibly solvable by the LLM." Lattice makes that context trustworthy.

## Get started

\`\`\`bash
# Install
curl -fsSL https://raw.githubusercontent.com/forkzero/lattice/main/install.sh | sh

# Initialize a lattice in your project
lattice init
\`\`\`

- [Lattice on GitHub](https://github.com/forkzero/lattice)
- [Live dashboard](https://forkzero.ai/reader?url=https://forkzero.github.io/lattice/lattice-data.json)
- [Forkzero](https://forkzero.ai)

---

**Sources:**
- [Andrej Karpathy on context engineering](https://x.com/karpathy/status/1937902205765607626)
- [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Tobi Lutke on context engineering](https://x.com/tobi/status/1935533422589399127)
- [LangChain: The Rise of Context Engineering](https://blog.langchain.com/the-rise-of-context-engineering/)
- [Manus: Context Engineering for AI Agents](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- [Gartner: Context Engineering Is In, Prompt Engineering Is Out](https://www.gartner.com/en/articles/context-engineering)`,
  },
]
