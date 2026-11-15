import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { renderEmail } from '@ojara/email';
import type { Job } from 'bullmq';
import { WORKER_OPTIONS } from '../common/queue/worker-options.js';
import type { EmailJob } from './email.producer.js';
import { EMAIL_QUEUE, EMAIL_SERVICE, type EmailService, type SendResult } from './email.service.js';

@Processor(EMAIL_QUEUE, WORKER_OPTIONS)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(@Inject(EMAIL_SERVICE) private readonly email: EmailService) {
    super();
  }

  async process(job: Job<EmailJob>): Promise<SendResult> {
    const { template, props, to, subject, idempotencyKey } = job.data;
    const { html, text } = await renderEmail(template, props);
    const result = await this.email.send({ to, subject, html, text, idempotencyKey });
    this.logger.log(`Sent ${template} email via ${result.provider} (job ${job.id})`);
    return result;
  }
}
