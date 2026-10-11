import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import type { PublicUser } from '../../users/entities/user.entity.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';

/** Reads the `__Host-sid` session cookie and loads the user of the session. */
@Injectable()
export class SessionAuth extends SessionCookieProvider<PublicUser> {
  constructor(
    private readonly usersRepository: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  // Runs on every request with a live session. Loading the user each time means a
  // deleted user (or a changed role) takes effect immediately; null ends the session.
  validate(session: SessionRecord) {
    return this.usersRepository.findById(session.userId);
  }
}
