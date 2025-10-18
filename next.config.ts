import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Static export only for production (GitHub Pages)
  ...(!isDev && {
    output: 'export',
    trailingSlash: true,
    basePath: '/nightreign-relic-manager',
    assetPrefix: '/nightreign-relic-manager/',
  }),
  images: {
    unoptimized: true
  },
  // Development optimizations - disable all caching for stable hot reload
  ...(isDev && {
    webpack: (config: any, { dev }: { dev: boolean }) => {
      if (dev) {
        // Completely disable all caching to prevent stale issues
        config.cache = false;
        config.snapshot = { managedPaths: [] };
        config.optimization = {
          ...config.optimization,
          moduleIds: 'named',
          chunkIds: 'named',
        };
        // Optimize for faster rebuilds
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: /node_modules/,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;