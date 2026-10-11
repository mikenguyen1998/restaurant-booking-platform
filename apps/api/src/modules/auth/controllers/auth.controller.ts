import { Public, SignInService } from '@nestjs/authentication';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import type { PublicUser } from '../../users/entities/user.entity.js';
import { SignInDto, SignUpDto } from '../dto/auth.dto.js';
import { CredentialsService } from '../services/credentials.service.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly signInService: SignInService,
  ) {}

  /** Creates the account and signs it in on this browser (sets the session cookie). */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: SignUpDto): Promise<PublicUser> {
    const user = await this.credentials.register(body);
    await this.signInService.signIn(user.id, { method: 'password' });
    return user;
  }

  /**
   * Email + password → session cookie. SignInService sets the cookie itself,
   * replaces this browser's previous session (session fixation) and refuses a
   * sign-in posted from another site (login CSRF).
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: SignInDto): Promise<PublicUser> {
    const user = await this.credentials.verify(body.email, body.password);
    if (!user) {
      // Same answer for an unknown email and a wrong password.
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.signInService.signIn(user.id, { method: 'password' });
    return user;
  }
}
