import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma does not load .env files automatically; read the repository-root .env if present.
try {
  process.loadEnvFile(path.resolve(import.meta.dirname, '../../.env'));
} catch {
  // No .env file: rely on variables already present in the environment (e.g. CI).
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
