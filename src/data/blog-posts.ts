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
  ogImage?: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 'post-005',
    slug: 'comprehension-debt-is-an-infrastructure-problem',
    title: 'Comprehension Debt Is an Infrastructure Problem',
    date: '2026-04-26',
    author: {
      name: 'George Moon',
      bio: 'Building knowledge coordination tools for human-agent collaboration.',
      github: 'https://github.com/georgemoon',
      x: 'https://x.com/georgemoon',
    },
    excerpt:
      "Comprehension debt finally has a name: the gap between code that exists and code anyone understands. Better specs don't close it. Versioned edges between specs, evidence, and code do.",
    discussionPrompt: "What's a decision in your codebase nobody on your team can explain anymore?",
    ogImage: '/blog/comprehension-debt-og.png',
    sources: [
      {
        name: 'Comprehension Debt',
        author: 'Addy Osmani',
        description:
          'Coined the term in March 2026; argues comprehension debt is the gap between how much code exists and how much any human understands.',
        url: 'https://addyosmani.com/blog/comprehension-debt/',
      },
      {
        name: 'Comprehension Debt: The Hidden Cost of AI-Generated Code',
        author: "O'Reilly Radar",
        description:
          'Amplifies Osmani; cites the Anthropic skill-formation study showing 17% lower comprehension scores for AI-assisted developers.',
        url: 'https://www.oreilly.com/radar/comprehension-debt-the-hidden-cost-of-ai-generated-code/',
      },
      {
        name: 'Comprehension Debt in GenAI-Assisted Software Engineering Projects',
        author: 'arXiv 2604.13277',
        description:
          'Academic treatment of how AI-assisted development creates comprehension debt distinct from technical debt.',
        url: 'https://arxiv.org/abs/2604.13277',
      },
      {
        name: 'Beyond Comprehension Debt: Why Context Architecture Is the Real AI Moat',
        author: 'MPT Solutions',
        description: 'Argues context debt is an infrastructure failure, not an inevitable consequence of AI adoption.',
        url: 'https://www.mpt.solutions/beyond-comprehension-debt-why-context-architecture-is-the-real-ai-moat/',
      },
      {
        name: '2026 Agentic Coding Trends Report',
        author: 'Anthropic',
        description:
          'Frames the shift from single agents to multi-agent teams running on horizons of hours to days; intent as the missing orchestration layer.',
        url: 'https://resources.anthropic.com/2026-agentic-coding-trends-report',
      },
    ],
    content: `Three weeks ago, Addy Osmani named something we'd all been feeling: **comprehension debt**. The growing gap between how much code exists in a system and how much of it any human genuinely understands.

The term landed because it's true. An Anthropic skill-formation study found engineers using AI assistance scored **17% lower** on a follow-up comprehension quiz (50% vs 67%) than a control group, despite finishing the task in about the same time. The code shipped. The understanding didn't.

The instinct is to fix this with better specs. Write down what you're building. Make the agent read it. Done.

It's not done. Specs are necessary but they aren't the infrastructure. Comprehension debt isn't a documentation problem. It's a coordination problem. The difference matters.

## What comprehension debt actually is

Osmani's framing is precise: comprehension debt lives in **shared mental models**, not in code artifacts. Technical debt is about *code smells*: duplication, tight coupling, dead branches. Comprehension debt is about **knowledge smells**: the moment a developer's mental model decouples from the code's logic.

The accumulation is invisible. Code review approves PRs that look fine. Tests pass. Another item enters the queue. The organizational assumption that reviewed code is understood code quietly becomes false.

Six months later somebody asks "why did we build it this way?" and the honest answer is: the agent did, the reviewer was busy, the spec didn't say, and now nobody knows whether changing it will break something three layers downstream.

That's not a code problem. The code is fine. It compiles. It runs. The problem is that the **chain of reasoning from evidence to decision to implementation is broken**.

## Why specs alone don't close the gap

Spec-driven development has critical mass. GitHub's Spec Kit has crossed 72k stars. AWS built Kiro as a spec-first IDE. OpenSpec, Tessl, BMAD, and twenty-five other frameworks all converge on the same idea: write the spec first, then have the agent build to it.

This is real progress. It beats prompting an agent with one-line tickets and hoping.

But spec-driven tools optimize for one moment in time: the moment you hand a spec to an agent. They don't answer the questions that matter when the spec was written six months ago by a teammate who left, the research it referenced has been updated twice, and three downstream specs were derived from it before any of that happened.

Specifically, doc-based spec tools don't tell you:

- **What evidence supports this spec?** Not "what's in the prompt." What's the actual research, the prior decision, the customer interview that led here?
- **What other work depends on this?** If I change this spec, which downstream specs are now built on stale assumptions?
- **Has the evidence changed?** If the research that justified this spec was updated, who needs to know?

These are graph questions. Specs are nodes. They aren't enough on their own. You need the **edges between specs, evidence, and code**, and those edges need versions.

## The missing layer

![Specs as documents vs specs as a graph: three disconnected spec.md files on the left, four versioned nodes connected by edges on the right with a drift indicator on a stale thesis edge](/blog/specs-as-docs-vs-graph.svg)

Lattice is the graph layer underneath spec-driven development. Where Spec Kit manages spec documents, Lattice manages the relationships:

\`\`\`
Sources (research, papers, decisions, customer feedback)
    ↓ supports
Theses (strategic claims)
    ↓ derives
Requirements (testable specifications)
    ↓ satisfied by
Implementations (code)
\`\`\`

Every edge records the version of both endpoints at the moment it was bound. When an upstream node changes, downstream edges bound to the old version surface as drift: work that may now be built on outdated assumptions.

| | Spec Kit / Kiro / OpenSpec | Lattice |
|---|:---:|:---:|
| Manages spec documents | ✓ | ✓ |
| Links specs to research | | ✓ |
| Version-bound edges | | ✓ |
| Drift detection | | ✓ |
| Bidirectional feedback (code → spec) | | ✓ |
| Git-native | ✓ | ✓ |

These aren't competitors. Lattice complements them. You can keep your specs in Spec Kit format and still let Lattice track the edges between them, the research underneath them, and the code on top.

## What it looks like

An agent is assigned to update the billing flow. Before writing any code, it queries the graph:

\`\`\`bash
# What exactly is the requirement?
lattice get REQ-BILLING-014

# Why does this requirement exist?
lattice search --related-to REQ-BILLING-014

# Has anything upstream changed since this was written?
lattice drift
\`\`\`

That third command is the one comprehension debt needs. If the thesis behind REQ-BILLING-014 was edited last month because early data showed the original pricing assumption was wrong, \`lattice drift\` flags it. The agent (and the human reviewing the PR) sees that this work is built on a thesis that has shifted, and gets a chance to verify before shipping.

When the implementation lands, the graph closes the loop:

\`\`\`bash
lattice verify IMP-BILLING-FLOW-002 satisfies REQ-BILLING-014 --tests-pass --coverage 0.91
\`\`\`

That edge is the **receipt**. It binds a specific version of the implementation to a specific version of the requirement, with evidence. Three months later when somebody asks "does this still do what we said it does?" the answer doesn't depend on anyone remembering.

And when the implementation reveals the spec was wrong, \`lattice refine\` pushes the gap back upstream:

\`\`\`bash
lattice refine REQ-BILLING-014 --gap-type design_decision --title 'Refund grace period not specified' --implementation IMP-BILLING-FLOW-002
\`\`\`

That's the bidirectional feedback most spec systems lack. Code teaches the spec. The graph remembers.

## The compounding cost

Here's why this matters more every quarter, not less.

Anthropic's 2026 Agentic Coding Trends Report describes agent task horizons stretching from minutes to **days and weeks**. Multi-agent teams running in parallel on the same codebase. Engineers shifting from writing code to orchestrating systems that write it.

Every one of those trends multiplies comprehension debt:

- **Longer horizons** mean agents make more decisions per session that no human ever reviewed in real time.
- **Multi-agent parallelism** means five agents resolving the same ambiguity five different ways.
- **Orchestration** means humans further from the code, more reliant on whatever institutional knowledge actually got captured.

Without infrastructure that captures intent and tracks drift, the costs compound fast. With it, the infrastructure does the remembering. Humans do the judgment.

One recent piece pushed back on the inevitability framing: *"Context debt isn't an inevitable consequence of AI adoption. It's an infrastructure failure. A failure to build systems that capture, maintain, and surface the institutional knowledge that makes code comprehensible and architecturally coherent."*

The moat framing is right. Teams that build this infrastructure now will pull ahead. Teams that don't will keep accumulating an invisible tax until something downstream breaks and nobody can explain why.

## Where to start

If you're already running spec-driven development, you have the spec nodes. You just need the edges.

\`\`\`bash
# Install Lattice
${INSTALL_CMD}

# Initialize the graph in your project
lattice init --skill
\`\`\`

\`lattice init --skill\` installs the Claude Code skill so agents can query and update the graph natively. From there, the workflow is incremental: capture the next decision as a source, link it to a thesis, derive requirements, verify implementations. The graph grows as you work.

Comprehension debt has a name. Now it needs infrastructure.

- [Lattice on GitHub](${GITHUB_REPO_URL})
- [Live dashboard](${LATTICE_DASHBOARD_URL})
- [Forkzero](https://forkzero.ai)`,
  },
  {
    id: 'post-004',
    slug: 'your-agent-memory-is-a-junk-drawer',
    title: 'Your Agent Memory Is a Junk Drawer',
    date: '2026-04-02',
    author: {
      name: 'George Moon',
      bio: 'Building knowledge coordination tools for human-agent collaboration.',
      github: 'https://github.com/georgemoon',
      x: 'https://x.com/georgemoon',
    },
    excerpt:
      "AI agent memory systems store preferences as flat files with no relationships. When context changes, nothing flags stale memories for review. We noticed this while building our own site \u2014 and realized it's the same problem Lattice solves for code.",
    discussionPrompt: 'What knowledge systems outside of code do you wish had version tracking and drift detection?',
    sources: [
      {
        name: 'Claude Code Memory System',
        author: 'Anthropic',
        description:
          'File-based memory with typed entries (user, feedback, project, reference) stored as markdown with frontmatter.',
        url: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/memory',
      },
    ],
    content: `We were building the Forkzero marketing site with Claude Code when we saved a preference: "never run ad-hoc AWS commands \u2014 always script infrastructure changes."

Claude stored it as a markdown file. A name, a type, a rule, a reason, and a scope. Simple. Useful. And missing everything that would make it trustworthy over time.

## What's in the file

The memory captures a rule and a rationale. It works for the next conversation. If you squint, it looks like a lightweight specification.

## What's not in the file

- **No link to the incident.** We saved "why" as prose, but there's no traceable reference to what happened. A month from now, we won't know whether the original incident still applies or whether it was a one-off.

- **No connection to related decisions.** This preference affects how we build infrastructure, which relates to deployment strategy, which relates to CI/CD design. Those relationships don't exist in the memory system.

- **No version.** The memory was written once. If our infrastructure approach changes \u2014 maybe we move to Terraform and ad-hoc scripts become irrelevant \u2014 nothing flags this memory as stale.

- **No drift detection.** If a related memory changes ("we now use CDK for all infrastructure"), this memory should be reviewed. But there are no edges between memories, so there's no way to know.

## The pattern is familiar

This is the same problem we built Lattice to solve for codebases. Replace "memory" with "requirement" and the gap is identical:

| Agent memory | Lattice |
|---|---|
| Flat file, no relationships | Typed nodes with versioned edges |
| Prose "why" inline | Source node with traceable evidence |
| No version tracking | Semantic versioning on every node |
| No staleness detection | Drift detection flags outdated edges |
| One rule per file | One rule per node, connected to the chain of reasoning |

If we had modeled that preference in Lattice, the trace would look like this: a source capturing the incident, a thesis that all infra changes must be scripted, and two requirements \u2014 "never run ad-hoc CLI commands" and "all setup scripts must be idempotent" \u2014 both derived from that thesis.

Now if the thesis changes \u2014 we adopt Terraform and the "scripts" thesis becomes "IaC modules" \u2014 both requirements flag for review. The preference doesn't silently rot.

## This isn't just about agents

Every knowledge system that accumulates decisions over time has this problem:

- **Research workflows.** A literature review informs a hypothesis, which drives experiment design. When new papers challenge the hypothesis, which experiments need revisiting?

- **Compliance documentation.** A regulation informs a policy, which derives specific controls. When the regulation is updated, which controls need review?

- **Product strategy.** Market research informs positioning, which derives feature priorities. When the market shifts, which features are building on stale assumptions?

These are all graph problems. Decisions form chains from evidence to action. The chains have versions. When links go stale, downstream work needs to know.

## The missing layer

Most knowledge tools optimize for storage and retrieval. Notion stores pages. Confluence stores docs. Agent memory stores preferences. RAG retrieves similar text.

None of them track **why a decision was made, what evidence supports it, and whether that evidence is still current.**

That's not a documentation problem. It's a coordination problem. And it's the problem Lattice was built to solve \u2014 whether the knowledge lives in a codebase, an agent's memory, or a team's decision log.

## Get started

${INSTALL_CMD}

- [Lattice on GitHub](${GITHUB_REPO_URL})
- [Live dashboard](${LATTICE_DASHBOARD_URL})
- [Forkzero](https://forkzero.ai)`,
  },
  {
    id: 'post-003',
    slug: 'agent-builds-wrong-thing-correctly',
    title: 'Why Your Agent Builds the Wrong Thing Correctly',
    date: '2026-04-02',
    author: {
      name: 'George Moon',
      bio: 'Building knowledge coordination tools for human-agent collaboration.',
      github: 'https://github.com/georgemoon',
      x: 'https://x.com/georgemoon',
    },
    excerpt:
      "Your agent passes every lint check, writes clean tests, and ships code that solves a problem nobody asked it to solve. The failure isn't in execution. It's in intent.",
    discussionPrompt:
      "What's the worst 'locally valid mistake' your agent has made? Code that was technically correct but completely wrong in context?",
    sources: [
      {
        name: 'The Spec Layer',
        author: 'Matt Rickard',
        description:
          'Argues that agents suffer from underconstrained execution, and that spec-driven development is the fix.',
        url: 'https://blog.matt-rickard.com/p/the-spec-layer',
      },
      {
        name: 'Building Effective Agents',
        author: 'Anthropic',
        description: 'Practical patterns for building agents that work in production.',
        url: 'https://www.anthropic.com/research/building-effective-agents',
      },
    ],
    content: `Your agent passed lint. The tests are green. The PR looks reasonable. And it's completely wrong.

Not wrong in the way a junior developer is wrong \u2014 broken syntax, missing imports, off-by-one errors. Wrong in a way that's harder to catch: the code is locally valid but globally misguided.

This is the failure mode that matters now. And most teams don't have a system for preventing it.

## The shape of agent mistakes

When a human developer makes a mistake, it's usually obvious. The build breaks. The tests fail. A reviewer catches the logic error. Traditional tooling \u2014 compilers, linters, type checkers \u2014 exists to catch these failures.

Agent mistakes look different. Matt Rickard calls them "locally valid mistakes":

> Agents fail in distinct ways from humans \u2014 they produce locally valid mistakes rather than breaking builds. Traditional tooling doesn't adequately constrain agent behavior.
> \u2014 Matt Rickard, *The Spec Layer*

You've seen this if you've worked with agents for any length of time. The patterns are consistent:

- **Disabling tests instead of fixing root causes.** The agent encounters a failing test. Instead of understanding why it fails, it comments out the assertion or rewrites the test to pass against the new (wrong) behavior.

- **Reusing patterns mindlessly.** The agent finds an existing pattern in the codebase and replicates it \u2014 even when the new context requires a different approach. It copies the authentication middleware pattern for a public endpoint.

- **Preserving old behavior while adding parallel paths.** Asked to change how notifications work, the agent adds a new notification system alongside the old one. Both now run. Neither is what you wanted.

- **Making the same decision repeatedly.** Finite context windows mean the agent re-encounters the same ambiguity on every run and resolves it differently each time.

## The root cause

These aren't intelligence failures. The agent is capable of writing correct code for any of these tasks. The problem is what Rickard calls **underconstrained execution**: too much freedom at the point where the agent has to act.

Think about what an agent typically receives when tasked with a feature: a one-line description in a ticket, maybe a few sentences of context, and access to the codebase. From this, it must infer:

- What exactly should be built
- Why this approach was chosen over alternatives
- What constraints exist from prior decisions
- Which parts of the codebase are relevant precedent and which are legacy

A senior engineer fills these gaps from experience and institutional knowledge. An agent fills them from pattern matching against whatever is in the context window. When the context is thin, the agent invents plausible-sounding answers. The code compiles. The tests pass. The PR looks clean.

Six months later someone asks "why did we build it this way?" and nobody knows \u2014 because the reasoning was never recorded, and the agent that wrote the code had none to begin with.

## Better prompts won't fix this

The instinct is to write more detailed prompts. Longer task descriptions. More context in the system message. This helps at the margins but doesn't solve the structural problem.

Prompts are ephemeral. They exist for one conversation, one task, one context window. The reasoning behind a decision outlives the prompt that triggered it. Next week, a different agent \u2014 or the same agent with a fresh context \u2014 faces the same ambiguity and has nothing to work from.

The fix isn't more words in the prompt. It's structured knowledge that persists across sessions, connects decisions to evidence, and flags when upstream assumptions change.

## Constraining intent, not just behavior

Tests constrain behavior \u2014 they verify the code does what it does correctly. Linters constrain style. Type checkers constrain structure.

None of these constrain **intent**. They can't tell you whether the agent is solving the right problem. They catch execution errors, not reasoning errors.

What's missing is an upstream layer:

- **What research informed this decision?** Not just "we chose OAuth" but the analysis comparing OAuth to session-based auth for this specific architecture.
- **What strategic position does this implement?** Not just a feature request but the thesis that token-based auth enables stateless scaling.
- **What are the concrete requirements?** Not "add auth" but "JWT tokens with per-tenant signing keys, refresh token rotation, and rate limiting per plan."
- **Has anything changed?** If the original research is outdated or the strategic thesis has shifted, which requirements need review?

This is a knowledge graph problem. Decisions form a chain from evidence to strategy to specification to code. When you capture that chain with versioned relationships, agents can traverse it \u2014 and you can detect when links in the chain go stale.

## What this looks like in practice

An agent is assigned to implement a billing feature. Instead of working from a one-line ticket, it reads a structured spec:

\`\`\`bash
# Get the requirement \u2014 what exactly needs to be built
lattice get REQ-BILLING-002

# Traverse upstream \u2014 why does this requirement exist?
lattice search --related-to REQ-BILLING-002

# Check for drift \u2014 has anything changed since this was written?
lattice drift
\`\`\`

The requirement links to a thesis about usage-based pricing. The thesis links to research comparing pricing models for developer tools. Every link records the version it was bound to.

If the pricing thesis changed last week \u2014 maybe early data showed usage-based pricing churns small accounts \u2014 \`lattice drift\` flags the three requirements derived from it. The agent knows to check before building on a potentially outdated assumption.

The agent still writes the code. But now it's writing code against a spec that traces back to evidence, not against a guess derived from pattern matching.

## The difference

Without structured specs, you're relying on the agent to infer intent from code and comments. It will infer *something* \u2014 and it will be locally valid. The code will compile. The tests will pass.

With structured specs, you've constrained intent before execution begins. The agent builds to a contract, not a hunch. And when the reasoning behind that contract changes, the system tells you which downstream work needs review.

Your agent doesn't have a skills problem. It has a context problem. Give it structured knowledge and it builds what you actually need.

## Get started

\`\`\`bash
# Install Lattice
${INSTALL_CMD}

# Initialize a knowledge graph in your project
lattice init --skill
\`\`\`

- [Lattice on GitHub](${GITHUB_REPO_URL})
- [Live dashboard](${LATTICE_DASHBOARD_URL})
- [Forkzero](https://forkzero.ai)`,
  },
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
