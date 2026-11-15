import type { ReactNode } from 'react';
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from 'react-email';
import { emailTokens as t } from '../tokens.js';

export interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

/** Shared frame: paper background, surface card, "ojara." wordmark, muted footer. */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{ backgroundColor: t.paper, fontFamily: t.fontBody, margin: 0, padding: '32px 0' }}
      >
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          <Text
            style={{
              fontFamily: t.fontDisplay,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.7px',
              color: t.forest,
              margin: '0 0 20px',
            }}
          >
            ojara<span style={{ color: t.forest }}>.</span>
          </Text>
          <Section
            style={{
              backgroundColor: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 32,
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: t.border, margin: '24px 0 12px' }} />
          <Text style={{ color: t.textTertiary, fontSize: 12, lineHeight: '18px', margin: 0 }}>
            Ojara - online stores for Nigerian businesses. You received this email because of
            activity on your Ojara account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const headingStyle = {
  fontFamily: t.fontDisplay,
  fontSize: 24,
  lineHeight: '30px',
  fontWeight: 600,
  letterSpacing: '-0.5px',
  color: t.forest,
  margin: '0 0 12px',
} as const;

export const paragraphStyle = {
  fontSize: 15,
  lineHeight: '23px',
  color: t.textSecondary,
  margin: '0 0 16px',
} as const;

export const buttonStyle = {
  backgroundColor: t.forest,
  color: t.paper,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  padding: '12px 20px',
  textDecoration: 'none',
  display: 'inline-block',
} as const;
