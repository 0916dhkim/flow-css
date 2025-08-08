import { defineConfig } from "tsup";

export default defineConfig([
  {
    format: ["esm"],
    minify: false,
    dts: true,
    sourcemap: true,
    clean: true,
    entry: ["src/index.ts"],
  },
]);
