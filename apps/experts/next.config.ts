import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@raweval/ui', '@raweval/utils', '@raweval/api-client', '@raweval/auth'],
  // Set Turbopack root to monorepo root (2 levels up from apps/experts)
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
