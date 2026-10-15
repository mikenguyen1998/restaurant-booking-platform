import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class CollectionsService {
  list() {
    return pendingFeature('Collection listing');
  }
  create() {
    return pendingFeature('Collection creation');
  }
  findOne() {
    return pendingFeature('Collection access');
  }
  update() {
    return pendingFeature('Collection update');
  }
  remove() {
    return pendingFeature('Collection deletion');
  }
  addRestaurant() {
    return pendingFeature('Collection restaurant addition');
  }
  removeRestaurant() {
    return pendingFeature('Collection restaurant removal');
  }
}
