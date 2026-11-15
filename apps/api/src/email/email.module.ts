import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { LogEmailService, MailpitEmailService } from './dev-email.services.js';
import { EmailProcessor } from './email.processor.js';
import { EmailProducer } from './email.producer.js';
import { EMAIL_QUEUE, EMAIL_SERVICE, type EmailService } from './email.service.js';
import { ResendEmailService } from './resend-email.service.js';

/**
 * Transactional email. Picks the transport from env:
 * RESEND_API_KEY -> Resend; otherwise MAILPIT_API_URL -> Mailpit; otherwise log only.
 * No controller: email is triggered by other modules, never directly over HTTP.
 */
@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE })],
  providers: [
    {
      provide: EMAIL_SERVICE,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): EmailService => {
        const { RESEND_API_KEY, MAILPIT_API_URL, EMAIL_FROM } = config.env;
        if (RESEND_API_KEY) return ResendEmailService.create(RESEND_API_KEY, EMAIL_FROM);
        if (MAILPIT_API_URL) return new MailpitEmailService(MAILPIT_API_URL, EMAIL_FROM);
        return new LogEmailService();
      },
    },
    EmailProducer,
    EmailProcessor,
  ],
  exports: [EmailProducer, EMAIL_SERVICE],
})
export class EmailModule {}
