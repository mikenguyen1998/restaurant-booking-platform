import { Module } from '@nestjs/common';
import { CollectionsController } from './controllers/collections.controller.js';
import { CollectionsService } from './services/collections.service.js';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
