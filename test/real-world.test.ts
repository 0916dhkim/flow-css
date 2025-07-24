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

  const { code, cssRules } = await transformCode(appContent, "App.tsx");

  // Check that css() calls were replaced with class names
  assert.match(code, /css-[a-z0-9]{6}/);
  assert(!code.includes("css({"));
  assert(/className\=\{".*"\}/.test(code));

  // Check that CSS rules were generated and contain expected values
  const allRules = Object.values(cssRules ?? {});
  const get = (prop: keyof React.CSSProperties) =>
    allRules.map((rule) => rule[prop]);
  assert(get("color").includes("red"));
  assert(get("fontSize").includes(16));
  assert(get("padding").includes(20));
  assert(get("backgroundColor").includes("var(--bg-color)"));
  assert(get("margin").includes(0));
  assert(get("color").includes("blue"));
  assert(get("fontSize").includes(14));
  assert(get("opacity").includes(0.8));

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
  console.log("Generated CSS rules:", cssRules);
  console.log("Transformed code:", code);
});
