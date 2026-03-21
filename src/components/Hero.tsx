import { useState, useEffect } from 'react'
import { colors, fonts, gradient } from '@forkzero/ui'
import { INSTALL_CMD, GITHUB_REPO_URL } from '../constants'

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
@media (prefers-reduced-motion: reduce) {
  @keyframes lattice-fade-slide-up {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes lattice-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(0); }
  }
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
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
  starIcon: {
    width: '16px',
    height: '16px',
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

function useStarCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('https://api.github.com/repos/forkzero/lattice')
      .then((res) => res.json())
      .then((data: { stargazers_count?: number }) => {
        if (typeof data.stargazers_count === 'number') {
          setCount(data.stargazers_count)
        }
      })
      .catch(() => {
        /* ignore — button still works without count */
      })
  }, [])
  return count
}

function StarIcon() {
  return (
    <svg style={styles.starIcon} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

export function Hero() {
  const starCount = useStarCount()
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
          <div style={styles.brandSubtitle}>by Forkzero</div>
        </div>
        <h1 style={styles.title}>Your agent writes the code. Who remembers why?</h1>
        <p style={styles.subtitle}>
          The research, reasoning, and requirements behind your code vanish into chat logs. Lattice captures them in a
          Git-native knowledge graph &mdash; so any collaborator, human or AI, can pick up where the last one left off.
        </p>
        <div style={styles.ctaRow}>
          <a href="/getting-started" style={styles.ctaPrimary}>
            Install Lattice
          </a>
          <a href={GITHUB_REPO_URL} style={styles.ctaSecondary} target="_blank" rel="noopener noreferrer">
            <StarIcon />
            Star on GitHub{starCount !== null ? ` \u00b7 ${starCount}` : ''}
          </a>
        </div>
        <span style={styles.installHint}>{INSTALL_CMD}</span>
      </div>
    </section>
  )
}
