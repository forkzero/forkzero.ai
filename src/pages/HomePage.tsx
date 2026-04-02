import { useState, useEffect, useRef } from 'react'
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
import { GITHUB_ORG_URL, GITHUB_REPO_URL } from '../constants'
import { EmailCapture } from '../components/EmailCapture'
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

// --- Problem Section ---

const problemStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerNarrow,
    padding: '3rem 2rem',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  body: {
    fontSize: '1.05rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.75,
    textAlign: 'center' as const,
    maxWidth: '640px',
    margin: '0 auto',
  },
}

function Problem() {
  return (
    <section style={problemStyles.section}>
      <h2 style={problemStyles.sectionTitle}>The code is the easy part now</h2>
      <p style={problemStyles.body}>
        Your agent generated 2,000 lines of code last week. Can you explain why any of it was built that way? The
        research is in a chat log. The architectural decisions are in someone&rsquo;s head. The requirements were never
        written down &mdash; or they&rsquo;re in a Google Doc nobody can find.
      </p>
      <p style={{ ...problemStyles.body, marginTop: '1rem' }}>
        Six months from now, a new teammate will ask &ldquo;why did we do it this way?&rdquo; and nobody will have an
        answer. A new AI model will get the same vague context and make the same mistakes.
      </p>
    </section>
  )
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
    text: 'Open any project a year later and the reasoning is right there. Every requirement links to the thesis that motivated it, and every thesis links to the research behind it.',
  },
  {
    color: colors.accentPurple,
    heading: 'Requirements before code, not after',
    text: 'Code is cheap to regenerate \u2014 requirements are expensive to discover. Give your agent a spec to implement, not a vague instruction to interpret.',
  },
  {
    color: colors.accentGreen,
    heading: 'Onboard anyone in minutes \u2014 human or AI',
    text: 'No tribal knowledge. No stale onboarding docs. A new teammate \u2014 or a new AI model \u2014 reads the knowledge graph and understands the project structure, the decisions, and the reasoning behind them.',
  },
]

function ValueProps() {
  return (
    <section style={valuePropsStyles.section}>
      <h2 style={valuePropsStyles.sectionTitle}>Why Lattice?</h2>
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

const whoCards = [
  {
    heading: 'Developers building with AI agents',
    text: "You paste context into Claude or Cursor and hope it figures out what you meant. Sometimes it nails it. Sometimes it hallucinates an API that doesn't exist. Lattice gives your agent structured requirements \u2014 so it builds what you actually specified.",
  },
  {
    heading: 'Teams where decisions outlive sprints',
    text: 'The person who made the architectural decision left six months ago. The design doc is in a Google Doc nobody can find. With Lattice, decisions live in Git \u2014 linked to the research that informed them, versioned and diffable like code.',
  },
]

function WhoItsFor() {
  return (
    <section style={valuePropsStyles.section}>
      <h2 style={valuePropsStyles.sectionTitle}>Who it&rsquo;s for</h2>
      <div style={valuePropsStyles.grid}>
        {whoCards.map((card) => (
          <div key={card.heading} style={valuePropsStyles.card}>
            <h3 style={valuePropsStyles.cardHeading}>{card.heading}</h3>
            <p style={valuePropsStyles.cardText}>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- How It Works (Vertical Trace) ---

interface TraceNode {
  type: string
  color: string
  id: string
  title: string
}

const traceSource: TraceNode = {
  type: 'Source',
  color: LATTICE_LAYERS[0].color,
  id: 'SRC-ENDOWMENT',
  title: 'Kahneman et al. 1990 \u2014 The Endowment Effect and Loss Aversion',
}

const traceThesis: TraceNode = {
  type: 'Thesis',
  color: LATTICE_LAYERS[1].color,
  id: 'THX-FREE-TIER',
  title: 'A Free Tier Creates Ownership That Drives Paid Conversion',
}

const traceRequirements: TraceNode[] = [
  {
    type: 'Requirement',
    color: LATTICE_LAYERS[2].color,
    id: 'REQ-BILLING-002',
    title: 'Freemium Plan With Usage Limits Per Tier',
  },
  {
    type: 'Requirement',
    color: LATTICE_LAYERS[2].color,
    id: 'REQ-ONBOARD-003',
    title: 'Time-to-Value Under Five Minutes for New Users',
  },
  {
    type: 'Requirement',
    color: LATTICE_LAYERS[2].color,
    id: 'REQ-UPGRADE-001',
    title: 'Contextual Upgrade Prompts at Usage Boundaries',
  },
]

const traceImplementation: TraceNode = {
  type: 'Implementation',
  color: LATTICE_LAYERS[3].color,
  id: 'IMP-BILLING-001',
  title: 'Plan Enforcement and In-App Upgrade Flow',
}

const traceEdges = LATTICE_EDGES

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

const driftStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    maxWidth: '560px',
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

function TraceCard({
  node,
  inView,
  delay,
  style,
  footer,
}: {
  node: TraceNode
  inView: boolean
  delay: number
  style?: React.CSSProperties
  footer?: React.ReactNode
}) {
  return (
    <div
      style={{
        ...traceStyles.card,
        borderLeft: `4px solid ${node.color}`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(12px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
        ...style,
      }}
    >
      <div style={traceStyles.cardHeader}>
        <span style={{ ...traceStyles.typePill, color: node.color, background: `${node.color}14` }}>{node.type}</span>
        <span style={traceStyles.nodeId}>{node.id}</span>
        <span style={traceStyles.version}>v1.0.0</span>
      </div>
      <p style={traceStyles.nodeTitle}>{node.title}</p>
      {footer}
    </div>
  )
}

function TraceConnector({ label, inView, delay }: { label: string; inView: boolean; delay: number }) {
  return (
    <div
      style={{
        ...traceStyles.connector,
        opacity: inView ? 1 : 0,
        transition: `opacity 0.3s ease ${delay}s`,
      }}
    >
      <div style={traceStyles.connectorLine} />
      <span style={traceStyles.connectorLabel}>{label}</span>
      <div style={traceStyles.connectorLine} />
      <span style={traceStyles.connectorArrow}>{'\u25BC'}</span>
    </div>
  )
}

const implFiles = ['src/middleware/auth.ts', 'src/billing/plans.ts', 'src/components/UpgradePrompt.tsx']

function VerticalTrace({ inView }: { inView: boolean }) {
  return (
    <div style={traceStyles.wrapper}>
      <TraceCard node={traceSource} inView={inView} delay={0} />
      <TraceConnector label={traceEdges[0]} inView={inView} delay={0.1} />
      <TraceCard node={traceThesis} inView={inView} delay={0.2} />
      <TraceConnector label={traceEdges[1]} inView={inView} delay={0.3} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '720px',
        }}
      >
        {traceRequirements.map((req, i) => (
          <TraceCard key={req.id} node={req} inView={inView} delay={0.4 + i * 0.15} style={{ maxWidth: 'none' }} />
        ))}
      </div>
      <TraceConnector label={traceEdges[2]} inView={inView} delay={0.85} />
      <TraceCard
        node={traceImplementation}
        inView={inView}
        delay={0.9}
        footer={
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {implFiles.map((f) => (
              <span
                key={f}
                style={{
                  fontFamily: fonts.mono,
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '100px',
                  background: `${colors.accentGreen}12`,
                  color: colors.accentGreen,
                  border: `1px solid ${colors.accentGreen}30`,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        }
      />
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
        drift detected &mdash; <strong>THX-FREE-TIER</strong> changed v1.0.0 &rarr; v1.1.0 &mdash; 3 requirements need
        review
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
          Lattice connects four layers of knowledge &mdash; research, strategy, requirements, and code.
        </p>
        <p style={{ ...howStyles.intro, fontStyle: 'italic', color: colors.textMuted }}>
          Your team is deciding between freemium and paid-only. Here&rsquo;s how that decision flows through Lattice:
        </p>
        <VerticalTrace inView={inView} />
        <p style={howStyles.body}>
          Six months later, your free tier is attracting the wrong users. You update the thesis &mdash;{' '}
          <code style={inlineCode}>lattice drift</code> tells you exactly which requirements need review:
        </p>
        <DriftBadge inView={inView} />
        <FeedbackArc inView={inView} />
        <pre style={codeBlock}>
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

// --- Before / After ---

const compareStyles: Record<string, React.CSSProperties> = {
  section: {
    ...containerWide,
    padding: '3rem 2rem',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    lineHeight: 1.65,
  },
  headerCell: {
    padding: '0.75rem 1rem',
    fontWeight: 600,
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    borderBottom: `2px solid ${colors.borderColor}`,
  },
  cell: {
    padding: '0.75rem 1rem',
    borderBottom: `1px solid ${colors.borderColor}`,
    verticalAlign: 'top' as const,
  },
}

const compareHeaderWithout: React.CSSProperties = { ...compareStyles.headerCell, color: colors.textMuted }
const compareHeaderWith: React.CSSProperties = { ...compareStyles.headerCell, color: colors.accentGreen }
const compareCellWithout: React.CSSProperties = { ...compareStyles.cell, color: colors.textMuted }
const compareCellWith: React.CSSProperties = { ...compareStyles.cell, color: colors.textSecondary }

const compareRows = [
  {
    without: 'Decisions live in a Google Doc nobody can find',
    with: 'Decisions live in Git \u2014 linked, versioned, diffable',
  },
  {
    without: 'Agent gets vague context, hallucinates the rest',
    with: 'Agent gets structured requirements, builds to spec',
  },
  {
    without: '\u201CWhy did we do it this way?\u201D \u2014 nobody knows',
    with: 'lattice trace REQ-CORE-005 \u2014 full reasoning chain',
  },
  {
    without: 'New hire spends weeks absorbing tribal knowledge',
    with: 'New hire reads the knowledge graph in minutes',
  },
  {
    without: 'Requirements rot silently',
    with: 'lattice drift flags what\u2019s out of date',
  },
]

function BeforeAfter() {
  return (
    <section style={compareStyles.section}>
      <h2 style={compareStyles.sectionTitle}>Before and after Lattice</h2>
      <div style={{ overflowX: 'auto' as const }}>
        <table style={compareStyles.table}>
          <thead>
            <tr>
              <th style={compareHeaderWithout}>Without Lattice</th>
              <th style={compareHeaderWith}>With Lattice</th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row, i) => (
              <tr key={i}>
                <td style={compareCellWithout}>{row.without}</td>
                <td style={compareCellWith}>{row.with}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// --- Email Capture ---

const emailSectionStyles: Record<string, React.CSSProperties> = {
  section: {
    background: colors.bgSecondary,
    padding: '3rem 2rem',
  },
  container: {
    ...containerNarrow,
    textAlign: 'center' as const,
  },
}

function HomeEmailCapture() {
  return (
    <section style={emailSectionStyles.section}>
      <EmailCapture
        heading="Building with AI agents? Stay sharp."
        subtext="We write about knowledge coordination, context engineering, and requirements-driven development. Occasional emails — releases and technical writing only."
        style={emailSectionStyles.container}
        formStyle={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          maxWidth: '480px',
          margin: '0 auto',
        }}
        inputStyle={{
          flex: '1 1 240px',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          fontFamily: fonts.system,
          borderRadius: radius,
          border: `1px solid ${colors.borderColor}`,
          background: colors.bgPrimary,
          color: colors.textPrimary,
          outline: 'none',
        }}
        buttonStyle={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: fonts.system,
          borderRadius: radius,
          border: 'none',
          background: colors.accentBlue,
          color: colors.textOnAccent,
          cursor: 'pointer',
        }}
      />
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
    document.title = 'Lattice by Forkzero — Knowledge Graph for AI-Native Teams'

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

    const metaTitle = 'Lattice — Knowledge Graph for AI-Native Teams'
    const metaDescription =
      'Lattice captures the research, decisions, and requirements behind your code in a Git-native knowledge graph. Any collaborator — human or AI — picks up where the last one left off.'

    setMetaTag('description', metaDescription)
    setOgTag('og:title', metaTitle)
    setOgTag('og:description', metaDescription)
    setOgTag('og:type', 'website')
    setOgTag('og:url', 'https://forkzero.ai/')
    setOgTag('og:image', 'https://forkzero.ai/og-default.png')
    setOgTag('og:site_name', 'Forkzero')
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', metaTitle)
    setMetaTag('twitter:description', metaDescription)
    setMetaTag('twitter:image', 'https://forkzero.ai/og-default.png')
  }, [])

  return (
    <>
      <Header
        navLinks={NAV_LINKS}
        githubUrl={GITHUB_ORG_URL}
        ctaLink={{ label: 'Get Started', href: '/getting-started' }}
      />
      <Hero />
      <Problem />
      <HowItWorks />
      <ValueProps />
      <BeforeAfter />
      <WhoItsFor />
      <HomeEmailCapture />
      <FeaturedArticle />
      <Projects />
      <Footer repoUrl={GITHUB_REPO_URL} links={[{ label: 'Privacy', href: '/privacy' }]} />
    </>
  )
}
