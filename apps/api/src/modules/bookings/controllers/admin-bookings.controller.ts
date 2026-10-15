import {
  Inject,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import type { BookingActor } from '../booking.context.js';
import { BookingsService } from '../services/bookings.service.js';
import {
  AdminBookingListDto,
  RequiredReasonDto,
  AdminRescheduleDto,
} from '../dto/booking.dto.js';
import { bookingValidation } from './booking.transport.js';
@Controller('admin/bookings')
@UsePipes(bookingValidation)
export class AdminBookingsController {
  constructor(
    @Inject(BookingsService) private readonly bookings: BookingsService,
  ) {}
  @Get() list(
    @CurrentUser() actor: BookingActor,
    @Query() query: AdminBookingListDto,
  ) {
    return this.bookings.listAdmin(actor, query);
  }
  @Get(':id') detail(
    @CurrentUser() actor: BookingActor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookings.findAdmin(actor, id);
  }
  @Post(':id/cancel') cancel(
    @CurrentUser() actor: BookingActor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: RequiredReasonDto,
  ) {
    return this.bookings.cancelAdmin(actor, id, input);
  }
  @Post(':id/reschedule') reschedule(
    @CurrentUser() actor: BookingActor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: AdminRescheduleDto,
  ) {
    return this.bookings.rescheduleAdmin(actor, id, input);
  }
}
