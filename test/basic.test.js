import { test } from "node:test";
import assert from "node:assert";
import { transformCode } from "../dist/index.cjs";

// 1. Transforms a single css() call to a class name
test("transforms a single css() call to a class name", async () => {
  const input = `const c = css({ color: 'red' })`;
  const { code, css } = transformCode(input, "test.js");
  assert.match(code, /css-[a-z0-9]{6}/);
  assert(css.includes("color: red"));
});

// 2. Handles numeric values and converts them to px
test("handles numeric values and converts them to px", async () => {
  const input = `const c = css({ width: 10, height: 5 })`;
  const { css } = transformCode(input, "test.js");
  assert(css.includes("width: 10px"));
  assert(css.includes("height: 5px"));
});

// 3. Handles multiple css() calls in the same file
test("handles multiple css() calls in the same file", async () => {
  const input = `const a = css({ color: 'red' }); const b = css({ color: 'blue' })`;
  const { code, css } = transformCode(input, "test.js");
  assert(css.includes("color: red"));
  assert(css.includes("color: blue"));
  // Check that both class names are in the transformed code
  const classNames = code.match(/css-[a-z0-9]{6}/g);
  assert(classNames && classNames.length >= 2);
});
