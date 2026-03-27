import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Strict mode for development
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

};

export default nextConfig;
