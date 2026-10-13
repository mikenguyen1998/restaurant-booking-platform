import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigService } from '@nestjs/config';
import { minutes, type ThrottlerAsyncOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    throttlers: [
      {
        ttl: Number(config.get('THROTTLE_TTL') ?? minutes(1)),
        limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
      },
    ],
    storage: new ThrottlerStorageRedisService(
      config.getOrThrow<string>('REDIS_URL'),
    ),
  }),
};
