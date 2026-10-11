import type { PasswordResetService } from '@nestjs/authentication';
import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordResetController } from './password-reset.controller.js';

describe('PasswordResetController', () => {
  let service: {
    request: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
  };
  let controller: PasswordResetController;

  beforeEach(() => {
    service = { request: vi.fn(), reset: vi.fn() };
    controller = new PasswordResetController(
      service as unknown as PasswordResetService,
    );
  });

  describe('forgot', () => {
    it('hands the address to the library and returns without waiting', () => {
      // request() is synchronous on purpose: the lookup and the mail happen after
      // the response, so known and unknown addresses look the same.
      const result = controller.forgot({ email: 'an@example.com' });

      expect(result).toBeUndefined();
      expect(service.request).toHaveBeenCalledWith('an@example.com');
    });
  });

  describe('reset', () => {
    it('resets the password with the token from the link', async () => {
      service.reset.mockResolvedValue({ userId: 'user-1' });

      await expect(
        controller.reset({ token: 'tok', password: 'new-password-456' }),
      ).resolves.toBeUndefined();
      expect(service.reset).toHaveBeenCalledWith('tok', 'new-password-456');
    });

    it('does not ask the library to open a session (JWT only)', async () => {
      service.reset.mockResolvedValue({ userId: 'user-1' });

      await controller.reset({ token: 'tok', password: 'new-password-456' });

      expect(service.reset.mock.calls[0]).toHaveLength(2);
    });

    it('rejects an unknown, used or expired token with 400', async () => {
      service.reset.mockResolvedValue(null);

      await expect(
        controller.reset({ token: 'tok', password: 'new-password-456' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
