import { useState, useEffect } from 'react'
import { colors, fonts, shadows, radius, gradient } from '../tokens'
import { INSTALL_CMD } from '../constants'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

// --- Copy button helper ---

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        background: copied ? colors.accentGreen : 'rgba(255,255,255,0.1)',
        color: copied ? '#ffffff' : 'rgba(255,255,255,0.7)',
        border: 'none',
        borderRadius: '4px',
        padding: '0.3rem 0.6rem',
        fontSize: '0.75rem',
        fontFamily: fonts.system,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

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
        color: '#ffffff',
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
          href="https://github.com/forkzero/lattice/issues"
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

// --- Styles ---

const s: Record<string, React.CSSProperties> = {
  page: {
    background: colors.bgSecondary,
    minHeight: '100vh',
    fontFamily: fonts.system,
  },

  // Hero
  hero: {
    background: gradient,
    padding: '4rem 2rem 3rem',
    textAlign: 'center',
    color: '#ffffff',
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  section: {
    padding: '3rem 0',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
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
    background: '#1a1a2e',
    color: '#e2e8f0',
    padding: '1.25rem',
    paddingTop: '1.75rem',
    borderRadius: radius,
    fontSize: '0.9rem',
    fontFamily: fonts.mono,
    overflowX: 'auto',
    marginBottom: '1rem',
    lineHeight: 1.5,
    margin: 0,
  },

  // Install section
  installBox: {
    background: '#1a1a2e',
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
    background: colors.bgSecondary,
    color: colors.accentBlue,
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontFamily: fonts.mono,
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
    background: colors.bgCard,
    borderRadius: radius,
    padding: '2rem',
    boxShadow: shadows.md,
    border: `1px solid ${colors.borderColor}`,
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

export function GettingStartedPage() {
  useEffect(() => {
    document.title = 'Get Started with Lattice — Forkzero'
  }, [])

  const installCmd = INSTALL_CMD

  return (
    <div style={s.page}>
      <Header />

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
            <CopyButton text={installCmd} />
            <pre style={s.installCode}>
              <code>{installCmd}</code>
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
            <a
              href="https://github.com/forkzero/lattice"
              target="_blank"
              rel="noopener noreferrer"
              style={s.linkCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = shadows.lg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = shadows.sm
              }}
            >
              <span style={s.linkIcon}>{'\u{1F4BB}'}</span>
              <div>
                <div style={s.linkTitle}>GitHub Repository</div>
                <div style={s.linkDesc}>Source code and issues</div>
              </div>
            </a>

            <a
              href="/reader?url=https://forkzero.github.io/lattice/lattice-data.json"
              style={s.linkCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = shadows.lg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = shadows.sm
              }}
            >
              <span style={s.linkIcon}>{'\u{1F4CA}'}</span>
              <div>
                <div style={s.linkTitle}>Live Dashboard</div>
                <div style={s.linkDesc}>Lattice describing itself</div>
              </div>
            </a>

            <a
              href="/blog"
              style={s.linkCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = shadows.lg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = shadows.sm
              }}
            >
              <span style={s.linkIcon}>{'\u{1F4DD}'}</span>
              <div>
                <div style={s.linkTitle}>Blog</div>
                <div style={s.linkDesc}>Technical writing and updates</div>
              </div>
            </a>

            <a
              href="https://github.com/forkzero/lattice/discussions"
              target="_blank"
              rel="noopener noreferrer"
              style={s.linkCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = shadows.lg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = shadows.sm
              }}
            >
              <span style={s.linkIcon}>{'\u{1F4AC}'}</span>
              <div>
                <div style={s.linkTitle}>Discussions</div>
                <div style={s.linkDesc}>Questions and ideas</div>
              </div>
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
