# Vite CSS-in-JS Plugin

A Vite plugin that transforms CSS-in-JS function calls into CSS classes, similar to how `wyw-in-js` works but with support for non-top-level function calls.

## Features

- Collects `css()` function calls from your code (even when nested inside other functions)
- Generates unique CSS class names for each call
- Extracts CSS properties and generates corresponding CSS rules
- Transforms the code to replace `css()` calls with generated class names
- Outputs a CSS file with all the generated styles

## Installation

```bash
npm install vite-css-in-js-plugin
```

## Usage

### Basic Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import cssInJsPlugin from "vite-css-in-js-plugin";

export default defineConfig({
  plugins: [cssInJsPlugin()],
});
```

### Example Code

```tsx
import { css } from "my-library";
import { useState } from "react";

function MyComponent() {
  const [state, setState] = useState(1);
  return (
    <div
      className={css({ color: "red" })} // <- This will be transformed
    >
      {state}
    </div>
  );
}
```

### Generated Output

The plugin will transform your code to:

```tsx
import { css } from "my-library";
import { useState } from "react";

function MyComponent() {
  const [state, setState] = useState(1);
  return (
    <div
      className={"css-abc123"} // <- css call substituted with a class name
    >
      {state}
    </div>
  );
}
```

And generate a CSS file (`generated-styles.css`):

```css
.css-abc123 {
  color: red;
}
```

## Configuration Options

```typescript
cssInJsPlugin({
  functionName: "css", // The function name to look for (default: 'css')
  classNamePrefix: "css-", // Prefix for generated class names (default: 'css-')
  cssOutputPath: "generated-styles.css", // Output CSS file path (default: 'generated-styles.css')
});
```

## Supported CSS Properties

The plugin currently supports:

- String literals: `css({ color: "red" })`
- Numeric literals (converted to pixels): `css({ width: 100 })` → `width: 100px`
- CSS variables: `css({ color: "var(--primary)" })`

## Building

```bash
npm run build
```

This will compile the TypeScript code to the `dist` directory.

## How it Works

1. **Parsing**: Uses Babel to parse your code and find `css()` function calls
2. **Extraction**: Extracts CSS properties from the object passed to `css()`
3. **Generation**: Creates unique class names and corresponding CSS rules
4. **Transformation**: Replaces `css()` calls with the generated class names
5. **Output**: Generates a CSS file with all the collected styles

The plugin works at build time, so there's no runtime overhead in your application.
