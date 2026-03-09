import { test } from "node:test";
import assert from "node:assert";
import { Registry } from "./registry.js";

test("validateStyleRoots: valid when no styles and no roots", () => {
  const registry = new Registry({});
  const result = registry.validateStyleRoots();
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.styleCount, 0);
  assert.strictEqual(result.rootCount, 0);
  assert.strictEqual(result.message, null);
});

test("validateStyleRoots: valid when styles exist and root is registered", () => {
  const registry = new Registry({});
  registry.addStyle({ background: "red" }, "/app/component.tsx");
  registry.addRoot("/app/index.css");
  const result = registry.validateStyleRoots();
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.styleCount, 1);
  assert.strictEqual(result.rootCount, 1);
  assert.strictEqual(result.message, null);
});

test("validateStyleRoots: invalid when styles exist but no root", () => {
  const registry = new Registry({});
  registry.addStyle({ background: "red" }, "/app/component.tsx");
  const result = registry.validateStyleRoots();
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.styleCount, 1);
  assert.strictEqual(result.rootCount, 0);
  assert.ok(result.message!.includes("@flow-css;"));
  assert.ok(result.message!.includes("1 css() call(s)"));
});

test("validateStyleRoots: invalid with multiple styles and no root", () => {
  const registry = new Registry({});
  registry.addStyle({ background: "red" }, "/app/a.tsx");
  registry.addStyle({ color: "blue" }, "/app/b.tsx");
  const result = registry.validateStyleRoots();
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.styleCount, 2);
  assert.strictEqual(result.rootCount, 0);
  assert.ok(result.message!.includes("2 css() call(s)"));
});

test("validateStyleRoots: valid with multiple roots", () => {
  const registry = new Registry({});
  registry.addStyle({ background: "red" }, "/app/component.tsx");
  registry.addRoot("/app/index.css");
  registry.addRoot("/app/globals.css");
  const result = registry.validateStyleRoots();
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.rootCount, 2);
});
