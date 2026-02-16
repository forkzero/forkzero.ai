import { colors, fonts, gradient } from '../tokens'

const styles = {
  header: {
    background: gradient,
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: fonts.system,
    fontSize: '1.4rem',
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '0.05em',
  },
  logoBold: {
    fontWeight: 700,
  },
  logoThin: {
    fontWeight: 300,
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  navLink: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: fonts.system,
    transition: 'color 0.2s',
  },
  navLinkGh: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: fonts.mono,
    background: 'rgba(255,255,255,0.15)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.25)',
    transition: 'background 0.2s',
  },
}

export function Header({ minimal }: { minimal?: boolean }) {
  return (
    <header style={styles.header}>
      <a href="/" style={styles.logo}>
        <span style={styles.logoBold}>FORK</span>
        <span style={styles.logoThin}>ZERO</span>
      </a>
      {!minimal && (
        <nav style={styles.nav}>
          <a href="/getting-started" style={styles.navLink}>
            Get Started
          </a>
          <a href="/blog" style={styles.navLink}>
            Blog
          </a>
          <a href="https://github.com/forkzero" target="_blank" rel="noopener noreferrer" style={styles.navLinkGh}>
            GitHub
          </a>
        </nav>
      )}
    </header>
  )
}

export function PoweredByHeader() {
  return (
    <header style={{ ...styles.header, padding: '0.75rem 2rem' }}>
      <a href="/" style={styles.logo}>
        <span style={styles.logoBold}>FORK</span>
        <span style={styles.logoThin}>ZERO</span>
      </a>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontFamily: fonts.system }}>
        Powered by{' '}
        <a
          href="https://github.com/forkzero/lattice"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.bgPrimary, textDecoration: 'none' }}
        >
          Forkzero/Lattice
        </a>
      </span>
    </header>
  )
}
