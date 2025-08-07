import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/loader.ts"],
  format: ["cjs"],
  dts: true,
  external: [
    "./loader", // To allow require.resolve("./loader") from plugin
  ],
});
