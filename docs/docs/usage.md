---
sidebar_position: 3
---

# Usage Guide

Learn how to use Flow CSS to write maintainable, performant styles in your applications.

## Basic CSS Properties

Flow CSS uses a JavaScript object syntax that mirrors CSS properties:

```tsx
import { css } from "@flow-css/core/css";

function BasicExample() {
  return (
    <div
      className={css({
        display: "flex",
        padding: "1rem",
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      })}
    >
      <h1>Styled with Flow CSS</h1>
    </div>
  );
}
```

## Pseudo-selectors

Use the `&` symbol to reference the current element for pseudo-selectors:

```tsx
import { css } from "@flow-css/core/css";

function HoverExample() {
  return (
    <button
      className={css({
        padding: "0.75rem 1.5rem",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#0056b3",
          transform: "translateY(-1px)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
        "&:focus": {
          outline: "2px solid #007bff",
          outlineOffset: "2px",
        },
      })}
    >
      Hover Me
    </button>
  );
}
```

## Media Queries

Write responsive styles using media query syntax:

```tsx
import { css } from "@flow-css/core/css";

function ResponsiveExample() {
  return (
    <div
      className={css({
        padding: "1rem",
        fontSize: "1rem",
        "@media (min-width: 768px)": {
          padding: "2rem",
          fontSize: "1.125rem",
        },
        "@media (min-width: 1024px)": {
          padding: "3rem",
          fontSize: "1.25rem",
        },
        "@media (width > 700px)": {
          fontSize: "2rem",
        },
      })}
    >
      <h1>Responsive Text</h1>
    </div>
  );
}
```

## Conditional Styles

Combine Flow CSS with utility libraries like `clsx` for conditional styling:

```tsx
import { css } from "@flow-css/core/css";
import { clsx } from "clsx";

interface AlertProps {
  type: "success" | "warning" | "error";
  isVisible: boolean;
  children: React.ReactNode;
}

function Alert({ type, isVisible, children }: AlertProps) {
  const baseStyles = css({
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    transition: "opacity 0.3s ease",
  });

  const successStyles = css({
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  });

  const warningStyles = css({
    backgroundColor: "#fff3cd",
    color: "#856404",
    border: "1px solid #ffeaa7",
  });

  const errorStyles = css({
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  });

  const hiddenStyles = css({
    opacity: 0,
    pointerEvents: "none",
  });

  return (
    <div
      className={clsx(
        baseStyles,
        type === "success" && successStyles,
        type === "warning" && warningStyles,
        type === "error" && errorStyles,
        !isVisible && hiddenStyles
      )}
    >
      {children}
    </div>
  );
}

// Usage
function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <Alert type="success" isVisible={isOpen}>
        Operation completed successfully!
      </Alert>
      <p className={clsx(isOpen && css({ display: "block" }))}>
        Conditional Styling
      </p>
    </div>
  );
}
```

## Nested Selectors

Target child elements using standard CSS selector syntax:

```tsx
import { css } from "@flow-css/core/css";

function NestedExample() {
  return (
    <nav
      className={css({
        padding: "1rem",
        backgroundColor: "#333",
        "& ul": {
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          gap: "1rem",
        },
        "& li": {
          color: "white",
        },
        "& a": {
          color: "white",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      })}
    >
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>
      </ul>
    </nav>
  );
}
```

## Performance Tips

1. **Reuse styles**: Extract common styles into variables
2. **Avoid inline objects**: Create style objects outside of render functions when possible
3. **Use conditional classes**: Prefer `clsx` over conditional object properties

```tsx
// ✅ Good - reusable styles
const cardStyles = css({
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

// ✅ Good - extracted object
const buttonStyles = {
  primary: css({
    backgroundColor: "#007bff",
    color: "white",
  }),
  secondary: css({
    backgroundColor: "#6c757d",
    color: "white",
  }),
};

function OptimizedComponent({ variant = "primary" }) {
  return (
    <div className={cardStyles}>
      <button className={buttonStyles[variant]}>Click me</button>
    </div>
  );
}
```

## Next Steps

- Learn about [theming](./theming) to maintain design consistency
- Explore advanced patterns and best practices
- Check out example projects and templates
