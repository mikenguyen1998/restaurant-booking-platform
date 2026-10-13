import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

process.loadEnvFile(path.resolve(import.meta.dirname, '../../../.env'));

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const webUrl = configService.getOrThrow<string>('WEB_URL');

  // The web app (another origin) sends the session cookie with credentials: 'include'.
  app.enableCors({ origin: webUrl, credentials: true });
  // Refuses cross-origin writes (403) on every route, public ones included;
  // same trusted origins as the session options.
  app.enableCsrfProtection({ trustedOrigins: [webUrl] });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Restaurant Booking API')
    .setDescription('The Restaurant Booking API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Number of proxies in front of the API (e.g. 1 on Railway/Render). Unset in
  // development: trusting X-Forwarded-For without a proxy lets clients fake their IP
  // and dodge the rate limits.
  const trustProxy = configService.get<string>('TRUST_PROXY');
  if (trustProxy) app.set('trust proxy', Number(trustProxy));

  // Lets modules close connections (Redis, SMTP, Prisma) when the process is stopped.
  app.enableShutdownHooks();

  await app.listen(process.env.API_PORT ?? 4000);
}
await bootstrap();
