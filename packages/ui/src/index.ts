/**
 * @forkzero/ui — Shared design system for Forkzero applications.
 *
 * ## Quick start
 *
 * ```ts
 * import {
 *   colors, fonts, fontSizes, shadows, radius, gradient,
 *   pageWrapper, cardBase, codeBlock, inlineCode, sectionTitle,
 *   containerNarrow, containerWide,
 *   useHoverLift, useReducedMotion, injectGlobalStyles,
 *   Header, PoweredByHeader, Footer, CopyButton,
 * } from '@forkzero/ui'
 * ```
 *
 * ## Tokens
 *
 * ### Colors (`colors`)
 *
 * | Token           | Purpose                                          |
 * |-----------------|--------------------------------------------------|
 * | `bgPrimary`     | Main page background                             |
 * | `bgSecondary`   | Slightly darker background (page wrapper default) |
 * | `bgCard`        | Card / elevated surface background                |
 * | `bgDeep`        | Deepest background (code blocks, inset areas)     |
 * | `bgGlass`       | Semi-transparent header backdrop                  |
 * | `textPrimary`   | Primary text (headings, labels)                   |
 * | `textOnAccent`  | Text on accent-colored backgrounds                |
 * | `textSecondary` | Body text, descriptions                           |
 * | `textMuted`     | Captions, hints, metadata — WCAG AA compliant     |
 * | `borderColor`   | Subtle borders on cards and dividers               |
 * | `accentBlue`    | Primary accent — links, CTAs, focus rings          |
 * | `accentGreen`   | Success states, available badges                   |
 * | `accentYellow`  | Warnings, requirement layer                        |
 * | `accentRed`     | Errors, destructive actions                        |
 * | `accentPurple`  | Thesis layer, secondary accent                     |
 *
 * Always use tokens — never hardcode color values. For opacity variants
 * use template literals: `` `${colors.accentGreen}14` `` (hex alpha suffix).
 *
 * ### Typography (`fonts`, `fontSizes`)
 *
 * - `fonts.system` — UI text, headings, body copy
 * - `fonts.mono` — Code blocks, technical labels, CLI output
 * - `fontSizes` — Scale from `xs` (0.75rem) to `3xl` (2rem)
 *
 * ### Shadows (`shadows`)
 *
 * - `shadows.sm` — Subtle cards, badges
 * - `shadows.md` — Default card elevation (used by `cardBase`)
 * - `shadows.lg` — Hover-lifted / emphasized cards
 *
 * ### Other
 *
 * - `radius` — Standard border radius (8px)
 * - `gradient` — Hero/section gradient background
 *
 * ## Style objects
 *
 * Pre-composed `CSSProperties` objects. Spread and extend as needed:
 *
 * ```ts
 * const myCard = { ...cardBase, padding: '1.5rem', marginBottom: '1rem' }
 * ```
 *
 * | Object            | Use for                                    |
 * |-------------------|--------------------------------------------|
 * | `pageWrapper`     | Top-level page `<div>` (bg, min-height, font) |
 * | `cardBase`        | Any card surface (bg, radius, shadow, border)  |
 * | `codeBlock`       | `<pre>` code blocks                            |
 * | `inlineCode`      | `<code>` inline snippets                       |
 * | `sectionTitle`    | `<h2>` section headings                        |
 * | `containerNarrow` | Centered content column (max 800px)            |
 * | `containerWide`   | Centered content column (max 1200px)           |
 *
 * ## Hooks
 *
 * ### `useHoverLift(defaultShadow?)`
 *
 * Returns `{ style, handlers }`. Apply both to a card/link element for a
 * lift-on-hover effect. Automatically disabled when the user prefers
 * reduced motion. Replaces the deprecated `hoverLiftHandlers` function.
 *
 * ```tsx
 * function Card() {
 *   const { style, handlers } = useHoverLift(shadows.md)
 *   return <div style={{ ...cardBase, ...style }} {...handlers}>...</div>
 * }
 * ```
 *
 * For elements rendered in a loop, wrap in a component so the hook is
 * called per-instance (hooks cannot be called conditionally or in loops).
 *
 * ### `useReducedMotion()`
 *
 * Returns `boolean` — `true` when the user's OS prefers reduced motion.
 * Use to conditionally skip custom animations.
 *
 * ### `injectGlobalStyles()`
 *
 * Call once (idempotent) to inject global CSS:
 * - `:focus-visible` ring (2px solid accentBlue, 2px offset) on elements
 *   inside `[data-fzui]` containers
 * - `prefers-reduced-motion: reduce` suppression of animations/transitions
 *   inside `[data-fzui]` containers
 *
 * All built-in components (Header, Footer, CopyButton) call this
 * automatically. When building custom components, call it and add
 * `data-fzui` to your root element.
 *
 * ## Components
 *
 * ### `<Header>`
 *
 * Props:
 * - `navLinks?: { label: string; href: string }[]` — nav items
 * - `githubUrl?: string` — renders a GitHub pill button
 * - `ctaLink?: { label: string; href: string }` — accent CTA pill
 *   between nav links and GitHub button
 * - `minimal?: boolean` — logo only, no nav
 *
 * ### `<PoweredByHeader>`
 *
 * Compact header for embedded/sub-apps.
 * Props: `poweredByUrl?`, `poweredByLabel?`
 *
 * ### `<Footer>`
 *
 * Props: `repoUrl?`, `repoLabel?`, `orgName?`
 *
 * ### `<CopyButton>`
 *
 * Props: `text: string` — the value copied to clipboard.
 * Position inside a `position: relative` container.
 * Has a 44px min touch target for mobile accessibility.
 *
 * ## Accessibility checklist
 *
 * - Add `data-fzui` to root elements of custom components
 * - Call `injectGlobalStyles()` in component render (idempotent)
 * - Use `useHoverLift` (not `hoverLiftHandlers`) for motion-safe hover
 * - Buttons/links must be at least 44px in the smallest dimension
 * - Use `textMuted` (not lower-alpha values) for de-emphasized text
 *
 * ## Branding
 *
 * - Write "Forkzero" in prose, never "ForkZero"
 * - Logo renders as "FORK" (bold) + "ZERO" (thin) via Header component
 *
 * ## Do not
 *
 * - Hardcode color hex/hsl values — always use `colors.*`
 * - Use `hoverLiftHandlers` — it is deprecated, use `useHoverLift`
 * - Skip `data-fzui` on component roots — focus rings won't work
 * - Set touch targets below 44px
 */

export { colors, shadows, radius, fonts, fontSizes, gradient } from './tokens'
export {
  codeBlock,
  inlineCode,
  pageWrapper,
  cardBase,
  sectionTitle,
  containerNarrow,
  containerWide,
  LATTICE_LAYERS,
  LATTICE_EDGES,
  hoverLiftHandlers,
  useHoverLift,
  useReducedMotion,
  injectGlobalStyles,
} from './styles'
export { Header } from './components/Header'
export type { HeaderLink, HeaderProps, PoweredByHeaderProps } from './components/Header'
export { PoweredByHeader } from './components/Header'
export { Footer } from './components/Footer'
export type { FooterProps } from './components/Footer'
export { CopyButton } from './components/CopyButton'
