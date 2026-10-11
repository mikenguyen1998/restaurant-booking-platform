import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import type { PublicUser } from '../entities/user.entity.js';

@Controller('me')
export class MeController {
  /** The signed-in user, loaded fresh by SessionAuth.validate() on every request. */
  @Get()
  me(@CurrentUser() user: PublicUser): PublicUser {
    return user;
  }
}
