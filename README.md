# Vite CSS-in-JS Plugin

A Vite plugin that transforms CSS-in-JS function calls into CSS classes at build time, with support for variable resolution and evaluation.

## Features

✅ **Variable Resolution**: Resolves constants and variables in `css()` calls  
✅ **Import Support**: Works with imported constants and theme objects  
✅ **Expression Evaluation**: Handles computed values and template literals  
✅ **TypeScript/JSX Support**: Full support for TS/TSX files  
✅ **Build-time Optimization**: Generates static CSS at build time  
✅ **Vite Integration**: Seamless integration with Vite's build process  

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
  plugins: [
    cssInJsPlugin({
      functionName: "css",           // default: "css"
      classNamePrefix: "css-",       // default: "css-"
      cssOutputPath: "styles.css",   // default: "generated-styles.css"
    }),
  ],
});
```

### CSS-in-JS Library

Create a simple CSS-in-JS function (or use any existing one):

```javascript
// src/css.js
export function css(styles) {
  // This is just a placeholder - the plugin will replace these calls
  return JSON.stringify(styles);
}
```

### Examples

#### Basic Usage with Variables

```typescript
import { css } from "./css.js";

const PRIMARY_COLOR = "#007bff";
const FONT_SIZE = 16;

// This gets transformed at build time
const buttonStyles = css({
  backgroundColor: PRIMARY_COLOR,
  fontSize: FONT_SIZE,
  padding: 12,
  border: "none",
  borderRadius: 4
});

console.log(buttonStyles); // Output: "css-abc123"
```

**Generated CSS:**
```css
.css-abc123 {
  background-color: #007bff;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 4px;
}
```

#### With Theme Objects

```typescript
import { css } from "./css.js";

const theme = {
  colors: { primary: "#007bff", text: "#333" },
  spacing: { sm: 8, md: 16, lg: 24 }
};

const cardStyles = css({
  backgroundColor: "white",
  color: theme.colors.text,
  padding: theme.spacing.md,
  border: `1px solid ${theme.colors.primary}`
});
```

#### Template Literals and Computed Values

```typescript
import { css } from "./css.js";

const BASE_SIZE = 8;
const MULTIPLIER = 2;
const BRAND_COLOR = "#ff6b6b";

const headerStyles = css({
  padding: BASE_SIZE * MULTIPLIER,           // Computed: 16
  margin: `${BASE_SIZE}px ${BASE_SIZE * 2}px`, // Template: "8px 16px"
  borderBottom: `2px solid ${BRAND_COLOR}`   // Template: "2px solid #ff6b6b"
});
```

## How It Works

1. **Detection**: Finds all `css()` function calls in your code
2. **Variable Resolution**: Analyzes the scope to resolve variables and imports
3. **Evaluation**: Executes the code in a safe VM context to get actual values
4. **Transformation**: Replaces `css()` calls with generated class names
5. **CSS Generation**: Outputs static CSS file with the resolved styles

## Current Limitations

### ❌ Function-Scoped CSS Calls

CSS calls inside functions are currently **not transformed**:

```typescript
// ❌ Not supported - remains unchanged
function MyComponent() {
  const styles = css({ color: "red" }); // Not transformed
  return styles;
}
```

### ❌ React Component CSS Calls

CSS calls inside React components are **not transformed**:

```typescript
// ❌ Not supported - remains unchanged
function Button({ active }) {
  const buttonStyles = css({
    color: active ? "blue" : "gray" // Not transformed
  });
  return <button className={buttonStyles}>Click me</button>;
}
```

### ✅ Workaround: Use Top-Level Definitions

```typescript
// ✅ Supported - define styles at module level
const activeButtonStyles = css({ color: "blue" });
const inactiveButtonStyles = css({ color: "gray" });

function Button({ active }) {
  return (
    <button className={active ? activeButtonStyles : inactiveButtonStyles}>
      Click me
    </button>
  );
}
```

## API Reference

### Plugin Options

```typescript
interface PluginOptions {
  functionName?: string;      // CSS function name to transform (default: "css")
  classNamePrefix?: string;   // Generated class name prefix (default: "css-")
  cssOutputPath?: string;     // Output CSS file path (default: "generated-styles.css")
}
```

### Transform Function

```typescript
async function transformCode(
  code: string,
  id: string,
  options?: PluginOptions
): Promise<{
  code: string;
  cssRules?: Record<string, StyleObject>;
}>
```

## Comparison with wyw-in-js

| Feature | wyw-in-js | This Plugin |
|---------|-----------|-------------|
| Top-level CSS calls | ✅ | ✅ |
| Variable resolution | ✅ | ✅ |
| Import support | ✅ | ✅ |
| Function-scoped calls | ❌ | ❌ (planned) |
| Component-scoped calls | ❌ | ❌ (planned) |
| Babel dependency | ✅ | ❌ |
| Vite-native | ❌ | ✅ |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! The main areas for improvement are:

1. **Function-scoped CSS calls**: Supporting CSS calls inside functions
2. **Component-scoped CSS calls**: Supporting CSS calls inside React components
3. **Better error handling**: More robust error messages and fallbacks
4. **Performance optimization**: Faster parsing and evaluation

## License

MIT
