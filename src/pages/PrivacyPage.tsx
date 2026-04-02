import { useEffect } from 'react'
import { colors, fonts, containerNarrow, sectionTitle as sectionTitleBase, Header, Footer } from '@forkzero/ui'
import { GITHUB_ORG_URL, GITHUB_REPO_URL } from '../constants'

const styles: Record<string, React.CSSProperties> = {
  page: {
    ...containerNarrow,
    padding: '3rem 2rem 4rem',
  },
  title: {
    ...sectionTitleBase,
    marginBottom: '0.5rem',
  },
  updated: {
    fontSize: '0.85rem',
    fontFamily: fonts.system,
    color: colors.textMuted,
    marginBottom: '2rem',
  },
  heading: {
    fontSize: '1.15rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginTop: '2rem',
    marginBottom: '0.5rem',
  },
  body: {
    fontSize: '0.95rem',
    fontFamily: fonts.system,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: '1rem',
  },
}

const NAV_LINKS = [
  { label: 'Get Started', href: '/getting-started' },
  { label: 'Blog', href: '/blog' },
]

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Forkzero'

    const setMetaTag = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMetaTag('description', 'Forkzero privacy policy. How we handle your data.')
    setMetaTag('robots', 'noindex')
  }, [])

  return (
    <>
      <Header
        navLinks={NAV_LINKS}
        githubUrl={GITHUB_ORG_URL}
        ctaLink={{ label: 'Get Started', href: '/getting-started' }}
      />
      <main style={styles.page}>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: March 21, 2026</p>

        <h2 style={styles.heading}>What we collect</h2>
        <p style={styles.body}>
          If you subscribe to our mailing list, we collect your email address. That&rsquo;s it. We do not use cookies,
          tracking pixels, or third-party analytics on this site.
        </p>

        <h2 style={styles.heading}>How we use your email</h2>
        <p style={styles.body}>
          We use your email address solely to send you occasional updates about Forkzero products &mdash; releases and
          technical writing. We will never sell, rent, or share your email address with third parties.
        </p>

        <h2 style={styles.heading}>Unsubscribe</h2>
        <p style={styles.body}>
          Every email includes an unsubscribe link. You can also email us directly to be removed from the list.
        </p>

        <h2 style={styles.heading}>Data storage</h2>
        <p style={styles.body}>
          Email addresses are stored securely and are not shared with third-party services beyond what is necessary to
          send emails.
        </p>

        <h2 style={styles.heading}>Open source</h2>
        <p style={styles.body}>
          Lattice is open-source software that runs entirely on your machine. It does not collect telemetry, phone home,
          or transmit any data. Your knowledge graph stays in your Git repository.
        </p>

        <h2 style={styles.heading}>Contact</h2>
        <p style={styles.body}>
          Questions about this policy? Email us at{' '}
          <a href="mailto:privacy@forkzero.ai" style={{ color: colors.accentBlue }}>
            privacy@forkzero.ai
          </a>
          .
        </p>
      </main>
      <Footer repoUrl={GITHUB_REPO_URL} links={[{ label: 'Privacy', href: '/privacy' }]} />
    </>
  )
}
