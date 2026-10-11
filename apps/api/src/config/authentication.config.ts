import type { AuthenticationModuleAsyncOptions } from '@nestjs/authentication';
import { ConfigService } from '@nestjs/config';

/**
 * @nestjs/authentication with server-side sessions in an HttpOnly cookie
 * (`__Host-sid`): the web app never handles a token in JavaScript, and signing
 * out takes effect immediately. Lifetimes are '14d'-style strings or milliseconds.
 */
export const authenticationConfig: AuthenticationModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const webUrl = config.getOrThrow<string>('WEB_URL');
    return {
      session: {
        absoluteTtl: '14d', // signed out after 14 days, however active
        idleTtl: '3d', // or after 3 days without a request
        // The web app runs on another origin than the API: let its pages use the cookie.
        trustedOrigins: [webUrl],
        // Stored with every session so users can tell their devices apart.
        metadata: (request) => ({ userAgent: request.headers['user-agent'] }),
      },
      emailVerification: { url: `${webUrl}/verify-email` },
      passwordReset: { url: `${webUrl}/reset-password` },
    };
  },
};
