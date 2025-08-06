import type { NextConfig } from "next";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: "@flow-css/webpack",
      exclude: /node_modules/,
    });
    config.module.rules.push({
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, "css-loader", "@flow-css/webpack"],
      exclude: /node_modules/,
    });

    const filename = dev
      ? "static/css/[name].css"
      : "static/css/[contenthash].css";

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename,
        chunkFilename: filename,
      })
    );
    return config;
  },
};

export default nextConfig;
