import { Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { OwnerRestaurantsService } from '../services/owner-restaurants.service.js';
// Session-protected, non-operational scaffold. Ownership policies are not implemented.
@Controller('owner/restaurants')
export class OwnerRestaurantsController {
  constructor(private readonly service: OwnerRestaurantsService) {}
  @Get('') list() {
    return this.service.list();
  }
  @Post('') create() {
    return this.service.create();
  }
  @Get(':id') detail() {
    return this.service.detail();
  }
  @Patch(':id') update() {
    return this.service.update();
  }
  @Post(':id/submit') submit() {
    return this.service.submit();
  }
  @Get(':id/resources') resources() {
    return this.service.resources();
  }
  @Post(':id/resources') createResource() {
    return this.service.createResource();
  }
  @Patch(':id/resources/:resourceId') updateResource() {
    return this.service.updateResource();
  }
  @Get(':id/combinations') combinations() {
    return this.service.combinations();
  }
  @Post(':id/combinations') createCombination() {
    return this.service.createCombination();
  }
  @Put(':id/opening-hours') openingHours() {
    return this.service.openingHours();
  }
  @Put(':id/booking-settings') settings() {
    return this.service.settings();
  }
  @Get(':id/closures') closures() {
    return this.service.closures();
  }
  @Post(':id/closures') createClosure() {
    return this.service.createClosure();
  }
  @Get(':id/bookings') bookings() {
    return this.service.bookings();
  }
  @Post(':id/bookings') manualBooking() {
    return this.service.manualBooking();
  }
  @Post(':id/bookings/:bookingId/arrival') arrival() {
    return this.service.arrival();
  }
  @Post(':id/bookings/:bookingId/contact') contact() {
    return this.service.contact();
  }
  @Post(':id/bookings/:bookingId/hold') hold() {
    return this.service.hold();
  }
  @Post(':id/bookings/:bookingId/no-show') noShow() {
    return this.service.noShow();
  }
  @Post(':id/bookings/:bookingId/cancel') cancel() {
    return this.service.cancel();
  }
  @Post(':id/bookings/:bookingId/reschedule') reschedule() {
    return this.service.reschedule();
  }
  @Post(':id/bookings/:bookingId/correct') correct() {
    return this.service.correct();
  }
}
