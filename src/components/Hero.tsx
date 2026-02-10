import { colors, fonts, gradient } from '../tokens'

const styles = {
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
    fontSize: '1.25rem',
    fontWeight: 400,
    fontFamily: fonts.system,
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto 2rem',
    lineHeight: 1.6,
  },
  cta: {
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
}

export function Hero() {
  return (
    <section style={styles.hero}>
      <h1 style={styles.title}>Tools for the human-agent era</h1>
      <p style={styles.subtitle}>
        Forkzero builds developer tools where AI agents are first-class users. Knowledge coordination, multi-agent
        debate, and infrastructure — designed for how software gets built now.
      </p>
      <a href="https://github.com/forkzero" target="_blank" rel="noopener noreferrer" style={styles.cta}>
        View on GitHub
      </a>
    </section>
  )
}
