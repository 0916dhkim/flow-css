import { test } from "node:test";
import assert from "node:assert";
import { Registry } from "./registry.js";
import { Scanner } from "./scanner.js";
import { FileServiceStub } from "./file-service.js";

test("css call scanning", async () => {
  const code = `const style = css({ background: "red" });`;
  const registry = new Registry();
  const fs = FileServiceStub({
    "/tmp/app.ts": code,
  });
  const scanner = new Scanner(process.cwd(), registry, fs);
  await scanner.scanFile("/tmp/app.ts");

  assert.deepEqual(Object.values(registry.styles), [{ background: "red" }]);
});

test("css call scanning with multiline style object", async () => {
  const code = `const style = css({
    background: "red",
    color: "blue",
  });`;
  const registry = new Registry();
  const fs = FileServiceStub({
    "/tmp/colors.ts": code,
  });
  const scanner = new Scanner(process.cwd(), registry, fs);
  await scanner.scanFile("/tmp/colors.ts");

  assert.deepEqual(Object.values(registry.styles), [
    { background: "red", color: "blue" },
  ]);
});

test("css call scanning with nested parantheses", async () => {
  const code = `
    const style = css({
      "@media (min-width: 768px)": {
        background: "red",
      },
    });
  `;
  const registry = new Registry();
  const fs = FileServiceStub({
    "/tmp/responsive.ts": code,
  });
  const scanner = new Scanner(process.cwd(), registry, fs);
  await scanner.scanFile("/tmp/responsive.ts");

  assert.deepEqual(Object.values(registry.styles), [
    { "@media (min-width: 768px)": { background: "red" } },
  ]);
});

test("multiple css calls in a single file", async () => {
  const code = `
    const style = css({
      background: "red",
    });
    const style2 = css({
      color: "blue",
    });
  `;
  const registry = new Registry();
  const fs = FileServiceStub({
    "/tmp/multiple.ts": code,
  });
  const scanner = new Scanner(process.cwd(), registry, fs);
  await scanner.scanFile("/tmp/multiple.ts");

  const styles = Object.values(registry.styles);
  assert.equal(styles.length, 2);
  assert.ok(
    styles.some(
      (style) => JSON.stringify(style) === JSON.stringify({ background: "red" })
    )
  );
  assert.ok(
    styles.some(
      (style) => JSON.stringify(style) === JSON.stringify({ color: "blue" })
    )
  );
});
