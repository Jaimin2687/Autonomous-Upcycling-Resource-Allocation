import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false
    };
    return config;
  }
};

export default nextConfig;
