import { colors, fonts, gradient } from '../tokens'
import { INSTALL_CMD } from '../constants'

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: gradient,
    padding: '5rem 2rem 4rem',
    textAlign: 'center' as const,
    color: '#ffffff',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    fontFamily: fonts.system,
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '1.15rem',
    fontWeight: 400,
    fontFamily: fonts.system,
    opacity: 0.9,
    maxWidth: '680px',
    margin: '0 auto 2rem',
    lineHeight: 1.7,
  },
  ctaRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1.5rem',
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: '#ffffff',
    color: colors.accentBlue,
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    fontFamily: fonts.system,
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: 'transparent',
    color: '#ffffff',
    border: '2px solid rgba(255,255,255,0.6)',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    fontFamily: fonts.system,
    transition: 'transform 0.2s, border-color 0.2s',
  },
  installHint: {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '100px',
    padding: '0.4rem 1.25rem',
    fontFamily: fonts.mono,
    fontSize: '0.85rem',
    opacity: 0.85,
    letterSpacing: '0.01em',
  },
}

export function Hero() {
  return (
    <section style={styles.hero}>
      <h1 style={styles.title}>Structure the knowledge behind what you build</h1>
      <p style={styles.subtitle}>
        When you build with LLMs, research and reasoning vanish into chat logs. Lattice is a CLI that captures it —
        connecting sources, strategy, requirements, and code into a Git-native knowledge graph that any collaborator,
        human or agent, can pick up and build on.
      </p>
      <div style={styles.ctaRow}>
        <a href="/getting-started" style={styles.ctaPrimary}>
          Get Started
        </a>
        <a href="/reader?url=https://forkzero.github.io/lattice/lattice-data.json" style={styles.ctaSecondary}>
          See it live
        </a>
      </div>
      <span style={styles.installHint}>{INSTALL_CMD}</span>
    </section>
  )
}
