import { Button, Heading, Link, Text } from 'react-email';
import { emailTokens } from '../tokens.js';
import { buttonStyle, EmailLayout, headingStyle, paragraphStyle } from '../components/email-layout.js';

export interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirm your email address for Ojara">
      <Heading as="h1" style={headingStyle}>
        Confirm your email
      </Heading>
      <Text style={paragraphStyle}>
        Hi {name}, tap the button below to confirm this is your email address. The link expires in
        one hour.
      </Text>
      <Button href={verifyUrl} style={buttonStyle}>
        Confirm email
      </Button>
      <Text style={{ ...paragraphStyle, fontSize: 13, marginTop: 24 }}>
        Or paste this link into your browser:{' '}
        <Link href={verifyUrl} style={{ color: emailTokens.forest, wordBreak: 'break-all' }}>
          {verifyUrl}
        </Link>
      </Text>
      <Text style={{ ...paragraphStyle, fontSize: 13, margin: 0 }}>
        If you didn&apos;t create an Ojara account, you can ignore this email.
      </Text>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  name: 'Adunni',
  verifyUrl: 'http://api.ojara.localhost:4000/v1/auth/verify-email?token=example',
} satisfies VerifyEmailProps;

export default VerifyEmail;
