import { useEffect } from 'react'
import {
  colors,
  fonts,
  fontSizes,
  shadows,
  radius,
  gradient,
  codeBlock,
  inlineCode,
  pageWrapper,
  cardBase,
  sectionTitle,
  containerNarrow,
  containerWide,
  useHoverLift,
  useReducedMotion,
  injectGlobalStyles,
  Header,
  PoweredByHeader,
  Footer,
  CopyButton,
} from '@forkzero/ui'

const s = {
  page: { ...pageWrapper },
  container: { ...containerWide, padding: '2rem' },
  section: { marginBottom: '3rem' },
  heading: {
    ...sectionTitle,
    marginBottom: '1rem',
    borderBottom: `1px solid ${colors.borderColor}`,
    paddingBottom: '0.5rem',
  },
  subheading: {
    fontSize: '1.1rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '0.75rem',
    marginTop: '1.5rem',
  },
  label: {
    fontSize: '0.75rem',
    fontFamily: fonts.mono,
    color: colors.textMuted,
    marginTop: '0.25rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '0.75rem',
  },
  swatch: {
    borderRadius: radius,
    padding: '1rem',
    border: `1px solid ${colors.borderColor}`,
    minHeight: '60px',
  },
  typeRow: {
    marginBottom: '0.5rem',
    fontFamily: fonts.system,
    color: colors.textPrimary,
  },
  demoCard: {
    ...cardBase,
    padding: '1.5rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    maxWidth: '300px',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start',
  },
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div>
      <div style={{ ...s.swatch, background: value }} />
      <div style={s.label}>{name}</div>
      <div style={{ ...s.label, fontSize: '0.65rem', opacity: 0.7 }}>{value}</div>
    </div>
  )
}

function HoverLiftDemo() {
  const { style: hoverStyle, handlers } = useHoverLift(shadows.md)
  return (
    <div style={{ ...s.demoCard, ...hoverStyle, cursor: 'pointer' }} {...handlers}>
      <div style={{ fontFamily: fonts.system, color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' }}>
        Hover me
      </div>
      <div style={{ fontFamily: fonts.system, color: colors.textSecondary, fontSize: '0.85rem' }}>
        Uses <code style={inlineCode}>useHoverLift</code> hook
      </div>
    </div>
  )
}

function FocusDemo() {
  return (
    <div style={s.row} data-fzui>
      <button
        style={{
          background: colors.accentBlue,
          color: colors.textOnAccent,
          border: 'none',
          borderRadius: radius,
          padding: '0.5rem 1.5rem',
          fontFamily: fonts.system,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Tab to me
      </button>
      <a
        href="#focus-demo"
        style={{
          color: colors.accentBlue,
          fontFamily: fonts.system,
          padding: '0.5rem 1rem',
          borderRadius: radius,
          border: `1px solid ${colors.borderColor}`,
          textDecoration: 'none',
        }}
      >
        Or tab here
      </a>
      <input
        type="text"
        placeholder="Or type here"
        style={{
          background: colors.bgDeep,
          color: colors.textPrimary,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: radius,
          padding: '0.5rem 1rem',
          fontFamily: fonts.system,
          fontSize: '0.9rem',
        }}
      />
    </div>
  )
}

const NAV_LINKS = [
  { label: 'Get Started', href: '/getting-started' },
  { label: 'Blog', href: '/blog' },
]

export function DesignSystemPage() {
  const reducedMotion = useReducedMotion()
  injectGlobalStyles()

  useEffect(() => {
    document.title = 'Design System — Forkzero'
  }, [])

  return (
    <div style={s.page}>
      <Header navLinks={NAV_LINKS} githubUrl="https://github.com/forkzero" ctaLink={{ label: 'CTA Demo', href: '#' }} />

      <div style={s.container}>
        <h1 style={{ ...sectionTitle, fontSize: '2rem', marginBottom: '0.5rem', marginTop: '2rem' }}>
          @forkzero/ui Design System
        </h1>
        <p style={{ fontFamily: fonts.system, color: colors.textSecondary, marginBottom: '2rem' }}>
          Living style guide — all tokens and components rendered from the real package.
        </p>

        {/* Colors */}
        <section style={s.section}>
          <h2 style={s.heading}>Colors</h2>
          <div style={s.grid}>
            {Object.entries(colors).map(([name, value]) => (
              <ColorSwatch key={name} name={name} value={value} />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section style={s.section}>
          <h2 style={s.heading}>Typography</h2>
          <h3 style={s.subheading}>Font Stacks</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: fonts.system, color: colors.textPrimary, marginBottom: '0.25rem' }}>
              System: The quick brown fox jumps over the lazy dog
            </p>
            <p style={s.label}>{fonts.system}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: fonts.mono, color: colors.textPrimary, marginBottom: '0.25rem' }}>
              Mono: The quick brown fox jumps over the lazy dog
            </p>
            <p style={s.label}>{fonts.mono}</p>
          </div>

          <h3 style={s.subheading}>Font Sizes Scale</h3>
          {Object.entries(fontSizes).map(([name, size]) => (
            <div key={name} style={{ ...s.typeRow, fontSize: size, marginBottom: '0.75rem' }}>
              <span style={{ ...s.label, display: 'inline-block', width: '3rem', fontSize: '0.75rem' }}>{name}</span>{' '}
              The quick brown fox ({size})
            </div>
          ))}
        </section>

        {/* Shadows & Radius */}
        <section style={s.section}>
          <h2 style={s.heading}>Shadows &amp; Radius</h2>
          <div style={s.row}>
            {Object.entries(shadows).map(([name, value]) => (
              <div key={name}>
                <div
                  style={{
                    width: '120px',
                    height: '80px',
                    background: colors.bgCard,
                    borderRadius: radius,
                    boxShadow: value,
                  }}
                />
                <p style={s.label}>shadows.{name}</p>
              </div>
            ))}
            <div>
              <div
                style={{
                  width: '120px',
                  height: '80px',
                  background: colors.bgCard,
                  borderRadius: radius,
                  border: `1px solid ${colors.borderColor}`,
                }}
              />
              <p style={s.label}>radius: {radius}</p>
            </div>
          </div>
        </section>

        {/* Style objects */}
        <section style={s.section}>
          <h2 style={s.heading}>Style Objects</h2>

          <h3 style={s.subheading}>cardBase</h3>
          <div style={{ ...cardBase, padding: '1.5rem', maxWidth: '400px' }}>
            <div
              style={{ fontFamily: fonts.system, color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' }}
            >
              Card Title
            </div>
            <div style={{ fontFamily: fonts.system, color: colors.textSecondary, fontSize: '0.9rem' }}>
              This uses the <code style={inlineCode}>cardBase</code> style object.
            </div>
          </div>

          <h3 style={s.subheading}>codeBlock</h3>
          <div style={{ position: 'relative', maxWidth: '500px' }}>
            <CopyButton text="const x = 42;" />
            <pre style={codeBlock}>
              <code>{'const x = 42;\nconsole.log(x);'}</code>
            </pre>
          </div>

          <h3 style={s.subheading}>inlineCode</h3>
          <p style={{ fontFamily: fonts.system, color: colors.textSecondary }}>
            Use <code style={inlineCode}>npm install</code> to install dependencies.
          </p>

          <h3 style={s.subheading}>sectionTitle</h3>
          <div style={sectionTitle}>Section Title Example</div>

          <h3 style={s.subheading}>containerNarrow / containerWide</h3>
          <div style={{ background: colors.bgDeep, padding: '1rem', borderRadius: radius }}>
            <div
              style={{
                ...containerNarrow,
                background: colors.bgCard,
                padding: '0.75rem',
                borderRadius: radius,
                marginBottom: '0.5rem',
              }}
            >
              <p style={s.label}>containerNarrow (800px)</p>
            </div>
            <div style={{ ...containerWide, background: colors.bgCard, padding: '0.75rem', borderRadius: radius }}>
              <p style={s.label}>containerWide (1200px)</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section style={s.section}>
          <h2 style={s.heading}>Components</h2>

          <h3 style={s.subheading}>Header (with nav, CTA, GitHub)</h3>
          <div
            style={{
              border: `1px solid ${colors.borderColor}`,
              borderRadius: radius,
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <Header
              navLinks={[
                { label: 'Link A', href: '#' },
                { label: 'Link B', href: '#' },
              ]}
              githubUrl="https://github.com/forkzero"
              ctaLink={{ label: 'Try It', href: '#' }}
            />
          </div>

          <h3 style={s.subheading}>PoweredByHeader</h3>
          <div
            style={{
              border: `1px solid ${colors.borderColor}`,
              borderRadius: radius,
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <PoweredByHeader poweredByUrl="https://github.com/forkzero/lattice" />
          </div>

          <h3 style={s.subheading}>Footer</h3>
          <div
            style={{
              border: `1px solid ${colors.borderColor}`,
              borderRadius: radius,
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <Footer repoUrl="https://github.com/forkzero/lattice" />
          </div>

          <h3 style={s.subheading}>CopyButton</h3>
          <div
            style={{
              position: 'relative',
              background: colors.bgDeep,
              borderRadius: radius,
              padding: '1rem',
              maxWidth: '300px',
              minHeight: '60px',
            }}
          >
            <CopyButton text="Hello, clipboard!" />
            <p style={{ ...s.label, marginTop: '2.5rem' }}>44px touch target, data-fzui for focus ring</p>
          </div>
        </section>

        {/* Hover Lift */}
        <section style={s.section}>
          <h2 style={s.heading}>Hover Lift</h2>
          <div style={s.row}>
            <HoverLiftDemo />
          </div>
        </section>

        {/* Accessibility */}
        <section style={s.section} id="focus-demo">
          <h2 style={s.heading}>Accessibility</h2>

          <h3 style={s.subheading}>Focus Ring (:focus-visible)</h3>
          <p
            style={{
              fontFamily: fonts.system,
              color: colors.textSecondary,
              fontSize: '0.9rem',
              marginBottom: '0.75rem',
            }}
          >
            Tab through these elements to see the focus ring (2px solid accentBlue, 2px offset):
          </p>
          <FocusDemo />

          <h3 style={s.subheading}>Reduced Motion</h3>
          <div style={{ ...cardBase, padding: '1rem', maxWidth: '400px', marginTop: '0.5rem' }}>
            <p style={{ fontFamily: fonts.system, color: colors.textPrimary, margin: 0 }}>
              prefers-reduced-motion:{' '}
              <strong style={{ color: reducedMotion ? colors.accentRed : colors.accentGreen }}>
                {reducedMotion ? 'reduce' : 'no-preference'}
              </strong>
            </p>
            <p
              style={{
                fontFamily: fonts.system,
                color: colors.textMuted,
                fontSize: '0.8rem',
                marginTop: '0.5rem',
                marginBottom: 0,
              }}
            >
              Toggle in your OS accessibility settings. When active, animations and transitions are suppressed within
              [data-fzui] containers.
            </p>
          </div>
        </section>

        {/* Gradient */}
        <section style={s.section}>
          <h2 style={s.heading}>Gradient</h2>
          <div style={{ background: gradient, borderRadius: radius, padding: '2rem', textAlign: 'center' as const }}>
            <span style={{ fontFamily: fonts.system, color: '#fff', fontWeight: 600 }}>gradient token</span>
          </div>
          <p style={s.label}>{gradient}</p>
        </section>
      </div>

      <Footer />
    </div>
  )
}
