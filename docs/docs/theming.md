---
sidebar_position: 4
---

# Theming

:::tip
Before using the JS theme, consider using CSS variables for sharing values across your project.
:::

You can define shareable JS values & functions that can be used inside your `css()` calls.

## Why Use Themes?

Themes provide several benefits:

- **Consistency**: Centralize design tokens like colors, spacing, and breakpoints
- **Maintainability**: Update design system values in one place
- **Type Safety**: Get autocomplete and type checking for your design tokens
- **Dynamic Theming**: Support for multiple themes (light/dark mode, etc.)

## Theme Configuration

### 1. Create a Theme File

First, create a theme configuration file (e.g., `src/theme.ts`):

```ts
const APP_THEME = {
  spacing: (n: number) => `${n * 0.25}rem`,
  colors: {
    primary: "#0070f3",
    secondary: "#666",
    textSecondary: "#888",
    background: "#ffffff",
    surface: "#f8f9fa",
    border: "#e9ecef",
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1200px",
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      mono: ["Fira Code", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
    },
  },
} as const;

type AppTheme = typeof APP_THEME;

// For Intellisense, augment the global Theme interface.
declare global {
  namespace FlowCss {
    interface Theme extends AppTheme {}
  }
}

export default APP_THEME;
```

### 2. Configure Build Tool with Theme

#### Vite Configuration

Update your `vite.config.ts` to include the theme:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowCss from "@flow-css/vite";
import theme from "./src/theme";

export default defineConfig({
  plugins: [react(), flowCss({ theme })],
});
```

#### Next.js Configuration

Update your `next.config.ts` to include the theme:

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

## Using Themes in CSS

### Basic Theme Usage

Use the theme by passing a function to the `css()` function:

```tsx
import { css } from "@flow-css/core/css";

function ThemedComponent() {
  return (
    <div
      className={css((t) => ({
        padding: t.spacing(4), // 1rem
        backgroundColor: t.colors.surface,
        color: t.colors.primary,
        border: `1px solid ${t.colors.border}`,
        borderRadius: t.spacing(2), // 0.5rem
      }))}
    >
      <h2
        className={css((t) => ({
          fontSize: t.typography.fontSize.xl,
          fontFamily: t.typography.fontFamily.sans.join(", "),
          color: t.colors.textSecondary,
          marginBottom: t.spacing(2),
        }))}
      >
        Themed Content
      </h2>
    </div>
  );
}
```

### Responsive Design with Theme Breakpoints

Combine theme breakpoints with media queries:

```tsx
import { css } from "@flow-css/core/css";

function ResponsiveThemedComponent() {
  return (
    <div
      className={css((t) => ({
        padding: t.spacing(4),
        fontSize: t.typography.fontSize.base,
        [`@media (min-width: ${t.breakpoints.mobile})`]: {
          padding: t.spacing(8),
          fontSize: t.typography.fontSize.lg,
        },
        [`@media (min-width: ${t.breakpoints.desktop})`]: {
          padding: t.spacing(12),
          fontSize: t.typography.fontSize.xl,
        },
      }))}
    >
      Responsive themed content
    </div>
  );
}
```
