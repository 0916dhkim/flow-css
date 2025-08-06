import { defineConfig } from "tsup";

export default defineConfig([
  {
    format: ["cjs"],
    minify: false,
    dts: true,
    sourcemap: true,
    entry: ["src/index.ts"],
  },
]);
