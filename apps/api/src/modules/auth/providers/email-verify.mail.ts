import {
  AuthenticationRegistry,
  EmailVerificationHandler,
  type EmailVerificationLink,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { Mailer, type Mailable } from '@nestjs/mail';
import { UsersRepository } from '../../users/repositories/users.repository.js';

/** Renders the verification email; `url` already carries the one-time token. */
@Injectable()
export class VerifyEmailMail implements Mailable<EmailVerificationLink> {
  render({ url }: EmailVerificationLink) {
    return {
      subject: 'Xác nhận email',
      template: 'verify-email',
      context: { url },
    };
  }
}

/**
 * Called by EmailVerificationService, never by our code: `send()` after it stored
 * the token, `markVerified()` when a link is used.
 */
@Injectable()
export class EmailVerificationMailer extends EmailVerificationHandler {
  constructor(
    private readonly users: UsersRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('emailVerification', this);
  }

  async send(link: EmailVerificationLink): Promise<void> {
    await this.mailer.send(VerifyEmailMail, { to: link.email, data: link });
  }

  // Only if `email` is still the user's address: a link sent to an old one verifies nothing.
  markVerified(userId: string, email: string): Promise<boolean> {
    return this.users.markEmailVerified(userId, email);
  }
}
