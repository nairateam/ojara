import { Button, Heading, Text } from 'react-email';
import {
  buttonStyle,
  EmailLayout,
  headingStyle,
  paragraphStyle,
} from '../components/email-layout.js';
import { type EmailOrderLine, OrderLines } from '../components/order-lines.js';

export interface NewOrderEmailProps {
  storeName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  lines: EmailOrderLine[];
  subtotalFormatted: string;
  deliveryFormatted: string;
  totalFormatted: string;
  fulfilment: string;
  orderUrl: string;
}

/** Sent to the store owner when an order is paid. */
export function NewOrderEmail(props: NewOrderEmailProps) {
  return (
    <EmailLayout preview={`New paid order ${props.orderNumber}: ${props.totalFormatted}`}>
      <Heading as="h1" style={headingStyle}>
        New order {props.orderNumber}
      </Heading>
      <Text style={paragraphStyle}>
        {props.customerName}
        {props.customerPhone ? ` (${props.customerPhone})` : ''} paid {props.totalFormatted} on{' '}
        {props.storeName}.
      </Text>
      <OrderLines
        lines={props.lines}
        subtotalFormatted={props.subtotalFormatted}
        deliveryFormatted={props.deliveryFormatted}
        totalFormatted={props.totalFormatted}
      />
      <Text style={paragraphStyle}>{props.fulfilment}</Text>
      <Button href={props.orderUrl} style={buttonStyle}>
        View order
      </Button>
    </EmailLayout>
  );
}

NewOrderEmail.PreviewProps = {
  storeName: 'Adùnní Threads',
  orderNumber: '#1042',
  customerName: 'Tolu Adeyemi',
  customerPhone: '+234 803 555 0144',
  lines: [
    { name: 'Adire Wrap Dress', detail: 'M / Indigo', quantity: 1, totalFormatted: '₦18,500' },
  ],
  subtotalFormatted: '₦18,500',
  deliveryFormatted: '₦2,500',
  totalFormatted: '₦21,000',
  fulfilment: 'Delivery to 12 Market Road, Yaba, Lagos (Lagos Mainland).',
  orderUrl: 'http://app.ojara.localhost:3000/orders/abc',
} satisfies NewOrderEmailProps;
