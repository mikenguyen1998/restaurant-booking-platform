import type { EmailVerificationService } from '@nestjs/authentication';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicUser } from '../../users/entities/user.entity.js';
import { EmailVerificationController } from './email-verification.controller.js';

const user: PublicUser = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'an@example.com',
  emailVerified: false,
  phone: null,
  name: 'An',
  role: 'CUSTOMER',
  createdAt: new Date('2026-10-08T00:00:00Z'),
  updatedAt: new Date('2026-10-08T00:00:00Z'),
};

describe('EmailVerificationController', () => {
  let service: {
    verify: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  };
  let controller: EmailVerificationController;

  beforeEach(() => {
    service = {
      verify: vi.fn(),
      send: vi.fn().mockResolvedValue({ expiresAt: new Date() }),
    };
    controller = new EmailVerificationController(
      service as unknown as EmailVerificationService,
    );
  });

  describe('verify', () => {
    it('confirms the address the link was sent to', async () => {
      service.verify.mockResolvedValue({ userId: user.id, email: user.email });

      await expect(controller.verify({ token: 'tok' })).resolves.toEqual({
        email: 'an@example.com',
        emailVerified: true,
      });
      expect(service.verify).toHaveBeenCalledWith('tok');
    });

    it('rejects an unknown, used or expired token with 400', async () => {
      service.verify.mockResolvedValue(null);

      await expect(controller.verify({ token: 'tok' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('resend', () => {
    it('sends a new link to the signed-in user’s current address', async () => {
      await controller.resend(user);

      expect(service.send).toHaveBeenCalledWith({
        id: user.id,
        email: 'an@example.com',
      });
    });

    it('refuses with 409 when the address is already verified', async () => {
      await expect(
        controller.resend({ ...user, emailVerified: true }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(service.send).not.toHaveBeenCalled();
    });

    it('refuses with 400 when the account has no email address', async () => {
      await expect(
        controller.resend({ ...user, email: null }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(service.send).not.toHaveBeenCalled();
    });
  });
});
