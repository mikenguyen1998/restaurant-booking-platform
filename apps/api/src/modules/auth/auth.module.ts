import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './controllers/auth.controller.js';
import { EmailVerificationController } from './controllers/email-verification.controller.js';
import { PrismaAuthenticationStore } from './repositories/prisma-authentication.store.js';
import { SessionAuth } from './providers/session-auth.provider.js';
import { CredentialsService } from './services/credentials.service.js';
import {
  EmailVerificationMailer,
  VerifyEmailMail,
} from './providers/email-verify.mail.js';
import {
  PasswordResetMailer,
  ResetPasswordMail,
} from './providers/password-reset.mail.js';
import { PasswordResetController } from './controllers/password-reset.controller.js';
import { SessionsController } from './controllers/sessions.controller.js';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [
    AuthController,
    SessionsController,
    EmailVerificationController,
    PasswordResetController,
  ],
  // PrismaAuthenticationStore registers itself with AuthenticationStorage in its constructor.
  providers: [
    SessionAuth,
    CredentialsService,
    PrismaAuthenticationStore,
    EmailVerificationMailer,
    VerifyEmailMail,
    ResetPasswordMail,
    PasswordResetMailer,
  ],
})
export class AuthModule {}
