import { colors, fonts } from '../tokens'
import { GITHUB_REPO_URL } from '../constants'

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

export function Footer() {
  return (
    <footer style={styles.footer}>
      <p>
        &copy; {new Date().getFullYear()} Forkzero. Built with{' '}
        <a href={GITHUB_REPO_URL} style={styles.link}>
          Lattice
        </a>
        .
      </p>
    </footer>
  )
}
