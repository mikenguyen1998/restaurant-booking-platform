import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class RecommendationsService {
  list() {
    return pendingFeature('Rule-based recommendations');
  }
}
