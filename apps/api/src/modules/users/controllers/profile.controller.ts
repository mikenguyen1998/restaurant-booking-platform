import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ProfileService } from '../services/profile.service.js';
import { UpdateProfileDto } from '../dto/profile.dto.js';
@Controller('me')
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}
  @Patch() update(@Body() input: UpdateProfileDto) {
    return this.profiles.update(input);
  }
  @Post('owner-access-requests') requestOwnerAccess() {
    return this.profiles.requestOwnerAccess();
  }
}
