import { Controller, Get, Patch, Post } from '@nestjs/common';

import { AdminService } from '../services/admin.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}
  @Get('restaurants') restaurants() {
    return this.service.restaurants();
  }
  @Post('restaurants/:id/approve') approve() {
    return this.service.approve();
  }
  @Post('restaurants/:id/reject') reject() {
    return this.service.reject();
  }
  @Post('restaurants/:id/suspend') suspend() {
    return this.service.suspend();
  }
  @Get('users') users() {
    return this.service.users();
  }
  @Get('reviews') reviews() {
    return this.service.reviews();
  }
  @Patch('reviews/:id') moderateReview() {
    return this.service.moderateReview();
  }
  @Get('audit') audit() {
    return this.service.audit();
  }
  @Get('reports') reports() {
    return this.service.reports();
  }
}
