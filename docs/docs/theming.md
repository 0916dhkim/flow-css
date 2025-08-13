---
sidebar_position: 4
---

# Theming

Flow CSS supports a powerful theming system that allows you to centralize design tokens and maintain consistency across your application.

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

// Extend the global FlowCss namespace
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

## Advanced Theme Patterns

### Theme-based Component Variants

Create reusable component variants using themes:

```tsx
import { css } from "@flow-css/core/css";

const buttonVariants = {
  primary: css((t) => ({
    backgroundColor: t.colors.primary,
    color: "white",
    "&:hover": {
      backgroundColor: t.colors.primary, // You might want to add a darker shade
      opacity: 0.9,
    },
  })),
  secondary: css((t) => ({
    backgroundColor: t.colors.secondary,
    color: "white",
    "&:hover": {
      backgroundColor: t.colors.secondary,
      opacity: 0.9,
    },
  })),
  outline: css((t) => ({
    backgroundColor: "transparent",
    color: t.colors.primary,
    border: `2px solid ${t.colors.primary}`,
    "&:hover": {
      backgroundColor: t.colors.primary,
      color: "white",
    },
  })),
};

interface ButtonProps {
  variant?: keyof typeof buttonVariants;
  children: React.ReactNode;
}

function Button({ variant = "primary", children }: ButtonProps) {
  const baseStyles = css((t) => ({
    padding: `${t.spacing(2)} ${t.spacing(4)}`,
    borderRadius: t.spacing(1),
    border: "none",
    fontSize: t.typography.fontSize.base,
    fontFamily: t.typography.fontFamily.sans.join(", "),
    cursor: "pointer",
    transition: "all 0.2s ease",
  }));

  return (
    <button className={`${baseStyles} ${buttonVariants[variant]}`}>
      {children}
    </button>
  );
}
```

### Dark Mode Support

Extend your theme to support multiple color schemes:

```ts
const createTheme = (mode: "light" | "dark") => ({
  spacing: (n: number) => `${n * 0.25}rem`,
  colors: {
    primary: "#0070f3",
    secondary: "#666",
    textPrimary: mode === "light" ? "#000000" : "#ffffff",
    textSecondary: mode === "light" ? "#666666" : "#cccccc",
    background: mode === "light" ? "#ffffff" : "#1a1a1a",
    surface: mode === "light" ? "#f8f9fa" : "#2d2d2d",
    border: mode === "light" ? "#e9ecef" : "#444444",
  },
  // ... other theme properties
});

// Usage in component
function ThemedCard({ darkMode }: { darkMode: boolean }) {
  const theme = createTheme(darkMode ? "dark" : "light");

  return (
    <div
      className={css(() => ({
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing(4),
      }))}
    >
      Content adapts to theme
    </div>
  );
}
```

## Best Practices

1. **Keep themes focused**: Only include tokens you actually use
2. **Use consistent naming**: Follow a predictable naming convention
3. **Type your themes**: Leverage TypeScript for better developer experience
4. **Test with different themes**: Ensure your components work across theme variations
5. **Document your theme**: Keep a style guide or documentation for design tokens

## Troubleshooting

### Theme not available

Make sure you've:

1. Defined the theme object correctly
2. Passed the theme to your build tool configuration
3. Extended the global FlowCss.Theme interface

### TypeScript errors

Ensure your theme declaration matches your actual theme object structure and that you've declared the global namespace properly.
