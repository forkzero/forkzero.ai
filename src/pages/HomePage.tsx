import { useState, useEffect, useRef, type FormEvent } from 'react'
import {
  colors,
  fonts,
  shadows,
  radius,
  cardBase,
  sectionTitle as sectionTitleBase,
  containerNarrow,
  containerWide,
  codeBlock,
  inlineCode,
  LATTICE_LAYERS,
  LATTICE_EDGES,
  Header,
  Footer,
} from '@forkzero/ui'
import { GITHUB_ORG_URL, GITHUB_REPO_URL, SUBSCRIBE_API_URL } from '../constants'
import { Hero } from '../components/Hero'
import { ProjectCard } from '../components/ProjectCard'
import { projects } from '../data/projects'
import { blogPosts } from '../data/blog-posts'

// --- Intersection Observer Hook ---

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.15 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

// --- Value Props ---

const valuePropsStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerWide,
    padding: '3rem 2rem',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    ...cardBase,
    padding: '1.75rem',
  },
  cardHeading: {
    fontSize: '1.15rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  cardText: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.65,
    margin: 0,
  },
}

const valueProps = [
  {
    color: colors.accentBlue,
    heading: "Stop losing the 'why'",
    text: 'Six months from now, nobody will remember why you chose WebSockets over SSE. In Lattice, every requirement links to the thesis that motivated it, and every thesis links to the research behind it. Open the project in a year and the reasoning is right there.',
  },
  {
    color: colors.accentPurple,
    heading: 'Requirements before code, not after',
    text: 'In the agent era, code is cheap to regenerate \u2014 requirements are expensive to discover. Start from structured requirements, not ad-hoc prompts. Give your agent a spec to implement, not a vague instruction to interpret. When requirements change, drift detection tells you what code needs to catch up.',
  },
  {
    color: colors.accentGreen,
    heading: 'Onboard anyone in seconds \u2014 human or AI',
    text: 'The lattice is the working memory for whoever comes next. A new teammate reads the knowledge graph and understands the project in minutes, not weeks. A new AI model gets the same structured context. No tribal knowledge. No onboarding docs that are already stale.',
  },
]

function ValueProps() {
  return (
    <section style={valuePropsStyles.section}>
      <div style={valuePropsStyles.grid}>
        {valueProps.map((prop) => (
          <div key={prop.heading} style={{ ...valuePropsStyles.card, borderTop: `3px solid ${prop.color}` }}>
            <h3 style={valuePropsStyles.cardHeading}>{prop.heading}</h3>
            <p style={valuePropsStyles.cardText}>{prop.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- Who It's For ---

const whoStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerWide,
    padding: '3rem 2rem',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    ...cardBase,
    padding: '1.75rem',
  },
  cardHeading: {
    fontSize: '1.15rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  cardText: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.65,
    margin: 0,
  },
}

const whoCards = [
  {
    heading: 'Developers building with AI agents',
    text: "You use Claude, Cursor, or Copilot daily. You've noticed that agent output quality depends on input quality. Lattice gives your agent structured requirements instead of hoping it figures out what you meant.",
  },
  {
    heading: 'Teams where decisions outlive sprints',
    text: 'The person who made the architectural decision left six months ago. The design doc is in a Google Doc nobody can find. With Lattice, decisions live in Git \u2014 linked to the research that informed them, versioned and diffable like code.',
  },
  {
    heading: "Anyone tired of 'why did we do it this way?'",
    text: "You're staring at a requirement and don't know if it's still valid. The thesis it was based on might have been disproven by new research. Lattice's drift detection flags exactly this \u2014 automatically.",
  },
]

function WhoItsFor() {
  return (
    <section style={whoStyles.section}>
      <h2 style={whoStyles.sectionTitle}>Who it&rsquo;s for</h2>
      <div style={whoStyles.grid}>
        {whoCards.map((card) => (
          <div key={card.heading} style={whoStyles.card}>
            <h3 style={whoStyles.cardHeading}>{card.heading}</h3>
            <p style={whoStyles.cardText}>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- How It Works (Vertical Trace) ---

const traceNodes = [
  {
    type: 'Source',
    color: LATTICE_LAYERS[0].color,
    id: 'SRC-REQUIREMENTS-DRIFT',
    title: 'Requirements Documentation Drifts From Implementation',
  },
  {
    type: 'Thesis',
    color: LATTICE_LAYERS[1].color,
    id: 'THX-VERSION-AWARE',
    title: 'Traceability Must Be Version-Aware to Enable Drift Detection',
  },
  {
    type: 'Requirement',
    color: LATTICE_LAYERS[2].color,
    id: 'REQ-CORE-005',
    title: 'Automatic Drift Detection',
  },
  {
    type: 'Implementation',
    color: LATTICE_LAYERS[3].color,
    id: 'IMP-GRAPH-001',
    title: 'Graph Traversal and Drift Detection',
  },
]

const traceEdges = [...LATTICE_EDGES]

const howStyles: Record<string, React.CSSProperties> = {
  section: {
    background: colors.bgSecondary,
    padding: '3rem 2rem',
  },
  container: {
    ...containerNarrow,
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  intro: {
    fontSize: '1.05rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  },
  body: {
    fontSize: '1rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: '1.25rem',
  },
  codeBlock: {
    ...codeBlock,
  },
  closing: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textMuted,
    lineHeight: 1.65,
    fontStyle: 'italic',
    margin: 0,
  },
}

const traceStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    margin: '2rem 0',
  },
  card: {
    ...cardBase,
    width: '100%',
    maxWidth: '520px',
    padding: '1rem 1.25rem',
    boxShadow: shadows.sm,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.35rem',
    flexWrap: 'wrap' as const,
  },
  typePill: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    borderRadius: '100px',
    padding: '0.15rem 0.55rem',
    lineHeight: 1.4,
  },
  nodeId: {
    fontSize: '0.78rem',
    fontFamily: fonts.mono,
    color: colors.textMuted,
  },
  version: {
    fontSize: '0.72rem',
    fontFamily: fonts.mono,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  nodeTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    margin: 0,
    lineHeight: 1.35,
  },
  connector: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0.15rem 0',
  },
  connectorLine: {
    width: '2px',
    height: '12px',
    background: colors.borderColor,
  },
  connectorLabel: {
    fontSize: '0.75rem',
    fontFamily: fonts.mono,
    color: colors.textMuted,
    padding: '0.1rem 0',
  },
  connectorArrow: {
    fontSize: '0.65rem',
    color: colors.textMuted,
    lineHeight: 1,
  },
}

const inlineCodeStyle: React.CSSProperties = {
  ...inlineCode,
}

const driftStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    maxWidth: '520px',
    margin: '1rem auto 0',
    background: `${colors.accentRed}0a`,
    border: `1px solid ${colors.accentRed}30`,
    borderRadius: radius,
    padding: '0.75rem 1rem',
    fontFamily: fonts.mono,
    fontSize: '0.78rem',
    color: colors.accentRed,
    lineHeight: 1.5,
  },
  icon: {
    flexShrink: 0,
    fontSize: '0.9rem',
  },
}

const feedbackStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    margin: '1.5rem 0',
  },
  label: {
    fontSize: '0.85rem',
    fontFamily: fonts.system,
    color: colors.textMuted,
    fontWeight: 500,
  },
  pills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  pill: {
    fontFamily: fonts.mono,
    fontSize: '0.72rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '100px',
    border: `1px solid ${colors.borderColor}`,
    background: 'rgba(255, 255, 255, 0.04)',
    color: colors.textMuted,
  },
  arrow: {
    fontSize: '0.65rem',
    marginLeft: '0.2rem',
  },
}

function VerticalTrace({ inView }: { inView: boolean }) {
  return (
    <div style={traceStyles.wrapper}>
      {traceNodes.flatMap((node, i) => [
        <div
          key={node.id}
          style={{
            ...traceStyles.card,
            borderLeft: `4px solid ${node.color}`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(12px)',
            transition: `opacity 0.5s ease ${i * 0.2}s, transform 0.5s ease ${i * 0.2}s`,
          }}
        >
          <div style={traceStyles.cardHeader}>
            <span style={{ ...traceStyles.typePill, color: node.color, background: `${node.color}14` }}>
              {node.type}
            </span>
            <span style={traceStyles.nodeId}>{node.id}</span>
            <span style={traceStyles.version}>v1.0.0</span>
          </div>
          <p style={traceStyles.nodeTitle}>{node.title}</p>
        </div>,
        ...(i < traceEdges.length
          ? [
              <div
                key={`edge-${i}`}
                style={{
                  ...traceStyles.connector,
                  opacity: inView ? 1 : 0,
                  transition: `opacity 0.3s ease ${i * 0.2 + 0.1}s`,
                }}
              >
                <div style={traceStyles.connectorLine} />
                <span style={traceStyles.connectorLabel}>{traceEdges[i]}</span>
                <div style={traceStyles.connectorLine} />
                <span style={traceStyles.connectorArrow}>{'\u25BC'}</span>
              </div>,
            ]
          : []),
      ])}
    </div>
  )
}

function DriftBadge({ inView }: { inView: boolean }) {
  return (
    <div
      style={{
        ...driftStyles.container,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.5s ease 0.9s, transform 0.5s ease 0.9s',
      }}
    >
      <span style={driftStyles.icon}>{'\u26A0'}</span>
      <span>
        drift detected &mdash; <strong>THX-VERSION-AWARE</strong> changed v1.0.0 &rarr; v1.1.0 &mdash;{' '}
        <strong>REQ-CORE-005</strong> needs review
      </span>
    </div>
  )
}

function FeedbackArc({ inView }: { inView: boolean }) {
  return (
    <div
      style={{
        ...feedbackStyles.container,
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.5s ease 1.1s',
      }}
    >
      <span style={feedbackStyles.label}>Knowledge flows upstream too</span>
      <div style={feedbackStyles.pills}>
        {['challenges', 'validates', 'reveals_gap_in'].map((edge) => (
          <span key={edge} style={feedbackStyles.pill}>
            {edge}
            <span style={feedbackStyles.arrow}>{'\u2191'}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function HowItWorks() {
  const { ref, inView } = useInView()
  return (
    <section style={howStyles.section}>
      <div ref={ref} style={howStyles.container}>
        <h2 style={howStyles.sectionTitle}>How it works</h2>
        <p style={howStyles.intro}>
          Knowledge flows through four layers &mdash; from research, to strategy, to specification, to code &mdash;
          connected by version-bound edges. When something upstream changes, you know exactly what downstream needs
          review. This is a real trace from Lattice&rsquo;s own knowledge graph:
        </p>
        <VerticalTrace inView={inView} />
        <p style={howStyles.body}>
          Every edge records the version it was bound to. When something changes,{' '}
          <code style={inlineCodeStyle}>lattice drift</code> tells you what needs review:
        </p>
        <DriftBadge inView={inView} />
        <FeedbackArc inView={inView} />
        <pre style={howStyles.codeBlock}>
          <code>{`.lattice/
├── config.yaml
├── sources/          # Research backing theses
├── theses/           # Strategic claims
├── requirements/     # Testable specifications
└── implementations/  # Code bindings`}</code>
        </pre>
        <p style={howStyles.closing}>
          Plain YAML files in Git. No database, no SaaS dependency, no separate state to sync. The same version control
          that tracks your code tracks the reasoning behind it.
        </p>
      </div>
    </section>
  )
}

// --- What Makes It Different ---

const diffStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerWide,
    padding: '3rem 2rem',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    ...cardBase,
    padding: '1.75rem',
  },
  cardHeading: {
    fontSize: '1.15rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  cardText: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.65,
    margin: 0,
  },
}

const diffCards = [
  {
    color: colors.accentBlue,
    heading: 'Files, not databases',
    text: 'Your knowledge graph lives in .lattice/ \u2014 YAML files tracked by Git. You get versioning, history, blame, branching, and diffs for free. No server to run, no state to sync.',
  },
  {
    color: colors.accentPurple,
    heading: 'Built for agents, readable by humans',
    text: 'Every tool in this space was built for humans and retrofitted for agents. Lattice inverts that: structured and queryable for agents, with narrative exports for humans. The MCP server and CLI both speak JSON.',
  },
  {
    color: colors.accentGreen,
    heading: 'Knowledge flows both ways',
    text: 'Most requirements tools push specs downward. Lattice captures feedback upward too \u2014 implementations reveal gaps in requirements, new research challenges old theses. Edge types like reveals_gap_in and challenges make this explicit.',
  },
]

function WhatMakesItDifferent() {
  return (
    <section style={diffStyles.section}>
      <h2 style={diffStyles.sectionTitle}>What makes it different</h2>
      <div style={diffStyles.grid}>
        {diffCards.map((card) => (
          <div key={card.heading} style={{ ...diffStyles.card, borderLeft: `3px solid ${card.color}` }}>
            <h3 style={diffStyles.cardHeading}>{card.heading}</h3>
            <p style={diffStyles.cardText}>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- Email Capture ---

const emailStyles: Record<string, React.CSSProperties> = {
  section: {
    background: colors.bgSecondary,
    padding: '3rem 2rem',
  },
  container: {
    ...containerNarrow,
    textAlign: 'center' as const,
  },
  heading: {
    ...sectionTitleBase,
    marginBottom: '0.75rem',
  },
  subtext: {
    fontSize: '1rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.65,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    maxWidth: '480px',
    margin: '0 auto',
  },
  input: {
    flex: '1 1 240px',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    fontFamily: fonts.system,
    borderRadius: radius,
    border: `1px solid ${colors.borderColor}`,
    background: colors.bgPrimary,
    color: colors.textPrimary,
    outline: 'none',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    borderRadius: radius,
    border: 'none',
    background: colors.accentBlue,
    color: colors.textOnAccent,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  message: {
    fontSize: '0.9rem',
    fontFamily: fonts.system,
    marginTop: '0.75rem',
    lineHeight: 1.5,
  },
}

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('submitting')
    fetch(SUBSCRIBE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus('success')
          setEmail('')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }

  return (
    <section style={emailStyles.section}>
      <div style={emailStyles.container}>
        <h2 style={emailStyles.heading}>Building with AI agents? Stay sharp.</h2>
        <p style={emailStyles.subtext}>
          We write about knowledge coordination, context engineering, and requirements-driven development. Occasional
          emails &mdash; releases and technical writing only.
        </p>
        {status === 'success' ? (
          <p style={{ ...emailStyles.message, color: colors.accentGreen }}>You&rsquo;re in.</p>
        ) : (
          <form style={emailStyles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={emailStyles.input}
              aria-label="Email address"
            />
            <button type="submit" disabled={status === 'submitting'} style={emailStyles.button}>
              {status === 'submitting' ? 'Subscribing\u2026' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p style={{ ...emailStyles.message, color: colors.accentRed }}>Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  )
}

// --- Featured Article ---

const featuredStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerNarrow,
    padding: '3rem 2rem',
  },
  card: {
    ...cardBase,
    display: 'block',
    padding: '2rem',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  pill: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.accentPurple,
    background: `${colors.accentPurple}12`,
    borderRadius: '100px',
    padding: '0.2rem 0.7rem',
    marginBottom: '0.75rem',
    letterSpacing: '0.03em',
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
    lineHeight: 1.3,
  },
  excerpt: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.6,
    marginBottom: '0.75rem',
  },
  readMore: {
    color: colors.accentBlue,
    fontSize: '0.9rem',
    fontWeight: 500,
    fontFamily: fonts.system,
  },
}

function FeaturedArticle() {
  const post = blogPosts[0]
  if (!post) return null
  return (
    <section style={featuredStyles.section}>
      <a href={`/blog/${post.slug}`} style={featuredStyles.card}>
        <span style={featuredStyles.pill}>Featured</span>
        <h3 style={featuredStyles.title}>{post.title}</h3>
        <p style={featuredStyles.excerpt}>{post.excerpt}</p>
        <span style={featuredStyles.readMore}>Read the full post &rarr;</span>
      </a>
    </section>
  )
}

// --- Projects ---

const projectsStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerWide,
    padding: '3rem 2rem',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1.5rem',
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  secondaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
}

function Projects() {
  const [featured, ...secondary] = projects
  return (
    <section style={projectsStyles.section}>
      <h2 style={projectsStyles.sectionTitle}>Open Source</h2>
      {featured && (
        <div style={projectsStyles.featuredGrid}>
          <ProjectCard project={featured} />
        </div>
      )}
      {secondary.length > 0 && (
        <div style={projectsStyles.secondaryGrid}>
          {secondary.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      )}
    </section>
  )
}

// --- Page ---

const NAV_LINKS = [
  { label: 'Get Started', href: '/getting-started' },
  { label: 'Blog', href: '/blog' },
]

export function HomePage() {
  useEffect(() => {
    document.title = 'Forkzero — Knowledge Coordination for AI-Native Teams'

    const setMetaTag = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
      }
      el.content = content
    }
    const setOgTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMetaTag(
      'description',
      'Forkzero builds developer tools that connect research, strategy, requirements, and implementation into a traversable knowledge graph.',
    )
    setOgTag('og:title', 'Forkzero — Knowledge Coordination for AI-Native Teams')
    setOgTag(
      'og:description',
      'Forkzero builds developer tools that connect research, strategy, requirements, and implementation into a traversable knowledge graph.',
    )
    setOgTag('og:type', 'website')
    setOgTag('og:url', 'https://forkzero.ai/')
    setOgTag('og:image', 'https://forkzero.ai/og-default.svg')
    setOgTag('og:site_name', 'Forkzero')
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', 'Forkzero — Knowledge Coordination for AI-Native Teams')
    setMetaTag(
      'twitter:description',
      'Forkzero builds developer tools that connect research, strategy, requirements, and implementation into a traversable knowledge graph.',
    )
    setMetaTag('twitter:image', 'https://forkzero.ai/og-default.svg')
  }, [])

  return (
    <>
      <Header navLinks={NAV_LINKS} githubUrl={GITHUB_ORG_URL} />
      <Hero />
      <ValueProps />
      <WhoItsFor />
      <HowItWorks />
      <WhatMakesItDifferent />
      <FeaturedArticle />
      <Projects />
      <EmailCapture />
      <Footer repoUrl={GITHUB_REPO_URL} />
    </>
  )
}
