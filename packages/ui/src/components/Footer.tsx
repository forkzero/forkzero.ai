import { colors, fonts } from '../tokens'
import { injectGlobalStyles } from '../styles'

export interface FooterProps {
  repoUrl?: string
  repoLabel?: string
  orgName?: string
  links?: { label: string; href: string }[]
}

const styles = {
  footer: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: colors.textMuted,
    fontSize: '0.85rem',
    fontFamily: fonts.system,
    borderTop: `1px solid ${colors.borderColor}`,
    marginTop: '3rem',
  },
  link: {
    color: colors.accentBlue,
    textDecoration: 'none',
  },
}

export function Footer({ repoUrl, repoLabel, orgName, links }: FooterProps) {
  injectGlobalStyles()
  return (
    <footer style={styles.footer} data-fzui>
      <p>
        &copy; {new Date().getFullYear()} {orgName ?? 'Forkzero'}.{' '}
        {repoUrl ? (
          <>
            Built with{' '}
            <a href={repoUrl} style={styles.link}>
              {repoLabel ?? 'Lattice'}
            </a>
            .
          </>
        ) : (
          <>Built with {repoLabel ?? 'Lattice'}.</>
        )}
      </p>
      {links && links.length > 0 && (
        <p>
          {links.map((link, i) => (
            <span key={link.href}>
              {i > 0 && ' · '}
              <a href={link.href} style={styles.link}>
                {link.label}
              </a>
            </span>
          ))}
        </p>
      )}
    </footer>
  )
}
