export const colors = {
  bgPrimary: 'hsl(220, 40%, 10%)',
  bgSecondary: 'hsl(220, 40%, 7%)',
  bgCard: 'hsl(220, 40%, 14%)',
  bgDeep: 'hsl(220, 40%, 6%)',
  bgGlass: 'rgba(15, 23, 42, 0.85)',
  textPrimary: '#e8f0fe',
  textOnAccent: 'hsl(220, 40%, 10%)',
  textSecondary: 'rgba(232, 240, 254, 0.7)',
  textMuted: 'rgba(232, 240, 254, 0.45)',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  accentBlue: 'hsl(180, 100%, 50%)',
  accentGreen: '#10b981',
  accentYellow: 'hsl(45, 100%, 50%)',
  accentRed: '#ef4444',
  accentPurple: '#8b5cf6',
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 6px 12px rgba(0, 0, 0, 0.5)',
} as const

export const radius = '8px'

export const fonts = {
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  mono: "'SF Mono', Monaco, Consolas, monospace",
} as const

export const gradient = `linear-gradient(135deg, hsl(220, 40%, 10%), hsl(220, 40%, 16%))`
