# @flow-css/webpack

Webpack loader for flow-css - a zero-runtime CSS-in-JS solution.

## Installation

```bash
npm install @flow-css/webpack
# or
pnpm add @flow-css/webpack
# or
yarn add @flow-css/webpack
```

## Usage

The webpack package provides a loader that transforms `css()` calls into generated class names. **Note: This package only handles JavaScript transformation. CSS generation is handled separately by the `@flow-css/postcss` plugin.**

### 1. Configure webpack

```javascript
// webpack.config.js
import flowCssLoader from "@flow-css/webpack";
// or
import { flowCssLoader } from "@flow-css/webpack";

export default {
  // ... other webpack config
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          // Your other loaders (e.g., babel-loader, ts-loader)
          "babel-loader",
          // Add flow-css loader
          flowCssLoader,
        ],
      },
      // ... other rules
    ],
  },
};
```

### 2. Import and use the css function

```javascript
// component.js
import { css } from "@flow-css/core/css";

function Button() {
  return (
    <button
      className={css({
        backgroundColor: "blue",
        color: "white",
        padding: "10px 20px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "darkblue",
        },
      })}
    >
      Click me
    </button>
  );
}
```

### 3. CSS Generation

CSS generation is handled separately by the `@flow-css/postcss` plugin. Make sure to configure PostCSS with the flow-css plugin to generate the actual CSS files from your styles.

```css
/* In your CSS file */
@flow-css;
```

The `@flow-css;` directive will be replaced with the generated CSS by the PostCSS plugin.

## How it works

1. **Loader**: The `flowCssLoader` scans your entire project for `css()` calls (on first run), extracts the style objects, generates unique class names, and transforms your JavaScript/TypeScript files by replacing `css()` calls with the corresponding generated class names.

2. **CSS Generation**: CSS files are generated separately by the `@flow-css/postcss` plugin, which processes `@flow-css;` directives in your CSS files.

3. **Zero Runtime**: The `css()` function calls are completely compiled away - no CSS-in-JS runtime is shipped to the browser.

## Features

- ✅ Zero runtime overhead
- ✅ Type-safe CSS with TypeScript
- ✅ Automatic class name generation with hashing
- ✅ Self-contained loader (no plugin required)
- ✅ Efficient caching (scans project only once)
- ✅ JavaScript/TypeScript transformation only
- ✅ Works with `@flow-css/postcss` for CSS generation
- ✅ Support for all CSS features (via PostCSS plugin)

## Configuration Options

### Loader Options

```typescript
interface FlowCssLoaderOptions {
  // Currently no options available
  // Future configuration options will be added here
}
```

You can pass options to the loader like this:

```javascript
// webpack.config.js
export default {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: "@flow-css/webpack",
            options: {
              // Future options will go here
            },
          },
        ],
      },
    ],
  },
};
```

## Example Style Objects

```javascript
// Simple styles
css({
  color: "red",
  fontSize: "16px",
  marginTop: "10px",
});

// Nested styles with pseudo-selectors
css({
  backgroundColor: "blue",
  "&:hover": {
    backgroundColor: "darkblue",
  },
  "&:focus": {
    outline: "2px solid blue",
  },
});

// Media queries
css({
  padding: "10px",
  "@media (max-width: 768px)": {
    padding: "5px",
  },
});
```

## Development

The loader integrates seamlessly with webpack's development mode and hot module replacement. When you change styles, webpack will automatically recompile the affected modules.

## License

MIT
