import {
  AuthenticationRegistry,
  PasswordResetAccount,
  PasswordResetHandler,
  PasswordResetLink,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { Mailer, type Mailable } from '@nestjs/mail';
import { UsersRepository } from '../../users/repositories/users.repository.js';
@Injectable()
export class ResetPasswordMail implements Mailable<PasswordResetLink> {
  render({ url }: PasswordResetLink) {
    return {
      subject: 'Đặt lại mật khẩu',
      template: 'password-reset',
      context: { url },
    };
  }
}
@Injectable()
export class PasswordResetMailer extends PasswordResetHandler {
  constructor(
    private readonly users: UsersRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('passwordReset', this);
  }

  override async findUser(email: string): Promise<PasswordResetAccount | null> {
    const found = await this.users.findCredentials(email);

    if (!found?.user.email) return null;
    return {
      id: found.user.id,
      email: found.user.email,
      passwordHash: found.passwordHash,
    };
  }

  async send(link: PasswordResetLink): Promise<void> {
    await this.mailer.send(ResetPasswordMail, { to: link.email, data: link });
  }

  override updatePassword(userId: string, passwordHash: string): Promise<void> {
    return this.users.updatePasswordHash(userId, passwordHash);
  }
}
