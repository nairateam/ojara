/**
 * Terra brand tokens for email. Mirrors design/tokens/ojara-terra.tokens.json.
 * Email clients cannot use CSS variables reliably, so the hex values are inlined here.
 */
export const emailTokens = {
  paper: '#EBEDDF',
  surface: '#F5F6EE',
  surfaceMuted: '#E0E3D1',
  border: '#D6DAC6',
  forest: '#333A2F',
  textSecondary: '#5E6559',
  textTertiary: '#8D9387',
  fontBody: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontDisplay: "'Bricolage Grotesque', Inter, 'Helvetica Neue', Arial, sans-serif",
} as const;
