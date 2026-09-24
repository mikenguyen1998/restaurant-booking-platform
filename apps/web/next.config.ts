import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @restaurant-platform/ui ships TypeScript source and is compiled by this app.
  transpilePackages: ['@restaurant-platform/ui'],
};

export default nextConfig;
