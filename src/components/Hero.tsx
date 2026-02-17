import { colors, fonts, gradient } from '../tokens'
import { INSTALL_CMD } from '../constants'

const keyframesStyle = `
@keyframes lattice-fade-slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes lattice-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lattice-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
`

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: gradient,
    padding: '5rem 2rem 4rem',
    textAlign: 'center' as const,
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  bgDecoration: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    overflow: 'hidden' as const,
  },
  content: {
    position: 'relative' as const,
  },
  brandMark: {
    marginBottom: '2rem',
  },
  brandTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 200,
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '0.45em',
    textTransform: 'uppercase' as const,
    margin: 0,
    lineHeight: 1,
    animation: 'lattice-fade-slide-up 1.5s ease-out 0.3s both',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.6), #ffffff, rgba(255,255,255,0.6))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandSubtitle: {
    fontSize: 'clamp(10px, 1.2vw, 14px)',
    fontWeight: 300,
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '0.3em',
    color: 'rgba(140, 185, 200, 0.5)',
    textTransform: 'uppercase' as const,
    margin: '0.75rem 0 0',
    animation: 'lattice-fade-in 1.5s ease-out 0.6s both',
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
    background: colors.accentBlue,
    color: colors.textOnAccent,
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
    border: '2px solid rgba(0, 255, 255, 0.4)',
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

function HeroCurves() {
  return (
    <svg
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      viewBox="0 0 800 400"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hero-curve-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(0, 255, 255, 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* Organic lattice curves — flowing Bezier paths */}
      <path
        d="M400 60 C 200 60, 80 200, 400 340 C 720 200, 600 60, 400 60"
        stroke="url(#hero-curve-grad)"
        strokeWidth="0.8"
        style={{ animation: 'lattice-float 6s ease-in-out infinite' }}
      />
      <path
        d="M400 60 C 150 100, 120 300, 400 340 C 680 300, 650 100, 400 60"
        stroke="url(#hero-curve-grad)"
        strokeWidth="0.8"
        style={{ animation: 'lattice-float 6s ease-in-out 1s infinite' }}
      />
      <path
        d="M400 60 C 250 120, 200 280, 400 340 C 600 280, 550 120, 400 60"
        stroke="url(#hero-curve-grad)"
        strokeWidth="0.8"
        style={{ animation: 'lattice-float 6s ease-in-out 2s infinite' }}
      />
      {/* Node dots at curve intersections */}
      <circle
        cx="400"
        cy="60"
        r="2.5"
        fill="rgba(0, 255, 255, 0.3)"
        style={{ animation: 'lattice-float 6s ease-in-out infinite' }}
      />
      <circle
        cx="400"
        cy="340"
        r="2.5"
        fill="rgba(0, 255, 255, 0.3)"
        style={{ animation: 'lattice-float 6s ease-in-out 1s infinite' }}
      />
      <circle
        cx="160"
        cy="200"
        r="2"
        fill="rgba(0, 255, 255, 0.2)"
        style={{ animation: 'lattice-float 6s ease-in-out 0.5s infinite' }}
      />
      <circle
        cx="640"
        cy="200"
        r="2"
        fill="rgba(0, 255, 255, 0.2)"
        style={{ animation: 'lattice-float 6s ease-in-out 1.5s infinite' }}
      />
    </svg>
  )
}

export function Hero() {
  return (
    <section style={styles.hero}>
      <style>{keyframesStyle}</style>
      <div style={styles.bgDecoration}>
        {/* Blurred ambient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'rgba(0, 255, 255, 0.06)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-5%',
            width: '350px',
            height: '350px',
            background: 'rgba(139,92,246,0.12)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <HeroCurves />
      </div>
      <div style={styles.content}>
        <div style={styles.brandMark}>
          <div style={styles.brandTitle}>Lattice</div>
          <div style={styles.brandSubtitle}>Knowledge Coordination Protocol</div>
        </div>
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
      </div>
    </section>
  )
}
