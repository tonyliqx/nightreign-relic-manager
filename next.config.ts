import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/nightreign-relic-manager' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/nightreign-relic-manager' : '',
  // Completely disable all caching in development
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any, { dev }: { dev: boolean }) => {
      if (dev) {
        // Disable all webpack caching
        config.cache = false;
        config.snapshot = { managedPaths: [] };
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 200,
          ignored: ['**/node_modules/**', '**/.next/**'],
        };
        // Disable module concatenation
        config.optimization = {
          ...config.optimization,
          concatenateModules: false,
        };
      }
      return config;
    },
    experimental: {
      // Disable all experimental caching
      staleTimes: { dynamic: 0, static: 0 },
    },
    // Disable Next.js cache completely
    onDemandEntries: {
      maxInactiveAge: 0,
      pagesBufferLength: 0,
    },
    // Force fresh builds
    generateBuildId: () => 'dev-build-' + Date.now(),
  }),
};

export default nextConfig;
