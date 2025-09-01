import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/macaospendingrewardsrecorder',
  assetPrefix: '/macaospendingrewardsrecorder',
  images: {
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
