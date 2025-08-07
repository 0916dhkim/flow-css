import type { NextConfig } from "next";
import FlowCssPlugin from "@flow-css/webpack";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(new FlowCssPlugin());
    return config;
  },
};

export default nextConfig;
