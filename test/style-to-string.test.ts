import { test } from "node:test";
import assert from "node:assert";
import { styleToString } from "../src/style-to-string";

// 1. Simple string value
// { color: "red" } => "color:red;"
test("converts simple string value", () => {
  const input = { color: "red" };
  const output = styleToString(input);
  assert.strictEqual(output, "color:red;");
});

// 2. Simple number value
// { width: 10 } => "width:10;"
test("converts simple number value", () => {
  const input = { width: 10 };
  const output = styleToString(input);
  assert.strictEqual(output, "width:10;");
});

// 3. CamelCase property
// { backgroundColor: "blue" } => "background-color:blue;"
test("converts camelCase property to kebab-case", () => {
  const input = { backgroundColor: "blue" };
  const output = styleToString(input);
  assert.strictEqual(output, "background-color:blue;");
});

// 4. Nested selector
// { ":hover": { color: "red" } } => ":hover{color:red;}"
test("handles nested selector", () => {
  const input = { ":hover": { color: "red" } };
  const output = styleToString(input);
  assert.strictEqual(output, ":hover{color:red;}");
});

// 5. Multiple properties
// { color: "red", width: 10 } => "color:red;\nwidth:10;"
test("handles multiple properties", () => {
  const input = { color: "red", width: 10 };
  const output = styleToString(input);
  assert.strictEqual(output, "color:red;\nwidth:10;");
});

// 6. Custom property
// { "--my-var": "123" } => "--my-var:123;"
test("handles custom CSS property", () => {
  const input = { "--my-var": "123" };
  const output = styleToString(input);
  assert.strictEqual(output, "--my-var:123;");
});
