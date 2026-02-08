export const colors = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f8f9fa',
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#4a4a6a',
  textMuted: '#6c757d',
  borderColor: '#e9ecef',
  accentBlue: '#3b82f6',
  accentGreen: '#10b981',
  accentYellow: '#f59e0b',
  accentRed: '#ef4444',
  accentPurple: '#8b5cf6',
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 6px 12px rgba(0,0,0,0.1)',
} as const

export const radius = '8px'

export const fonts = {
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  mono: "'SF Mono', Monaco, Consolas, monospace",
} as const

export const gradient = `linear-gradient(135deg, ${colors.accentBlue}, ${colors.accentPurple})`
