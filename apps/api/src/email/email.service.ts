/** Provider-agnostic email sending. The rest of the app depends on this, never on an SDK. */
export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Stable key so a retried job never sends the same email twice (Resend Idempotency-Key). */
  idempotencyKey: string;
}

export interface SendResult {
  id: string | null;
  provider: 'resend' | 'mailpit' | 'log';
}

export interface EmailService {
  send(email: OutgoingEmail): Promise<SendResult>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
export const EMAIL_QUEUE = 'email';
