import { test } from "node:test";
import assert from "node:assert";
import { transformCode } from "../dist/index.js";

// 1. Transforms a single css() call to a class name
test("transforms a single css() call to a class name", async () => {
  const input = `const c = css({ color: 'red' })`;
  const { code, cssRules } = await transformCode(input, "test.js");
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name matched");
  const className = match[0];
  assert(cssRules?.[className]);
  assert(cssRules[className].color === "red");
});

// 2. Handles multiple css() calls in the same file
test("handles multiple css() calls in the same file", async () => {
  const input = `const a = css({ color: 'red' }); const b = css({ color: 'blue' })`;
  const { code, cssRules } = await transformCode(input, "test.js");
  const classNames = code.match(/css-[a-z0-9]{6}/g);
  assert(classNames && classNames.length >= 2);
  // Check that both class names are in the cssRules and have correct colors
  const colors = Object.values(cssRules ?? {}).map((rule: any) => rule.color);
  assert(colors.includes("red"));
  assert(colors.includes("blue"));
});
