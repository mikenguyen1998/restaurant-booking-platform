import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { BookingsService } from '../services/bookings.service.js';
import {
  CreateBookingDto,
  RescheduleBookingDto,
  BookingReasonDto,
} from '../dto/booking.dto.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}
  // Public guest entry point; service is deliberately non-operational (501).
  @Public() @Post() create(@Body() input: CreateBookingDto) {
    return this.bookings.create(input);
  }
  @Get() listMine() {
    return this.bookings.listMine();
  }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.findOne(id);
  }
  @Post(':id/cancel') cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: BookingReasonDto,
  ) {
    return this.bookings.cancel(id, input);
  }
  @Post(':id/reschedule') reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: RescheduleBookingDto,
  ) {
    return this.bookings.reschedule(id, input);
  }
}
