import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Query, UsePipes } from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import type { BookingActor } from '../booking.context.js';
import { BookingsService } from '../services/bookings.service.js';
import { CreateBookingDto, RescheduleBookingDto, BookingReasonDto, BookingListDto } from '../dto/booking.dto.js';
import { bookingKey, bookingValidation } from './booking.transport.js';
@Controller('bookings')
@UsePipes(bookingValidation)
export class BookingsController {
 constructor(private readonly bookings: BookingsService) {}
 @Authenticate({optional:true}) @Post()
 create(@CurrentUser() actor: BookingActor | null, @Headers('idempotency-key') key: string | undefined, @Body() input: CreateBookingDto) { return this.bookings.create({actor,idempotencyKey:bookingKey(key)},input); }
 @Get() listMine(@CurrentUser() actor: BookingActor, @Query() query: BookingListDto) {return this.bookings.listMine(actor,query);}
 @Get(':id') findOne(@CurrentUser() actor: BookingActor, @Param('id',ParseUUIDPipe) id: string) { return this.bookings.findOne(actor,id); }
 @Post(':id/cancel') cancel(@CurrentUser() actor: BookingActor, @Param('id',ParseUUIDPipe) id: string, @Body() input: BookingReasonDto) {return this.bookings.cancel(actor,id,input);}
 @Post(':id/reschedule') reschedule(@CurrentUser() actor: BookingActor, @Param('id',ParseUUIDPipe) id: string, @Body() input: RescheduleBookingDto) {return this.bookings.reschedule(actor,id,input);}
}
