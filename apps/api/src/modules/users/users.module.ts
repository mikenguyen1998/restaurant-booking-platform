import { ProfileController } from './controllers/profile.controller.js';
import { ProfileService } from './services/profile.service.js';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module.js';
import { MeController } from './controllers/me.controller.js';
import { UsersRepository } from './repositories/users.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [MeController, ProfileController],
  providers: [UsersRepository, ProfileService],
  exports: [UsersRepository],
})
export class UsersModule {}
