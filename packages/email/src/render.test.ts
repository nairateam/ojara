import { describe, expect, it } from 'vitest';
import { renderEmail } from './index.js';

describe('renderEmail', () => {
  it('renders the verify email to html and plain text', async () => {
    const url = 'https://api.ojara.store/v1/auth/verify-email?token=abc';
    const { html, text } = await renderEmail('verify-email', { name: 'Adunni', verifyUrl: url });
    expect(html).toContain('Confirm your email');
    expect(html).toContain('#333A2F');
    expect(text).toContain(url);
    expect(text).not.toContain('<');
  });

  it('renders the welcome and order templates', async () => {
    const welcome = await renderEmail('welcome', {
      name: 'Ada',
      dashboardUrl: 'https://app.ojara.store',
    });
    expect(welcome.text).toMatch(/welcome to ojara, ada/i);
    const order = await renderEmail('order-confirmation', {
      storeName: 'Adunni Threads',
      customerName: 'Tolu',
      orderNumber: '#1042',
      totalFormatted: '₦42,500',
    });
    expect(order.text).toContain('#1042');
  });
});
