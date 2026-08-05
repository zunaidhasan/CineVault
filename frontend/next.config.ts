import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['.e2b.app'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
