import { Column, Row, Section, Text } from 'react-email';
import { emailTokens as t } from '../tokens.js';

/** A pre-formatted order line: templates never do money maths. */
export interface EmailOrderLine {
  name: string;
  detail: string | null;
  quantity: number;
  totalFormatted: string;
}

const cell = { fontSize: 14, lineHeight: '20px', color: t.forest, margin: 0 } as const;

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row>
      <Column>
        <Text
          style={{
            ...cell,
            fontWeight: strong ? 700 : 400,
            color: strong ? t.forest : t.textSecondary,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column align="right">
        <Text style={{ ...cell, fontWeight: strong ? 700 : 500 }}>{value}</Text>
      </Column>
    </Row>
  );
}

/** Item rows, then subtotal / delivery / total. */
export function OrderLines({
  lines,
  subtotalFormatted,
  deliveryFormatted,
  totalFormatted,
}: {
  lines: EmailOrderLine[];
  subtotalFormatted: string;
  deliveryFormatted: string;
  totalFormatted: string;
}) {
  return (
    <Section style={{ margin: '16px 0' }}>
      {lines.map((l, i) => (
        <Row key={`${l.name}-${i}`} style={{ borderBottom: `1px solid ${t.border}` }}>
          <Column style={{ padding: '8px 0' }}>
            <Text style={{ ...cell, fontWeight: 600 }}>
              {l.quantity} × {l.name}
            </Text>
            {l.detail ? (
              <Text style={{ ...cell, color: t.textSecondary, fontSize: 13 }}>{l.detail}</Text>
            ) : null}
          </Column>
          <Column align="right" style={{ verticalAlign: 'top', padding: '8px 0' }}>
            <Text style={cell}>{l.totalFormatted}</Text>
          </Column>
        </Row>
      ))}
      <Section style={{ paddingTop: 8 }}>
        <SummaryRow label="Subtotal" value={subtotalFormatted} />
        <SummaryRow label="Delivery" value={deliveryFormatted} />
        <SummaryRow label="Total paid" value={totalFormatted} strong />
      </Section>
    </Section>
  );
}
