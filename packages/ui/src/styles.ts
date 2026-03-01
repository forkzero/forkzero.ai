import type { CSSProperties, MouseEvent } from 'react'
import { colors, fonts, shadows, radius } from './tokens'

// --- Shared base styles ---

export const codeBlock: CSSProperties = {
  background: colors.bgDeep,
  color: '#e2e8f0',
  padding: '1.25rem',
  borderRadius: radius,
  fontSize: '0.9rem',
  fontFamily: fonts.mono,
  overflowX: 'auto' as const,
  marginBottom: '1.25rem',
  lineHeight: 1.5,
}

export const inlineCode: CSSProperties = {
  background: colors.bgSecondary,
  color: colors.accentBlue,
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
  fontSize: '0.9em',
  fontFamily: fonts.mono,
}

export const pageWrapper: CSSProperties = {
  background: colors.bgSecondary,
  minHeight: '100vh',
  fontFamily: fonts.system,
}

export const cardBase: CSSProperties = {
  background: colors.bgCard,
  borderRadius: radius,
  boxShadow: shadows.md,
  border: `1px solid ${colors.borderColor}`,
}

export const sectionTitle: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 600,
  fontFamily: fonts.system,
  color: colors.textPrimary,
}

export const containerNarrow: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
}

export const containerWide: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
}

// --- Lattice layer definitions ---

export const LATTICE_LAYERS = [
  { type: 'source', label: 'Sources', color: colors.accentBlue },
  { type: 'thesis', label: 'Theses', color: colors.accentPurple },
  { type: 'requirement', label: 'Requirements', color: colors.accentYellow },
  { type: 'implementation', label: 'Implementations', color: colors.accentGreen },
] as const

export const LATTICE_EDGES = ['supports', 'derives', 'satisfies'] as const

// --- Hover lift helper ---

export function hoverLiftHandlers(defaultShadow: string) {
  return {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = shadows.lg
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = defaultShadow
    },
  }
}
