import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@raweval/ui', '@raweval/utils'],
  // Set Turbopack root to monorepo root (2 levels up from apps/chat)
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
