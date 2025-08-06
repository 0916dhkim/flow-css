# Flow CSS

[![IMAGE ALT TEXT](https://github.com/user-attachments/assets/76b6e3f1-23cc-4221-9af0-dee91d60d071)](http://www.youtube.com/watch?v=H1Qe8plxQnI "Demo")

## Installation / Setup

### Vite

Install `@flow-css/core` (regular dependency) and `@flow-css/vite` (dev dependency).

Add Flow CSS Vite plugin to `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowCss from "@flow-css/vite";

export default defineConfig({
  plugins: [react(), flowCss()],
});
```

### Next.js

Install `@flow-css/core` (regular dependency) and `@flow-css/webpack` (dev dependency)

Add Flow CSS Webpack loader to `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: "@flow-css/webpack",
      exclude: /node_modules/,
    });
    return config;
  },
};

export default nextConfig;
```

Add Flow CSS PostCSS plugin to `postcss.config.json`

```json
{
  "plugins": ["@flow-css/postcss"]
}
```
