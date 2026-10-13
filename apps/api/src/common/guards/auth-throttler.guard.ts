import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { normalizeEmail } from '@restaurant-platform/shared';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    const ip = await super.getTracker(req);
    const email =
      typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '';
    return email ? `${email}|${ip}` : ip;
  }
}
