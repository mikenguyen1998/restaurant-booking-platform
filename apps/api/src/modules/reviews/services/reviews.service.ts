import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class ReviewsService {
  create() {
    return pendingFeature('Review creation');
  }
  update() {
    return pendingFeature('Review editing');
  }
  reply() {
    return pendingFeature('Owner review reply');
  }
  flag() {
    return pendingFeature('Review flagging');
  }
}
