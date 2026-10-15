import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Local unit-only runs may omit services; CI must exercise real integrations.
if (
  process.env.CI &&
  (!process.env.TEST_DATABASE_URL || !process.env.REDIS_URL)
) {
  throw new Error(
    'CI requires TEST_DATABASE_URL and REDIS_URL; integration tests must not silently skip.',
  );
}
const envFile = resolve(import.meta.dirname, '../../.env');
if (!process.env.CI && existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
  },
});
