import { Logger } from '@nestjs/common';
import type { EmailService, OutgoingEmail, SendResult } from './email.service.js';

/** Local development: delivers to Mailpit through its HTTP send API (no SMTP library needed). */
export class MailpitEmailService implements EmailService {
  constructor(
    private readonly apiUrl: string,
    private readonly from: string,
  ) {}

  async send(email: OutgoingEmail): Promise<SendResult> {
    const fromMatch = /^(.*)<(.+)>$/.exec(this.from);
    const res = await fetch(new URL('/api/v1/send', this.apiUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        From: fromMatch
          ? { Name: fromMatch[1]?.trim().replace(/^"|"$/g, ''), Email: fromMatch[2] }
          : { Email: this.from },
        To: [{ Email: email.to }],
        Subject: email.subject,
        HTML: email.html,
        Text: email.text,
        Headers: { 'Idempotency-Key': email.idempotencyKey },
      }),
    });
    if (!res.ok) throw new Error(`Mailpit returned ${res.status}`);
    const body = (await res.json()) as { ID?: string };
    return { id: body.ID ?? null, provider: 'mailpit' };
  }
}

/** Fallback when neither Resend nor Mailpit is configured: logs the email instead of sending. */
export class LogEmailService implements EmailService {
  private readonly logger = new Logger('Email');

  send(email: OutgoingEmail): Promise<SendResult> {
    this.logger.log(
      `[email not sent: no RESEND_API_KEY or MAILPIT_API_URL]\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`,
    );
    return Promise.resolve({ id: null, provider: 'log' });
  }
}
