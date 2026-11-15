import { Button, Heading, Text } from 'react-email';
import {
  buttonStyle,
  EmailLayout,
  headingStyle,
  paragraphStyle,
} from '../components/email-layout.js';

export interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Ojara - let's set up your store">
      <Heading as="h1" style={headingStyle}>
        Welcome to Ojara, {name}
      </Heading>
      <Text style={paragraphStyle}>
        Your account is ready. Add your products, set up delivery and connect Paystack to start
        taking orders online.
      </Text>
      <Button href={dashboardUrl} style={buttonStyle}>
        Set up your store
      </Button>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  name: 'Adunni',
  dashboardUrl: 'http://app.ojara.localhost:3000',
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
