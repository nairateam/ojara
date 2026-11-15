import { Resend } from 'resend';
import type { EmailService, OutgoingEmail, SendResult } from './email.service.js';

export class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendError';
  }
}

/** Production transport via the official Resend SDK. */
export class ResendEmailService implements EmailService {
  constructor(
    private readonly client: Resend,
    private readonly from: string,
  ) {}

  static create(apiKey: string, from: string): ResendEmailService {
    return new ResendEmailService(new Resend(apiKey), from);
  }

  async send(email: OutgoingEmail): Promise<SendResult> {
    const { data, error } = await this.client.emails.send(
      { from: this.from, to: email.to, subject: email.subject, html: email.html, text: email.text },
      { idempotencyKey: email.idempotencyKey },
    );
    // Throwing lets BullMQ retry with exponential backoff.
    if (error) throw new EmailSendError(`Resend rejected email: ${error.message}`);
    return { id: data?.id ?? null, provider: 'resend' };
  }
}
