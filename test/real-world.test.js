import { test } from "node:test";
import assert from "node:assert";
import { transformCode } from "../dist/index.js";

// Real-world test using the actual App.tsx content
test("transforms real-world App.tsx content", async () => {
  const appContent = `
import { css } from "./src/my-library.js";
import { useState } from "react";

function MyComponent() {
  const [state, setState] = useState(1);

  const handleClick = () => {
    setState(state + 1);
  };

  return (
    <div
      className={css({
        color: "red",
        fontSize: 16,
        padding: 20,
        backgroundColor: "var(--bg-color)",
      })}
      onClick={handleClick}
    >
      <h1
        className={css({
          margin: 0,
          color: "blue",
        })}
      >
        Counter: {state}
      </h1>
      <p
        className={css({
          fontSize: 14,
          opacity: 0.8,
        })}
      >
        Click to increment
      </p>
    </div>
  );
}

export default MyComponent;
`;

  const { code, css } = await transformCode(appContent, "App.tsx");

  // Check that css() calls were replaced with class names
  assert.match(code, /css-[a-z0-9]{6}/);
  assert(!code.includes("css({"));
  console.log(code);
  assert(/className\=\{\".*\"\}/.test(code));

  // Check that CSS was generated
  assert(css.includes("color: red"));
  assert(css.includes("fontSize: 16px"));
  assert(css.includes("padding: 20px"));
  assert(css.includes("backgroundColor: var(--bg-color)"));
  assert(css.includes("margin: 0"));
  assert(css.includes("color: blue"));
  assert(css.includes("fontSize: 14px"));
  assert(css.includes("opacity: 0.8"));

  // Check that we have 3 css() calls transformed
  const classNames = code.match(/css-[a-z0-9]{6}/g);
  assert(
    classNames && classNames.length === 3,
    "Should have exactly 3 css() calls transformed"
  );

  // Check that all class names are unique
  const uniqueClassNames = new Set(classNames);
  assert.equal(
    classNames.length,
    uniqueClassNames.size,
    "All class names should be unique"
  );

  console.log("✅ Real-world transformation test passed!");
  console.log("Generated CSS:", css);
  console.log("Transformed code:", code);
});
