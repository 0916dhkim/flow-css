import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add Flow CSS loader for TypeScript/JavaScript files
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: "@flow-css/webpack",
      exclude: /node_modules/,
    });
    return config;
  },
};

export default nextConfig;
