import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/css-loader.ts", "src/js-loader.ts"],
  format: ["cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "./css-loader", // To allow require.resolve("./css-loader") from plugin.
    "./js-loader", // Same as above.
  ],
});
