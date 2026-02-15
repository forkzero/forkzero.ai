import { colors, fonts, shadows, radius } from '../tokens'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { ProjectCard } from '../components/ProjectCard'
import { LatticeFlowDiagram } from '../components/LatticeFlowDiagram'
import { Footer } from '../components/Footer'
import { projects } from '../data/projects'
import { blogPosts } from '../data/blog-posts'

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

// --- How It Works ---

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
    background: '#1a1a2e',
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

function HowItWorks() {
  return (
    <section style={howStyles.section}>
      <div style={howStyles.container}>
        <h2 style={howStyles.sectionTitle}>How it works</h2>
        <p style={howStyles.intro}>
          Lattice organizes knowledge into four layers, connected by version-bound edges. When anything changes
          upstream, you know.
        </p>
        <LatticeFlowDiagram />
        <p style={howStyles.body}>
          Every edge records the version of both source and target nodes. When a node is updated, edges bound to the old
          version are flagged as potentially stale. Run <code style={inlineCode}>lattice drift</code> to surface exactly
          what needs review — no manual tracking, no stale docs hiding in a wiki.
        </p>
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

const inlineCode: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  color: colors.accentBlue,
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
  fontSize: '0.9em',
  fontFamily: fonts.mono,
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
