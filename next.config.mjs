import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  devIndicators: false,
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || '.next',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    unoptimized: true,
    qualities: [75, 85, 100],
  },
};

export default nextConfig;
