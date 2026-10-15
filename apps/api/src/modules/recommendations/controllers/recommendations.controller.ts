import { Controller, Get } from '@nestjs/common';

import { RecommendationsService } from '../services/recommendations.service.js';

// All handlers intentionally return 501. Role/ownership checks belong in future services.
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}
  @Get('') list() {
    return this.service.list();
  }
}
