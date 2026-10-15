import { Injectable } from '@nestjs/common';
import { pendingFeature } from '../../../common/services/pending-feature.js';
@Injectable()
export class OwnerRestaurantsService {
  list() {
    return pendingFeature('Owner restaurant listing');
  }
  create() {
    return pendingFeature('Restaurant onboarding');
  }
  detail() {
    return pendingFeature('Owner restaurant access');
  }
  update() {
    return pendingFeature('Restaurant profile update');
  }
  submit() {
    return pendingFeature('Restaurant submission');
  }
  resources() {
    return pendingFeature('Resource management');
  }
  createResource() {
    return pendingFeature('Resource creation');
  }
  updateResource() {
    return pendingFeature('Resource update');
  }
  combinations() {
    return pendingFeature('Combination management');
  }
  createCombination() {
    return pendingFeature('Combination creation');
  }
  openingHours() {
    return pendingFeature('Opening hours update');
  }
  settings() {
    return pendingFeature('Booking settings update');
  }
  closures() {
    return pendingFeature('Closure listing');
  }
  createClosure() {
    return pendingFeature('Restaurant/resource closure creation');
  }
}
