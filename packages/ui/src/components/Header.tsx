import { colors, fonts } from '../tokens'
import { injectGlobalStyles } from '../styles'

export interface HeaderLink {
  label: string
  href: string
}

export interface HeaderProps {
  minimal?: boolean
  navLinks?: HeaderLink[]
  githubUrl?: string
  ctaLink?: { label: string; href: string }
}

export interface PoweredByHeaderProps {
  poweredByUrl?: string
  poweredByLabel?: string
}

const styles = {
  header: {
    background: colors.bgGlass,
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
  ctaLink: {
    color: colors.accentBlue,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: fonts.system,
    fontWeight: 600,
    background: 'rgba(0, 255, 255, 0.1)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: `1px solid ${colors.accentBlue}`,
    transition: 'background 0.2s',
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

export function Header({ minimal, navLinks, githubUrl, ctaLink }: HeaderProps) {
  injectGlobalStyles()
  return (
    <header style={styles.header} data-fzui>
      <a href="/" style={styles.logo}>
        <span style={styles.logoBold}>FORK</span>
        <span style={styles.logoThin}>ZERO</span>
      </a>
      {!minimal && (
        <nav style={styles.nav}>
          {navLinks?.map((link) => (
            <a key={link.href} href={link.href} style={styles.navLink}>
              {link.label}
            </a>
          ))}
          {ctaLink && (
            <a href={ctaLink.href} style={styles.ctaLink}>
              {ctaLink.label}
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={styles.navLinkGh}>
              GitHub
            </a>
          )}
        </nav>
      )}
    </header>
  )
}

export function PoweredByHeader({ poweredByUrl, poweredByLabel }: PoweredByHeaderProps) {
  injectGlobalStyles()
  return (
    <header style={{ ...styles.header, padding: '0.75rem 2rem' }} data-fzui>
      <a href="/" style={styles.logo}>
        <span style={styles.logoBold}>FORK</span>
        <span style={styles.logoThin}>ZERO</span>
      </a>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontFamily: fonts.system }}>
        Powered by{' '}
        {poweredByUrl ? (
          <a
            href={poweredByUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.textPrimary, textDecoration: 'none' }}
          >
            {poweredByLabel ?? 'Forkzero/Lattice'}
          </a>
        ) : (
          <span style={{ color: colors.textPrimary }}>{poweredByLabel ?? 'Forkzero/Lattice'}</span>
        )}
      </span>
    </header>
  )
}
