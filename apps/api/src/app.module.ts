import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { RestaurantsModule } from './modules/restaurants/restaurants.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { CollectionsModule } from './modules/collections/collections.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AdminModule } from './modules/admin/admin.module.js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RestaurantsModule,
    BookingsModule,
    ReviewsModule,
    CollectionsModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
