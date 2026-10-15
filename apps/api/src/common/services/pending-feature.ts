import { NotImplementedException } from '@nestjs/common';

/** Never return fabricated data or successful writes from a scaffold. */
export function pendingFeature(feature: string): never {
  throw new NotImplementedException(`${feature} is not implemented yet.`);
}
