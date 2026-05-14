export const theme = {
  colors: {
    background: '#FAFAF8',
    surface: '#F0EEEA',
    surfaceHover: '#E5E2DC',
    text: '#1A1A1A',
    textSecondary: '#6B6560',
    textTertiary: '#9B9590',
    accent: '#1A1A1A',
    accentLight: '#EAE7E1',
    border: '#E5E2DC',
    white: '#FFFFFF',
  },
  typography: {
    heading: { fontFamily: 'System', fontWeight: '700' as const },
    body: { fontFamily: 'System', fontWeight: '400' as const },
    mono: { fontFamily: 'Menlo' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
} as const;

export type Theme = typeof theme;
