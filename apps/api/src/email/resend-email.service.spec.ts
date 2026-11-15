import type { Resend } from 'resend';
import { describe, expect, it, vi } from 'vitest';
import { EmailSendError, ResendEmailService } from './resend-email.service.js';

function mockResend(result: unknown) {
  const send = vi.fn().mockResolvedValue(result);
  // Only `emails.send` is used by the service; the rest of the SDK surface is irrelevant here.
  const client = { emails: { send } } as unknown as Resend;
  return { client, send };
}

const email = {
  to: 'merchant@example.com',
  subject: 'Confirm your email',
  html: '<p>Hi</p>',
  text: 'Hi',
  idempotencyKey: 'verify:user_1:abc',
};

describe('ResendEmailService', () => {
  it('sends through the Resend SDK with an idempotency key', async () => {
    const { client, send } = mockResend({ data: { id: 'em_123' }, error: null });
    const service = new ResendEmailService(client, 'Ojara <hello@ojara.store>');

    await expect(service.send(email)).resolves.toEqual({ id: 'em_123', provider: 'resend' });
    expect(send).toHaveBeenCalledWith(
      {
        from: 'Ojara <hello@ojara.store>',
        to: 'merchant@example.com',
        subject: 'Confirm your email',
        html: '<p>Hi</p>',
        text: 'Hi',
      },
      { idempotencyKey: 'verify:user_1:abc' },
    );
  });

  it('throws on a Resend error so the queue retries', async () => {
    const { client } = mockResend({ data: null, error: { message: 'rate limited', name: 'rate_limit_exceeded' } });
    const service = new ResendEmailService(client, 'Ojara <hello@ojara.store>');
    await expect(service.send(email)).rejects.toBeInstanceOf(EmailSendError);
  });
});
