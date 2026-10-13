import { PasswordResetService, Public } from '@nestjs/authentication';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { EmailDto, ResetPasswordDto } from '../dto/auth.dto.js';
import { minutes, Throttle } from '@nestjs/throttler';

@Public()
@Controller('auth/password')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot')
  @Throttle({ default: { limit: 3, ttl: minutes(15) } })
  @HttpCode(202)
  forgot(@Body() body: EmailDto) {
    this.passwordResetService.request(body.email);
  }

  @Post('reset')
  @HttpCode(200)
  async reset(@Body() body: ResetPasswordDto) {
    const result = await this.passwordResetService.reset(
      body.token,
      body.password,
    );
    if (!result) throw new BadRequestException('Invalid or expired link');
  }
}
