import {
  CurrentSession,
  CurrentUser,
  Public,
  SessionService,
  SignInService,
  type SessionRecord,
} from '@nestjs/authentication';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

export interface SessionView {
  id: string;
  createdAt: Date;
  lastActiveAt: Date;
  userAgent: string | null;
  current: boolean;
}

/** Where the user is signed in, and signing out (here, one device, or everywhere). */
@Controller('auth')
export class SessionsController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly signInService: SignInService,
  ) {}

  @Get('sessions')
  async list(
    @CurrentUser('id') userId: string,
    @CurrentSession() current: SessionRecord,
  ): Promise<SessionView[]> {
    const sessions = await this.sessionService.list(userId);
    return sessions.map(({ id, createdAt, lastActiveAt, metadata }) => ({
      id,
      createdAt,
      lastActiveAt,
      userAgent:
        typeof metadata?.userAgent === 'string' ? metadata.userAgent : null,
      current: id === current.id,
    }));
  }

  // revoke() only ends a session of this user: another user's session id is a 404.
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    if (!(await this.sessionService.revoke(id, { userId }))) {
      throw new NotFoundException();
    }
  }

  // Public so a half-signed-in session (pending second factor) can sign out too.
  @Public()
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(): Promise<void> {
    if (!(await this.signInService.signOut())) {
      throw new UnauthorizedException();
    }
  }

  @Post('sign-out-everywhere')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOutEverywhere(@CurrentUser('id') userId: string): Promise<void> {
    await this.signInService.signOutEverywhere(userId);
  }
}
