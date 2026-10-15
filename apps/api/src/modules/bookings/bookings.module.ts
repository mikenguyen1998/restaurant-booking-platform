import { Module } from '@nestjs/common';
import { BookingsController } from './controllers/bookings.controller.js';
import { OwnerBookingsController } from './controllers/owner-bookings.controller.js';
import { AdminBookingsController } from './controllers/admin-bookings.controller.js';
import { BookingsService } from './services/bookings.service.js';
import { BookingRepository } from './repositories/booking.repository.js';
import { PendingBookingRepository } from './repositories/pending-booking.repository.js';
@Module({
  controllers: [
    BookingsController,
    OwnerBookingsController,
    AdminBookingsController,
  ],
  providers: [
    BookingsService,
    { provide: BookingRepository, useClass: PendingBookingRepository },
  ],
})
export class BookingsModule {}
