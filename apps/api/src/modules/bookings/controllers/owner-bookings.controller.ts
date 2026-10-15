import {
  Inject,
  Body,
  Controller,
  Get,
  Headers,
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
  BookingListDto,
  ManualBookingDto,
  ContactAttemptDto,
  ExtendHoldDto,
  OwnerChangeDto,
  OwnerRescheduleDto,
  CorrectOutcomeDto,
} from '../dto/booking.dto.js';
import { bookingKey, bookingValidation } from './booking.transport.js';
@Controller('owner/restaurants/:restaurantId/bookings')
@UsePipes(bookingValidation)
export class OwnerBookingsController {
  constructor(
    @Inject(BookingsService) private readonly bookings: BookingsService,
  ) {}
  @Get('') list(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() query: BookingListDto,
  ) {
    return this.bookings.listOwner(actor, restaurantId, query);
  }
  @Get(':bookingId') detail(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
  ) {
    return this.bookings.findOwner(actor, restaurantId, id);
  }
  @Post('') manual(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() input: ManualBookingDto,
    @Headers('idempotency-key') key: string | undefined,
  ) {
    return this.bookings.createManual(
      actor,
      restaurantId,
      input,
      bookingKey(key),
    );
  }
  @Post(':bookingId/arrival') arrival(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
  ) {
    return this.bookings.recordArrival(actor, restaurantId, id);
  }
  @Post(':bookingId/contact') contact(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
    @Body() input: ContactAttemptDto,
  ) {
    return this.bookings.recordContact(actor, restaurantId, id, input);
  }
  @Post(':bookingId/hold') hold(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
    @Body() input: ExtendHoldDto,
  ) {
    return this.bookings.extendHold(actor, restaurantId, id, input);
  }
  @Post(':bookingId/no-show') noShow(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
    @Body() input: OwnerChangeDto,
  ) {
    return this.bookings.markNoShow(actor, restaurantId, id, input);
  }
  @Post(':bookingId/cancel') cancel(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
    @Body() input: OwnerChangeDto,
  ) {
    return this.bookings.cancelOwner(actor, restaurantId, id, input);
  }
  @Post(':bookingId/reschedule') reschedule(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
    @Body() input: OwnerRescheduleDto,
  ) {
    return this.bookings.rescheduleOwner(actor, restaurantId, id, input);
  }
  @Post(':bookingId/correct') correct(
    @CurrentUser() actor: BookingActor,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('bookingId', ParseUUIDPipe) id: string,
    @Body() input: CorrectOutcomeDto,
  ) {
    return this.bookings.correctOutcome(actor, restaurantId, id, input);
  }
}
