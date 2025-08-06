import { defineConfig } from "tsup";

export default defineConfig([
  {
    format: ["cjs"],
    minify: false,
    dts: false,
    sourcemap: true,
    entry: ["src/index.ts"],
  },
]);
