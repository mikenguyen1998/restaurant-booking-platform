import { AuthenticationModule } from '@nestjs/authentication';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '@nestjs/mail';
import { authenticationConfig } from './config/authentication.config.js';
import { cacheConfig } from './config/cache.config.js';
import { mailConfig } from './config/mail.config.js';
import { HealthModule } from './health/health.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { CollectionsModule } from './modules/collections/collections.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { RestaurantsModule } from './modules/restaurants/restaurants.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(cacheConfig),
    MailModule.forRootAsync(mailConfig),
    AuthenticationModule.forRootAsync(authenticationConfig),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    BookingsModule,
    ReviewsModule,
    CollectionsModule,
    NotificationsModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
