import { useState, useEffect, useRef } from 'react'
import { colors, fonts, shadows, radius } from '../tokens'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { ProjectCard } from '../components/ProjectCard'
import { Footer } from '../components/Footer'
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: colors.bgCard,
    borderRadius: radius,
    padding: '1.75rem',
    boxShadow: shadows.md,
    border: `1px solid ${colors.borderColor}`,
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
    heading: 'Every decision traceable',
    text: 'Requirements link to the theses and research that motivated them. Open the project in a year and know exactly why every choice was made.',
  },
  {
    color: colors.accentPurple,
    heading: 'Requirements-first development',
    text: 'Start from structured requirements, not ad-hoc prompts. Pair with TDD for a sound, repeatable process that agents can follow.',
  },
  {
    color: colors.accentGreen,
    heading: 'Shared memory for humans and agents',
    text: 'The lattice is the working memory for whoever comes next — a new teammate, a better LLM, or you in two years. Re-evaluate sources, test theses against a changed world, and onboard the next collaborator in seconds.',
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

// --- How It Works (Vertical Trace) ---

const traceNodes = [
  {
    type: 'Source',
    color: colors.accentBlue,
    id: 'SRC-REQUIREMENTS-DRIFT',
    title: 'Requirements Documentation Drifts From Implementation',
  },
  {
    type: 'Thesis',
    color: colors.accentPurple,
    id: 'THX-VERSION-AWARE',
    title: 'Traceability Must Be Version-Aware to Enable Drift Detection',
  },
  {
    type: 'Requirement',
    color: colors.accentYellow,
    id: 'REQ-CORE-005',
    title: 'Automatic Drift Detection',
  },
  {
    type: 'Implementation',
    color: colors.accentGreen,
    id: 'IMP-GRAPH-001',
    title: 'Graph Traversal and Drift Detection',
  },
]

const traceEdges = ['supports', 'derives', 'satisfies']

const howStyles: Record<string, React.CSSProperties> = {
  section: {
    background: colors.bgSecondary,
    padding: '3rem 2rem',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
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
    background: colors.bgDeep,
    color: '#e2e8f0',
    padding: '1.25rem',
    borderRadius: radius,
    fontSize: '0.9rem',
    fontFamily: fonts.mono,
    overflowX: 'auto' as const,
    marginBottom: '1.25rem',
    lineHeight: 1.5,
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
    width: '100%',
    maxWidth: '520px',
    background: colors.bgCard,
    borderRadius: radius,
    padding: '1rem 1.25rem',
    boxShadow: shadows.sm,
    border: `1px solid ${colors.borderColor}`,
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

const inlineCode: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.06)',
  color: colors.accentBlue,
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
  fontSize: '0.9em',
  fontFamily: fonts.mono,
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
          Lattice organizes knowledge into four layers &mdash; sources, theses, requirements, and implementations
          &mdash; connected by version-bound edges. Here&rsquo;s a real trace from Lattice&rsquo;s own knowledge graph:
        </p>
        <VerticalTrace inView={inView} />
        <p style={howStyles.body}>
          Every edge records the version it was bound to. When something changes,{' '}
          <code style={inlineCode}>lattice drift</code> tells you what needs review:
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
          File-based. Git-native. No database, no separate state. The same version control that tracks your code tracks
          your knowledge graph.
        </p>
      </div>
    </section>
  )
}

// --- Featured Article ---

const featuredStyles: Record<string, React.CSSProperties> = {
  section: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  card: {
    display: 'block',
    background: colors.bgCard,
    borderRadius: radius,
    padding: '2rem',
    boxShadow: shadows.md,
    border: `1px solid ${colors.borderColor}`,
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
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
      <h2 style={projectsStyles.sectionTitle}>Projects</h2>
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

export function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <ValueProps />
      <HowItWorks />
      <FeaturedArticle />
      <Projects />
      <Footer />
    </>
  )
}
