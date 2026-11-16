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
    const lines = [
      { name: 'Adire Wrap Dress', detail: 'M', quantity: 2, totalFormatted: '₦37,000' },
    ];
    const totals = {
      subtotalFormatted: '₦37,000',
      deliveryFormatted: '₦2,000',
      totalFormatted: '₦39,000',
    };
    const order = await renderEmail('order-confirmation', {
      storeName: 'Adunni Threads',
      customerName: 'Tolu',
      orderNumber: '#1042',
      lines,
      ...totals,
      fulfilment: 'Pickup at 12 Market Road.',
      storeNote: null,
      storeContact: 'WhatsApp +234 803 555 0144',
    });
    expect(order.text).toContain('#1042');
    expect(order.text).toContain('2 × Adire Wrap Dress');
    expect(order.text).toContain('₦39,000');
    expect(order.text).toContain('WhatsApp +234 803 555 0144');

    const merchant = await renderEmail('new-order', {
      storeName: 'Adunni Threads',
      orderNumber: '#1042',
      customerName: 'Tolu',
      customerPhone: '+2348035550144',
      lines,
      ...totals,
      fulfilment: 'Pickup',
      orderUrl: 'https://app.ojara.store/orders/o1',
    });
    expect(merchant.text).toMatch(/new order #1042/i);
    expect(merchant.text).toContain('https://app.ojara.store/orders/o1');
  });
});

describe('password reset email', () => {
  it('renders the reset link in html and text', async () => {
    const url = 'https://api.ojara.store/v1/auth/reset-password/tok?callbackURL=x';
    const { html, text } = await renderEmail('password-reset', { name: 'Ada', resetUrl: url });
    expect(html).toContain('Choose a new password');
    expect(text).toContain('https://api.ojara.store/v1/auth/reset-password/tok');
  });
});
