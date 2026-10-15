import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';
import type { UpdateProfileDto } from '../dto/profile.dto.js';
@Injectable()
export class ProfileService {
  update(_input: UpdateProfileDto) {
    return pendingFeature('Profile update');
  }
  requestOwnerAccess() {
    return pendingFeature('Owner access request');
  }
}
