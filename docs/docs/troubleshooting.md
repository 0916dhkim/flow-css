---
sidebar_position: 5
---

# Troubleshooting

Common issues and their solutions when working with Flow CSS.

## Build fails with "no CSS file contains the @flow-css; directive"

Flow CSS requires at least one CSS file in your project to contain the `@flow-css;` directive. This is where generated styles are injected at build time. Without it, `css()` calls produce class names that reference styles that don't exist, resulting in unstyled elements in production.

**Fix:** Add `@flow-css;` to a CSS file that is imported in your application entry point:

```css
/* e.g. src/index.css or app/globals.css */
@flow-css;

/* your other styles... */
body {
  margin: 0;
}
```

This directive tells Flow CSS where to inject the generated class definitions. You only need it in one CSS file, but it must be imported (directly or transitively) by your application.

:::tip
If you followed the [Vite setup](./installation/vite) or [Next.js setup](./installation/nextjs) guides, the `@flow-css;` directive is included in step 1 ("Add Global CSS Directive"). This error typically occurs when the directive is accidentally removed or when starting from a custom setup.
:::
