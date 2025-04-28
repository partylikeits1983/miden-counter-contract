import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Modify the Webpack config if needed
    return config;
  },
};

export default nextConfig;
