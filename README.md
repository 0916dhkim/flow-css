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

## Usage

```tsx
import { css } from "@flow-css/core/css";
import { clsx } from "clsx"; // optional: for conditional styles.

function Page() {
  return (
    <div
      className={css({
        display: "flex",
        "&:hover": {
          background: "black",
        },
        "@media (width > 700px)": {
          fontSize: "2rem",
        },
      })}
    >
      <h1>Inline Your Styles</h1>
      <p className={clsx(isOpen && css({ display: "block" }))}>
        Conditional Styling
      </p>
    </div>
  );
}
```

## Themes

Flow CSS supports themes that allow you to centralize design tokens and use them across your application.

### Theme Configuration

First, create a theme configuration file (e.g., `src/theme.ts`):

```ts
const APP_THEME = {
  spacing: (n: number) => `${n * 0.25}rem`,
  colors: {
    primary: "#0070f3",
    secondary: "#666",
    textSecondary: "#888",
  },
  breakpoints: {
    mobile: "768px",
    desktop: "1024px",
  },
} as const;

type AppTheme = typeof APP_THEME;

declare global {
  namespace FlowCss {
    interface Theme extends AppTheme {}
  }
}

export default APP_THEME;
```

### Plugin Configuration with Theme

#### Vite

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowCss from "@flow-css/vite";
import theme from "./src/theme";

export default defineConfig({
  plugins: [react(), flowCss({ theme })],
});
```

#### Next.js

```ts
import type { NextConfig } from "next";
import FlowCssPlugin from "@flow-css/webpack";
import theme from "./src/theme";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(new FlowCssPlugin({ theme }));
    return config;
  },
};

export default nextConfig;
```

### Using Themes in CSS

Use the theme by passing a function to the `css()` function:

```tsx
import { css } from "@flow-css/core/css";

function ThemedComponent() {
  return (
    <div
      className={css((t) => ({
        padding: t.spacing(4),
        color: t.colors.primary,
        backgroundColor: t.colors.secondary,
        [`@media (min-width: ${t.breakpoints.mobile})`]: {
          padding: t.spacing(8),
        },
      }))}
    >
      <h2 className={css((t) => ({ color: t.colors.textSecondary }))}>
        Themed Content
      </h2>
    </div>
  );
}
```
