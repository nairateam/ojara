import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { EmailTemplateName, EmailTemplateProps } from '@ojara/email';
import type { Queue } from 'bullmq';
import { EMAIL_QUEUE } from './email.service.js';

export interface EmailJob<K extends EmailTemplateName = EmailTemplateName> {
  template: K;
  props: EmailTemplateProps[K];
  to: string;
  subject: string;
  idempotencyKey: string;
}

/** Enqueues emails. All sending goes through the `email` queue; nothing sends inline. */
@Injectable()
export class EmailProducer {
  constructor(@InjectQueue(EMAIL_QUEUE) private readonly queue: Queue<EmailJob>) {}

  async enqueue<K extends EmailTemplateName>(job: EmailJob<K>): Promise<void> {
    await this.queue.add(job.template, job, {
      // BullMQ ignores a job whose id already exists, so re-enqueueing is idempotent.
      jobId: job.idempotencyKey.replaceAll(':', '_'),
      attempts: 6,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 24 * 3600, count: 1000 },
      removeOnFail: { age: 7 * 24 * 3600 },
    });
  }
}
