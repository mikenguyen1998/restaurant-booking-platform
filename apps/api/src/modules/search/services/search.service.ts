import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class SearchService {
  search() {
    return pendingFeature('Restaurant search index');
  }
}
