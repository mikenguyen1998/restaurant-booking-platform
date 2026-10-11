import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

process.loadEnvFile(path.resolve(import.meta.dirname, '../../../.env'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const webUrl = app.get(ConfigService).getOrThrow<string>('WEB_URL');

  // The web app (another origin) sends the session cookie with credentials: 'include'.
  app.enableCors({ origin: webUrl, credentials: true });
  // Refuses cross-origin writes (403) on every route, public ones included;
  // same trusted origins as the session options.
  app.enableCsrfProtection({ trustedOrigins: [webUrl] });

  const config = new DocumentBuilder()
    .setTitle('Restaurant Booking API')
    .setDescription('The Restaurant Booking API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.API_PORT ?? 4000);
}
await bootstrap();
