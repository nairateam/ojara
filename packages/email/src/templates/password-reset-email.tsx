import { Button, Heading, Link, Text } from 'react-email';
import { emailTokens } from '../tokens.js';
import {
  buttonStyle,
  EmailLayout,
  headingStyle,
  paragraphStyle,
} from '../components/email-layout.js';

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your Ojara password">
      <Heading as="h1" style={headingStyle}>
        Reset your password
      </Heading>
      <Text style={paragraphStyle}>
        Hi {name}, we got a request to reset the password for your Ojara account. Tap the button
        below to choose a new one. The link expires in one hour and can only be used once.
      </Text>
      <Button href={resetUrl} style={buttonStyle}>
        Choose a new password
      </Button>
      <Text style={{ ...paragraphStyle, fontSize: 13, marginTop: 24 }}>
        Or paste this link into your browser:{' '}
        <Link href={resetUrl} style={{ color: emailTokens.forest, wordBreak: 'break-all' }}>
          {resetUrl}
        </Link>
      </Text>
      <Text style={{ ...paragraphStyle, fontSize: 13, margin: 0 }}>
        If you didn&apos;t ask for this, you can ignore this email — your password won&apos;t
        change. Resetting signs you out on every device.
      </Text>
    </EmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  name: 'Adunni',
  resetUrl: 'http://api.ojara.localhost:4000/v1/auth/reset-password/example',
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
