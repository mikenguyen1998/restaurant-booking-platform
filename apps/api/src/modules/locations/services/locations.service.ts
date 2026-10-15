import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class LocationsService {
  cities() {
    return pendingFeature('City catalog');
  }
  cuisines() {
    return pendingFeature('Cuisine catalog');
  }
  amenities() {
    return pendingFeature('Amenity catalog');
  }
}
