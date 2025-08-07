# Flow CSS

[![IMAGE ALT TEXT](https://github.com/user-attachments/assets/76b6e3f1-23cc-4221-9af0-dee91d60d071)](http://www.youtube.com/watch?v=H1Qe8plxQnI "Demo")

## Installation / Setup

For all setups: add `@flow-css;` directive to your global CSS.

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

Add Flow CSS Webpack plugin to `next.config.ts`

```ts
import type { NextConfig } from "next";
import FlowCssPlugin from "@flow-css/webpack";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(new FlowCssPlugin());
    return config;
  },
};

export default nextConfig;
```
