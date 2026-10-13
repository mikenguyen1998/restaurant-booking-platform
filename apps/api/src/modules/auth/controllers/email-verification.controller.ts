import {
  CurrentUser,
  EmailVerificationService,
  Public,
} from '@nestjs/authentication';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import type { PublicUser } from '../../users/entities/user.entity.js';
import { VerifyEmailDto } from '../dto/auth.dto.js';
import { minutes, Throttle } from '@nestjs/throttler';

@Controller('auth/email')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // POST, not GET: mail scanners follow links with GET and would spend the token.
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() body: VerifyEmailDto) {
    const verified = await this.emailVerificationService.verify(body.token);
    if (!verified) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { email: verified.email, emailVerified: true };
  }

  /** "Send the link again", to the signed-in user's current address only. */
  @Post('verification')
  @Throttle({ default: { limit: 3, ttl: minutes(15) } })
  @HttpCode(HttpStatus.ACCEPTED)
  async resend(@CurrentUser() user: PublicUser): Promise<void> {
    if (user.emailVerified) {
      throw new ConflictException('Email address already verified');
    }
    if (!user.email) {
      throw new BadRequestException('The account has no email address');
    }
    await this.emailVerificationService.send({
      id: user.id,
      email: user.email,
    });
  }
}
