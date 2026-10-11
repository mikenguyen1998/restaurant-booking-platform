import { ConfigService } from '@nestjs/config';
import type { MailModuleAsyncOptions } from '@nestjs/mail';
import {
  FileMailTransport,
  FileTemplateEngine,
  SmtpTransport,
} from '@nestjs/mail';
import { join } from 'node:path';

export const mailConfig: MailModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: config.get('SMTP_URL')
      ? new SmtpTransport({ url: config.get('SMTP_URL') })
      : new FileMailTransport({ directory: 'var/mail' }),
    templates: new FileTemplateEngine({
      dir: join(import.meta.dirname, '../mail/templates'),
      cache: config.get('NODE_ENV') === 'production',
    }),
    from: config.getOrThrow<string>('MAIL_FROM'),
  }),
};
