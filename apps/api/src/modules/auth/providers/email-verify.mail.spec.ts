import type {
  AuthenticationRegistry,
  EmailVerificationLink,
} from '@nestjs/authentication';
import type { Mailer } from '@nestjs/mail';
import { describe, expect, it, vi } from 'vitest';
import type { UsersRepository } from '../../users/repositories/users.repository.js';
import {
  EmailVerificationMailer,
  VerifyEmailMail,
} from './email-verify.mail.js';

const link: EmailVerificationLink = {
  userId: 'user-1',
  email: 'an@example.com',
  url: 'http://localhost:3000/verify-email?token=abc',
  expiresAt: new Date('2026-10-09T00:00:00Z'),
};

function createMailer() {
  const users = { markEmailVerified: vi.fn().mockResolvedValue(true) };
  const mailer = { send: vi.fn().mockResolvedValue({}) };
  const registry = { registerHandler: vi.fn() };
  const handler = new EmailVerificationMailer(
    users as unknown as UsersRepository,
    mailer as unknown as Mailer,
    registry as unknown as AuthenticationRegistry,
  );
  return { handler, users, mailer, registry };
}

describe('VerifyEmailMail', () => {
  it('renders the verify-email template with the tokenised link', () => {
    expect(new VerifyEmailMail().render(link)).toEqual({
      subject: 'Xác nhận email',
      template: 'verify-email',
      context: { url: link.url },
    });
  });
});

describe('EmailVerificationMailer', () => {
  it('registers itself as the emailVerification handler', () => {
    const { handler, registry } = createMailer();

    expect(registry.registerHandler).toHaveBeenCalledWith(
      'emailVerification',
      handler,
    );
  });

  it('mails the link to the address it was issued for', async () => {
    const { handler, mailer } = createMailer();

    await handler.send(link);

    expect(mailer.send).toHaveBeenCalledWith(VerifyEmailMail, {
      to: 'an@example.com',
      data: link,
    });
  });

  it('marks the address verified through the repository and reports the result', async () => {
    const { handler, users } = createMailer();
    users.markEmailVerified.mockResolvedValue(false);

    await expect(
      handler.markVerified('user-1', 'old@example.com'),
    ).resolves.toBe(false);
    expect(users.markEmailVerified).toHaveBeenCalledWith(
      'user-1',
      'old@example.com',
    );
  });
});
