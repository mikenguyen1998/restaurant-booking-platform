import { Module } from '@nestjs/common';
import { BookingsController } from './controllers/bookings.controller.js';
import { BookingsService } from './services/bookings.service.js';
@Module({ controllers: [BookingsController], providers: [BookingsService] })
export class BookingsModule {}
