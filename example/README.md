# CSS-in-JS Plugin Example

This is an example React application that demonstrates how to use the Vite CSS-in-JS plugin.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## What it demonstrates

The example shows how the plugin transforms CSS-in-JS function calls:

- **Before**: `className={css({ color: "red", fontSize: 16 })}`
- **After**: `className={"css-abc123"}`

And generates corresponding CSS:

```css
.css-abc123 {
  color: red;
  fontsize: 16px;
}
```

## Files

- `App.tsx` - Example React component with CSS-in-JS calls
- `vite.config.ts` - Vite configuration with the plugin
- `main.tsx` - React app entry point
- `index.html` - HTML template

The plugin will automatically generate a `generated-styles.css` file in the build output.
