---
sidebar_position: 2
---

# Next.js Setup

Learn how to set up Flow CSS in a Next.js application.

## Prerequisites

Before you begin, make sure you have:

- Node.js version 16.0 or above
- A Next.js project (version 13+ recommended)

## Installation

Install the required packages:

```bash
# Install Flow CSS core (regular dependency)
npm install @flow-css/core

# Install Webpack plugin (dev dependency)
npm install --save-dev @flow-css/webpack
```

## Configuration

### 1. Add Global CSS Directive

Add the Flow CSS directive to your global CSS file (usually `src/globals.css` or `styles/globals.css`):

```css
@flow-css;
```

This directive tells Flow CSS where to inject the generated styles.

### 2. Update Next.js Configuration

Add the Flow CSS plugin to your `next.config.ts`:

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

## Basic Usage

You're now ready to use Flow CSS in your components:

```tsx
import { css } from "@flow-css/core/css";

export default function MyComponent() {
  return (
    <div
      className={css({
        display: "flex",
        padding: "1rem",
        backgroundColor: "#f0f0f0",
        "&:hover": {
          backgroundColor: "#e0e0e0",
        },
      })}
    >
      <h1>Hello Flow CSS!</h1>
    </div>
  );
}
```

## App Router Considerations

Flow CSS works seamlessly with both the Pages Router and App Router. No special configuration is needed for either routing approach.

## Next Steps

- Learn about [basic usage patterns](../usage)
- Set up [theming](../theming) for your application
- Explore advanced features and patterns
