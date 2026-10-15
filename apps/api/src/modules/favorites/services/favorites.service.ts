import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';

@Injectable()
export class FavoritesService {
  list() {
    return pendingFeature('Favorite listing');
  }
  add() {
    return pendingFeature('Favorite creation');
  }
  remove() {
    return pendingFeature('Favorite removal');
  }
}
