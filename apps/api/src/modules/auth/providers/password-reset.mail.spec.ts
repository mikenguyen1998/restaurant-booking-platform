import type {
  AuthenticationRegistry,
  PasswordResetLink,
} from '@nestjs/authentication';
import type { Mailer } from '@nestjs/mail';
import { describe, expect, it, vi } from 'vitest';
import type { PublicUser } from '../../users/entities/user.entity.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';
import {
  PasswordResetMailer,
  ResetPasswordMail,
} from './password-reset.mail.js';

const link: PasswordResetLink = {
  userId: 'user-1',
  email: 'an@example.com',
  url: 'http://localhost:3000/reset-password?token=abc',
  expiresAt: new Date('2026-10-11T01:00:00Z'),
};

const user: PublicUser = {
  id: 'user-1',
  email: 'an@example.com',
  emailVerified: true,
  phone: null,
  name: 'An',
  role: 'CUSTOMER',
  createdAt: new Date('2026-10-01T00:00:00Z'),
  updatedAt: new Date('2026-10-01T00:00:00Z'),
};

function createMailer() {
  const users = {
    findCredentials: vi.fn(),
    updatePasswordHash: vi.fn().mockResolvedValue(undefined),
  };
  const mailer = { send: vi.fn().mockResolvedValue({}) };
  const registry = { registerHandler: vi.fn() };
  const handler = new PasswordResetMailer(
    users as unknown as UsersRepository,
    mailer as unknown as Mailer,
    registry as unknown as AuthenticationRegistry,
  );
  return { handler, users, mailer, registry };
}

describe('ResetPasswordMail', () => {
  it('renders the password-reset template with the tokenised link', () => {
    expect(new ResetPasswordMail().render(link)).toEqual({
      subject: 'Đặt lại mật khẩu',
      template: 'password-reset',
      context: { url: link.url },
    });
  });
});

describe('PasswordResetMailer', () => {
  it('registers itself as the passwordReset handler', () => {
    const { handler, registry } = createMailer();

    expect(registry.registerHandler).toHaveBeenCalledWith(
      'passwordReset',
      handler,
    );
  });

  describe('findUser', () => {
    it('returns the stored address and hash, never the typed one', async () => {
      const { handler, users } = createMailer();
      users.findCredentials.mockResolvedValue({ user, passwordHash: 'hash' });

      await expect(handler.findUser('AN@example.com')).resolves.toEqual({
        id: 'user-1',
        email: 'an@example.com',
        passwordHash: 'hash',
      });
    });

    it('returns null (not an error) for an unknown address', async () => {
      const { handler, users } = createMailer();
      users.findCredentials.mockResolvedValue(null);

      await expect(handler.findUser('nobody@example.com')).resolves.toBeNull();
    });

    it('returns null for an account without an email address', async () => {
      const { handler, users } = createMailer();
      users.findCredentials.mockResolvedValue({
        user: { ...user, email: null },
        passwordHash: 'hash',
      });

      await expect(handler.findUser('an@example.com')).resolves.toBeNull();
    });

    it('keeps a null hash for an account without a password', async () => {
      const { handler, users } = createMailer();
      users.findCredentials.mockResolvedValue({ user, passwordHash: null });

      await expect(handler.findUser('an@example.com')).resolves.toMatchObject({
        passwordHash: null,
      });
    });
  });

  it('mails the link to the address it was issued for', async () => {
    const { handler, mailer } = createMailer();

    await handler.send(link);

    expect(mailer.send).toHaveBeenCalledWith(ResetPasswordMail, {
      to: 'an@example.com',
      data: link,
    });
  });

  it('stores the new hash through the repository', async () => {
    const { handler, users } = createMailer();

    await handler.updatePassword('user-1', 'new-hash');

    expect(users.updatePasswordHash).toHaveBeenCalledWith('user-1', 'new-hash');
  });
});
