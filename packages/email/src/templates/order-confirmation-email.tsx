import { Heading, Text } from 'react-email';
import { EmailLayout, headingStyle, paragraphStyle } from '../components/email-layout.js';

export interface OrderConfirmationEmailProps {
  storeName: string;
  customerName: string;
  orderNumber: string;
  /** Pre-formatted total (e.g. formatKobo(totalKobo)); templates never do money maths. */
  totalFormatted: string;
}

/**
 * PLACEHOLDER: the full order confirmation (line items, delivery, store branding) is built with
 * the checkout feature. Storefront emails will use the merchant's brand, not Ojara's.
 */
export function OrderConfirmationEmail({
  storeName,
  customerName,
  orderNumber,
  totalFormatted,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Your ${storeName} order ${orderNumber} is confirmed`}>
      <Heading as="h1" style={headingStyle}>
        Thanks for your order, {customerName}
      </Heading>
      <Text style={paragraphStyle}>
        {storeName} has received order <strong>{orderNumber}</strong> totalling{' '}
        <strong>{totalFormatted}</strong>. We&apos;ll email you when it&apos;s on its way.
      </Text>
    </EmailLayout>
  );
}

OrderConfirmationEmail.PreviewProps = {
  storeName: 'Adunni Threads',
  customerName: 'Tolu',
  orderNumber: '#1042',
  totalFormatted: '₦42,500',
} satisfies OrderConfirmationEmailProps;

export default OrderConfirmationEmail;
