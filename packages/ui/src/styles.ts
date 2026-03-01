import { useState, useEffect } from 'react'
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

// --- Global styles injection ---

let globalStylesInjected = false

export function injectGlobalStyles(): void {
  if (typeof document === 'undefined' || globalStylesInjected) return
  globalStylesInjected = true

  const style = document.createElement('style')
  style.setAttribute('data-fzui-global', '')
  style.textContent = `
[data-fzui] :focus-visible {
  outline: 2px solid ${colors.accentBlue};
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  [data-fzui] *,
  [data-fzui] *::before,
  [data-fzui] *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`
  document.head.appendChild(style)
}

// --- Reduced motion hook ---

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

// --- Hover lift hook ---

export function useHoverLift(defaultShadow: string = shadows.md) {
  const reducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  const style: CSSProperties =
    hovered && !reducedMotion
      ? { transform: 'translateY(-2px)', boxShadow: shadows.lg }
      : { transform: 'translateY(0)', boxShadow: defaultShadow }

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }

  return { style, handlers }
}

// --- Hover lift helper (deprecated) ---

/**
 * @deprecated Use the `useHoverLift` hook instead. This function mutates the DOM directly.
 */
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
