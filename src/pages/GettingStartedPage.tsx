import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  colors,
  fonts,
  shadows,
  radius,
  gradient,
  codeBlock as codeBlockBase,
  inlineCode,
  pageWrapper,
  cardBase,
  sectionTitle as sectionTitleBase,
  containerNarrow,
  useHoverLift,
  Header,
  Footer,
  CopyButton,
} from '@forkzero/ui'
import { INSTALL_CMD, GITHUB_ORG_URL, GITHUB_REPO_URL, LATTICE_DASHBOARD_PATH } from '../constants'

// --- Code block with copy ---

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      {language && (
        <span
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '1rem',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: fonts.mono,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {language}
        </span>
      )}
      <CopyButton text={code} />
      <pre style={s.codeBlock}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// --- Step number badge ---

function StepBadge({ number }: { number: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: colors.accentBlue,
        color: colors.textOnAccent,
        fontSize: '0.85rem',
        fontWeight: 700,
        fontFamily: fonts.system,
        flexShrink: 0,
      }}
    >
      {number}
    </span>
  )
}

// --- Integration card ---

function IntegrationCard({
  name,
  description,
  available,
  icon,
}: {
  name: string
  description: string
  available: boolean
  icon: string
}) {
  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: radius,
        padding: '1.5rem',
        boxShadow: shadows.sm,
        border: `1px solid ${colors.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        opacity: available ? 1 : 0.75,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            fontSize: '1.5rem',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.bgSecondary,
            borderRadius: radius,
            border: `1px solid ${colors.borderColor}`,
          }}
        >
          {icon}
        </span>
        <div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              fontFamily: fonts.system,
              color: colors.textPrimary,
            }}
          >
            {name}
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: '0.9rem',
          fontFamily: fonts.system,
          color: colors.textSecondary,
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
        }}
      >
        {description}
      </p>
      {available ? (
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: colors.accentGreen,
            background: `${colors.accentGreen}14`,
            borderRadius: '100px',
            padding: '0.2rem 0.7rem',
            alignSelf: 'flex-start',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Available
        </span>
      ) : (
        <a
          href={`${GITHUB_REPO_URL}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: colors.textMuted,
            background: colors.bgSecondary,
            borderRadius: '100px',
            padding: '0.2rem 0.7rem',
            alignSelf: 'flex-start',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: `1px solid ${colors.borderColor}`,
            transition: 'border-color 0.2s',
          }}
        >
          Request on GitHub
        </a>
      )}
    </div>
  )
}

// --- Hover lift link wrapper ---

function HoverLiftLink({
  href,
  style,
  children,
  ...rest
}: {
  href: string
  style: CSSProperties
  children: ReactNode
  target?: string
  rel?: string
}) {
  const { style: hoverStyle, handlers } = useHoverLift(shadows.sm)
  return (
    <a href={href} style={{ ...style, ...hoverStyle }} {...handlers} {...rest}>
      {children}
    </a>
  )
}

// --- Styles ---

const s: Record<string, React.CSSProperties> = {
  page: {
    ...pageWrapper,
  },

  // Hero
  hero: {
    background: gradient,
    padding: '4rem 2rem 3rem',
    textAlign: 'center',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    fontFamily: fonts.system,
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    fontWeight: 400,
    fontFamily: fonts.system,
    opacity: 0.9,
    maxWidth: '640px',
    margin: '0 auto',
    lineHeight: 1.7,
  },

  // Sections
  container: {
    ...containerNarrow,
    padding: '0 2rem',
  },
  section: {
    padding: '3rem 0',
  },
  sectionTitle: {
    ...sectionTitleBase,
    marginBottom: '1rem',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: '1.5rem',
  },
  divider: {
    border: 'none',
    borderTop: `1px solid ${colors.borderColor}`,
    margin: 0,
  },

  // Code blocks
  codeBlock: {
    ...codeBlockBase,
    paddingTop: '1.75rem',
    marginBottom: '1rem',
    margin: 0,
  },

  // Install section
  installBox: {
    background: colors.bgDeep,
    borderRadius: radius,
    padding: '1.5rem',
    position: 'relative',
    marginBottom: '1rem',
  },
  installCode: {
    color: '#e2e8f0',
    fontSize: '1rem',
    fontFamily: fonts.mono,
    margin: 0,
    lineHeight: 1.5,
  },

  // Steps
  step: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  stepContent: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  stepText: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.65,
    marginBottom: '0.75rem',
  },

  // Inline code
  inlineCode: {
    ...inlineCode,
  },

  // Integration grid
  integrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
  },

  // Claude Code section card
  claudeCard: {
    ...cardBase,
    padding: '2rem',
    borderTop: `3px solid ${colors.accentPurple}`,
    marginBottom: '1.5rem',
  },
  claudeTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  claudeText: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.65,
    marginBottom: '1rem',
  },

  // Tip boxes
  tipBox: {
    background: `${colors.accentBlue}08`,
    borderLeft: `3px solid ${colors.accentBlue}`,
    borderRadius: `0 ${radius} ${radius} 0`,
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
  },
  tipTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.accentBlue,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: '0.25rem',
  },
  tipText: {
    fontSize: '0.9rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  // Community links
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  linkCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: colors.bgCard,
    borderRadius: radius,
    padding: '1.25rem',
    boxShadow: shadows.sm,
    border: `1px solid ${colors.borderColor}`,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  linkIcon: {
    fontSize: '1.25rem',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgSecondary,
    borderRadius: '50%',
    flexShrink: 0,
  },
  linkTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
  },
  linkDesc: {
    fontSize: '0.8rem',
    fontFamily: fonts.system,
    color: colors.textMuted,
  },
}

// --- Page ---

const NAV_LINKS = [
  { label: 'Get Started', href: '/getting-started' },
  { label: 'Blog', href: '/blog' },
]

export function GettingStartedPage() {
  useEffect(() => {
    document.title = 'Get Started with Lattice — Forkzero'

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
      'Install Lattice and start building a knowledge-coordinated codebase in under five minutes.',
    )
    setOgTag('og:title', 'Get Started with Lattice — Forkzero')
    setOgTag(
      'og:description',
      'Install Lattice and start building a knowledge-coordinated codebase in under five minutes.',
    )
    setOgTag('og:type', 'website')
    setOgTag('og:url', 'https://forkzero.ai/getting-started')
    setOgTag('og:image', 'https://forkzero.ai/og-default.png')
    setOgTag('og:site_name', 'Forkzero')
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', 'Get Started with Lattice — Forkzero')
    setMetaTag(
      'twitter:description',
      'Install Lattice and start building a knowledge-coordinated codebase in under five minutes.',
    )
    setMetaTag('twitter:image', 'https://forkzero.ai/og-default.png')
  }, [])

  return (
    <div style={s.page}>
      <Header navLinks={NAV_LINKS} githubUrl={GITHUB_ORG_URL} />

      {/* Hero */}
      <section style={s.hero}>
        <h1 style={s.heroTitle}>Get Started with Lattice</h1>
        <p style={s.heroSubtitle}>
          Install the CLI, initialize your first knowledge graph, and connect it to your AI coding assistant in under
          five minutes.
        </p>
      </section>

      <div style={s.container}>
        {/* Install */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Install</h2>
          <p style={s.sectionSubtitle}>
            Lattice ships as a single binary. Install it with one command on macOS or Linux:
          </p>
          <div style={{ ...s.installBox, position: 'relative' as const }}>
            <CopyButton text={INSTALL_CMD} />
            <pre style={s.installCode}>
              <code>{INSTALL_CMD}</code>
            </pre>
          </div>
          <p style={{ fontSize: '0.85rem', color: colors.textMuted, lineHeight: 1.6 }}>
            The installer detects your platform (macOS/Linux, x86_64/aarch64) and places the binary in{' '}
            <code style={s.inlineCode}>~/.local/bin</code>. Verify with{' '}
            <code style={s.inlineCode}>lattice --version</code>.
          </p>
        </section>

        <hr style={s.divider} />

        {/* Quick Start */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Quick Start</h2>
          <p style={s.sectionSubtitle}>
            A lattice captures the chain of reasoning behind what you build: research, strategy, requirements, and
            implementation. Here is the basic workflow:
          </p>

          {/* Step 1 */}
          <div style={s.step}>
            <StepBadge number={1} />
            <div style={s.stepContent}>
              <h3 style={s.stepTitle}>Initialize a lattice</h3>
              <p style={s.stepText}>
                Create a <code style={s.inlineCode}>.lattice/</code> directory in your project. This is where all your
                knowledge graph data lives, tracked by Git alongside your code.
              </p>
              <CodeBlock code="lattice init" language="shell" />
            </div>
          </div>

          {/* Step 2 */}
          <div style={s.step}>
            <StepBadge number={2} />
            <div style={s.stepContent}>
              <h3 style={s.stepTitle}>Add a source</h3>
              <p style={s.stepText}>
                Sources are the research that backs your decisions. Add a paper, article, or any reference with a URL.
              </p>
              <CodeBlock
                code={`lattice add source \\
  --title "Attention Is All You Need" \\
  --url "https://arxiv.org/abs/1706.03762" \\
  --body "Introduces the Transformer architecture..."`}
                language="shell"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div style={s.step}>
            <StepBadge number={3} />
            <div style={s.stepContent}>
              <h3 style={s.stepTitle}>Derive a thesis</h3>
              <p style={s.stepText}>
                Theses are strategic claims derived from your sources. They capture the "so what?" of your research.
              </p>
              <CodeBlock
                code={`lattice add thesis \\
  --title "Attention mechanisms outperform RNNs for long sequences" \\
  --body "Based on the Transformer paper, self-attention..." \\
  --supports SRC-ATTENTION-IS-ALL`}
                language="shell"
              />
            </div>
          </div>

          {/* Step 4 */}
          <div style={s.step}>
            <StepBadge number={4} />
            <div style={s.stepContent}>
              <h3 style={s.stepTitle}>Create requirements</h3>
              <p style={s.stepText}>
                Requirements are testable specifications derived from your theses. They bridge strategy to
                implementation.
              </p>
              <CodeBlock
                code={`lattice add requirement \\
  --title "Support variable-length input sequences" \\
  --body "The model must handle sequences up to 4096 tokens..." \\
  --derives-from THX-ATTENTION-MECHANISMS \\
  --priority P0`}
                language="shell"
              />
            </div>
          </div>

          {/* Step 5 */}
          <div style={s.step}>
            <StepBadge number={5} />
            <div style={s.stepContent}>
              <h3 style={s.stepTitle}>Check for drift</h3>
              <p style={s.stepText}>
                When sources or theses change, edges bound to old versions become stale. Lattice tells you exactly what
                needs review.
              </p>
              <CodeBlock code="lattice drift" language="shell" />
            </div>
          </div>

          <div style={s.tipBox}>
            <div style={s.tipTitle}>Tip</div>
            <p style={s.tipText}>
              Run <code style={s.inlineCode}>lattice list requirements</code> to see all your requirements, or{' '}
              <code style={s.inlineCode}>lattice export</code> to generate a narrative overview of your entire knowledge
              graph.
            </p>
          </div>
        </section>

        <hr style={s.divider} />

        {/* Claude Code Integration */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Claude Code Integration</h2>
          <p style={s.sectionSubtitle}>
            Lattice is built for AI-native workflows. Claude Code is the primary integration, giving your agent
            structured context about every decision in your project.
          </p>

          <div style={s.claudeCard}>
            <h3 style={s.claudeTitle}>Install the /lattice skill</h3>
            <p style={s.claudeText}>
              The recommended way to integrate with Claude Code. This installs a{' '}
              <code style={s.inlineCode}>/lattice</code> skill (command reference, workflow guidance, node/edge types)
              and a product-owner agent for backlog triage and planning.
            </p>
            <CodeBlock code="lattice init --skill" language="shell" />
            <p style={s.claudeText}>
              This creates <code style={s.inlineCode}>.claude/skills/lattice/SKILL.md</code> and{' '}
              <code style={s.inlineCode}>.claude/agents/product-owner.md</code> in your project. Claude Code
              automatically discovers these and can use the lattice skill when working in your codebase.
            </p>
          </div>

          <div style={s.claudeCard}>
            <h3 style={s.claudeTitle}>Alternative: Generate a CLAUDE.md snippet</h3>
            <p style={s.claudeText}>
              If you prefer a manual approach, the <code style={s.inlineCode}>lattice prompt</code> command outputs a
              context block you can append to your project's <code style={s.inlineCode}>CLAUDE.md</code>.
            </p>
            <CodeBlock
              code={`# Generate the prompt and append to CLAUDE.md
lattice prompt >> CLAUDE.md`}
              language="shell"
            />
          </div>

          <div style={s.claudeCard}>
            <h3 style={s.claudeTitle}>Use the CLI directly from Claude Code</h3>
            <p style={s.claudeText}>
              Claude Code can run any lattice command. Ask it to research a topic, add sources, derive theses, and
              create requirements, all in one conversation:
            </p>
            <CodeBlock
              code={`# Example conversation with Claude Code:
> "Research WebSocket performance for our real-time features,
>  add the key papers as sources, derive theses, and create
>  requirements for our API layer."

# Claude Code will run:
lattice add source --title "..." --url "..." --body "..."
lattice add thesis --title "..." --supports SRC-WEBSOCKET-PERF
lattice add requirement --title "..." --derives-from THX-REALTIME
lattice drift`}
              language="shell"
            />
          </div>

          <div style={s.tipBox}>
            <div style={s.tipTitle}>Workflow</div>
            <p style={s.tipText}>
              The power of Lattice with Claude Code is that your agent's reasoning becomes persistent and traceable.
              Instead of losing research and decisions in chat logs, everything is captured in your Git-tracked
              knowledge graph. The next agent, or the next human, can pick up right where you left off.
            </p>
          </div>
        </section>

        <hr style={s.divider} />

        {/* Other Integrations */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>LLM Integrations</h2>
          <p style={s.sectionSubtitle}>
            Lattice works with any tool that can run CLI commands. First-class integrations are on the roadmap for these
            editors and agents:
          </p>

          <div style={s.integrationGrid}>
            <IntegrationCard
              name="Claude Code"
              description="Install the /lattice skill with lattice init --skill for full integration."
              available={true}
              icon={'\u2728'}
            />
            <IntegrationCard
              name="Cursor"
              description="Run lattice commands from Cursor's terminal and reference requirements in prompts."
              available={false}
              icon={'\u{1F5B1}'}
            />
            <IntegrationCard
              name="Windsurf"
              description="Integrate lattice context into Windsurf's AI flows for structured development."
              available={false}
              icon={'\u{1F3C4}'}
            />
            <IntegrationCard
              name="GitHub Copilot"
              description="Surface lattice requirements as context for Copilot suggestions."
              available={false}
              icon={'\u{1F916}'}
            />
            <IntegrationCard
              name="Gemini CLI"
              description="Pair lattice with Gemini CLI for research-driven development workflows."
              available={false}
              icon={'\u{1F48E}'}
            />
            <IntegrationCard
              name="OpenAI Codex CLI"
              description="Use lattice as a structured context layer for Codex CLI agents."
              available={false}
              icon={'\u{1F9E0}'}
            />
          </div>
        </section>

        <hr style={s.divider} />

        {/* Next Steps */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Next Steps</h2>
          <p style={s.sectionSubtitle}>Explore the project, read the source, and join the community:</p>

          <div style={s.linkGrid}>
            <HoverLiftLink href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" style={s.linkCard}>
              <span style={s.linkIcon}>{'\u{1F4BB}'}</span>
              <div>
                <div style={s.linkTitle}>GitHub Repository</div>
                <div style={s.linkDesc}>Source code and issues</div>
              </div>
            </HoverLiftLink>

            <HoverLiftLink href={LATTICE_DASHBOARD_PATH} style={s.linkCard}>
              <span style={s.linkIcon}>{'\u{1F4CA}'}</span>
              <div>
                <div style={s.linkTitle}>Live Dashboard</div>
                <div style={s.linkDesc}>Lattice describing itself</div>
              </div>
            </HoverLiftLink>

            <HoverLiftLink href="/blog" style={s.linkCard}>
              <span style={s.linkIcon}>{'\u{1F4DD}'}</span>
              <div>
                <div style={s.linkTitle}>Blog</div>
                <div style={s.linkDesc}>Technical writing and updates</div>
              </div>
            </HoverLiftLink>

            <HoverLiftLink
              href={`${GITHUB_REPO_URL}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              style={s.linkCard}
            >
              <span style={s.linkIcon}>{'\u{1F4AC}'}</span>
              <div>
                <div style={s.linkTitle}>Discussions</div>
                <div style={s.linkDesc}>Questions and ideas</div>
              </div>
            </HoverLiftLink>
          </div>
        </section>
      </div>

      <Footer repoUrl={GITHUB_REPO_URL} links={[{ label: 'Privacy', href: '/privacy' }]} />
    </div>
  )
}
