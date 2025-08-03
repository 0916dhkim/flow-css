# @flow-css/webpack

Webpack loader and plugin for flow-css - a zero-runtime CSS-in-JS solution.

## Installation

```bash
npm install @flow-css/webpack
# or
pnpm add @flow-css/webpack
# or
yarn add @flow-css/webpack
```

## Usage

The webpack package provides both a plugin and a loader that work together to transform `css()` calls into generated class names and output CSS files.

### 1. Configure webpack

```javascript
// webpack.config.js
import { FlowCssWebpackPlugin, flowCssLoader } from '@flow-css/webpack';

export default {
  // ... other webpack config
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          // Your other loaders (e.g., babel-loader, ts-loader)
          'babel-loader',
          // Add flow-css loader
          {
            loader: flowCssLoader,
          },
        ],
      },
      // ... other rules
    ],
  },
  plugins: [
    // ... other plugins
    new FlowCssWebpackPlugin({
      filename: 'flow-css.css', // optional, defaults to 'flow-css.css'
    }),
  ],
};
```

### 2. Import and use the css function

```javascript
// component.js
import { css } from '@flow-css/core/css';

function Button() {
  return (
    <button 
      className={css({
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'darkblue',
        },
      })}
    >
      Click me
    </button>
  );
}
```

### 3. Include the generated CSS

Make sure to include the generated CSS file in your HTML:

```html
<!-- In your HTML -->
<link rel="stylesheet" href="flow-css.css">
```

Or import it in your entry point:

```javascript
// In your entry file
import './flow-css.css';
```

## How it works

1. **Plugin**: The `FlowCssWebpackPlugin` scans your entire project for `css()` calls, extracts the style objects, generates unique class names, and creates a CSS file with all the styles.

2. **Loader**: The `flowCssLoader` transforms your JavaScript/TypeScript files by replacing `css()` calls with the corresponding generated class names.

3. **Zero Runtime**: The `css()` function calls are completely compiled away - no CSS-in-JS runtime is shipped to the browser.

## Features

- ✅ Zero runtime overhead
- ✅ Type-safe CSS with TypeScript
- ✅ Automatic class name generation with hashing
- ✅ Hot module replacement support in development
- ✅ Support for pseudo-selectors and nested styles
- ✅ Media queries support
- ✅ Automatic CSS file generation

## Configuration Options

### FlowCssWebpackPlugin Options

```typescript
interface FlowCssWebpackPluginOptions {
  filename?: string; // Output CSS filename (default: 'flow-css.css')
}
```

## Example Style Objects

```javascript
// Simple styles
css({
  color: 'red',
  fontSize: '16px',
  marginTop: '10px',
})

// Nested styles with pseudo-selectors
css({
  backgroundColor: 'blue',
  '&:hover': {
    backgroundColor: 'darkblue',
  },
  '&:focus': {
    outline: '2px solid blue',
  },
})

// Media queries
css({
  padding: '10px',
  '@media (max-width: 768px)': {
    padding: '5px',
  },
})
```

## Development

The plugin supports hot module replacement in development mode. When you change styles, only the affected modules will be updated.

## License

MIT