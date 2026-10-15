import { Controller, Patch, Post } from '@nestjs/common';

import { ReviewsService } from '../services/reviews.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}
  @Post('') create() {
    return this.service.create();
  }
  @Patch(':id') update() {
    return this.service.update();
  }
  @Post(':id/reply') reply() {
    return this.service.reply();
  }
  @Post(':id/flags') flag() {
    return this.service.flag();
  }
}
