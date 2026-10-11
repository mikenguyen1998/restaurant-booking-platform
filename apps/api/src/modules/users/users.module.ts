import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module.js';
import { MeController } from './controllers/me.controller.js';
import { UsersRepository } from './repositories/users.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [MeController],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
