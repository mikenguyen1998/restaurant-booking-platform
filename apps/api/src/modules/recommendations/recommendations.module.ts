import { Module } from '@nestjs/common';
import { RecommendationsController } from './controllers/recommendations.controller.js';
import { RecommendationsService } from './services/recommendations.service.js';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
