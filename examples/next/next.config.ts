import type { NextConfig } from "next";
import FlowCssPlugin from "@flow-css/webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Only apply the FlowCssPlugin for client-side bundles
    // Server-side bundles don't need CSS processing
    if (!isServer) {
      config.plugins.push(new FlowCssPlugin());
    }
    return config;
  },
};

export default nextConfig;
