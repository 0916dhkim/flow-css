---
sidebar_position: 1
---

# Vite Setup

Learn how to set up Flow CSS in a Vite-based project.

## Prerequisites

Before you begin, make sure you have:

- Node.js version 16.0 or above
- A Vite-based project (React, Vue, etc.)

## Installation

Install the required packages:

```bash
# Install Flow CSS core (regular dependency)
npm install @flow-css/core

# Install Vite plugin (dev dependency)
npm install --save-dev @flow-css/vite
```

## Configuration

### 1. Add Global CSS Directive

Add the Flow CSS directive to your global CSS file (usually `src/index.css` or `src/main.css`):

```css
@flow-css;
```

This directive tells Flow CSS where to inject the generated styles.

### 2. Update Vite Configuration

Add the Flow CSS plugin to your `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowCss from "@flow-css/vite";

export default defineConfig({
  plugins: [react(), flowCss()],
});
```

## Basic Usage

You're now ready to use Flow CSS in your components:

```tsx
import { css } from "@flow-css/core/css";

function MyComponent() {
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

## Next Steps

- Learn about [basic usage patterns](../usage)
- Set up [theming](../theming) for your application
- Explore advanced features and patterns
