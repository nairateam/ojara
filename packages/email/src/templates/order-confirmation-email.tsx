import { Heading, Text } from 'react-email';
import { EmailLayout, headingStyle, paragraphStyle } from '../components/email-layout.js';
import { type EmailOrderLine, OrderLines } from '../components/order-lines.js';

export interface OrderConfirmationEmailProps {
  storeName: string;
  customerName: string;
  orderNumber: string;
  lines: EmailOrderLine[];
  subtotalFormatted: string;
  deliveryFormatted: string;
  totalFormatted: string;
  /** "Delivery to 12 Market Road, Yaba (Lagos Mainland, 1–2 days)." or "Pickup at …". */
  fulfilment: string;
  /** The merchant's own note (Settings → Delivery); optional. */
  storeNote: string | null;
  /** How to reach the store (WhatsApp number or email); optional. */
  storeContact: string | null;
}

/** Sent to the shopper once their payment is confirmed (Paystack webhook). */
export function OrderConfirmationEmail(props: OrderConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Your ${props.storeName} order ${props.orderNumber} is confirmed`}>
      <Heading as="h1" style={headingStyle}>
        Thanks for your order, {props.customerName}
      </Heading>
      <Text style={paragraphStyle}>
        {props.storeName} has received your payment for order <strong>{props.orderNumber}</strong>.
      </Text>
      <OrderLines
        lines={props.lines}
        subtotalFormatted={props.subtotalFormatted}
        deliveryFormatted={props.deliveryFormatted}
        totalFormatted={props.totalFormatted}
      />
      <Text style={paragraphStyle}>{props.fulfilment}</Text>
      {props.storeNote ? <Text style={paragraphStyle}>{props.storeNote}</Text> : null}
      {props.storeContact ? (
        <Text style={paragraphStyle}>
          Questions? Contact {props.storeName}: {props.storeContact}
        </Text>
      ) : null}
    </EmailLayout>
  );
}

OrderConfirmationEmail.PreviewProps = {
  storeName: 'Adùnní Threads',
  customerName: 'Tolu',
  orderNumber: '#1042',
  lines: [
    { name: 'Adire Wrap Dress', detail: 'M / Indigo', quantity: 1, totalFormatted: '₦18,500' },
    { name: 'Aso-Oke Tote', detail: null, quantity: 2, totalFormatted: '₦30,000' },
  ],
  subtotalFormatted: '₦48,500',
  deliveryFormatted: '₦2,500',
  totalFormatted: '₦51,000',
  fulfilment: 'Delivery to 12 Market Road, Yaba, Lagos (Lagos Mainland, 1–2 days).',
  storeNote: 'We pack every order by hand.',
  storeContact: 'WhatsApp +234 803 555 0144',
} satisfies OrderConfirmationEmailProps;
