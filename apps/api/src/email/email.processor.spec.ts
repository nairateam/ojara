import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import { EmailProcessor } from './email.processor.js';
import type { EmailJob } from './email.producer.js';
import type { EmailService } from './email.service.js';

describe('EmailProcessor', () => {
  it('renders the template and sends html + text with the idempotency key', async () => {
    const send = vi.fn<EmailService['send']>().mockResolvedValue({ id: '1', provider: 'log' });
    const processor = new EmailProcessor({ send });
    const job = {
      id: 'j1',
      data: {
        template: 'verify-email',
        props: { name: 'Ada', verifyUrl: 'https://api.ojara.store/v1/auth/verify-email?token=t' },
        to: 'ada@example.com',
        subject: 'Confirm your email',
        idempotencyKey: 'verify:u1:t',
      },
    } as Job<EmailJob>;

    await processor.process(job);

    const sent = send.mock.calls[0]?.[0];
    expect(sent?.to).toBe('ada@example.com');
    expect(sent?.idempotencyKey).toBe('verify:u1:t');
    expect(sent?.html).toContain('Confirm your email');
    expect(sent?.text).toContain('https://api.ojara.store/v1/auth/verify-email?token=t');
  });
});
