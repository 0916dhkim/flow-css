import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInJsPlugin from "../dist/index.js";

export default defineConfig({
  plugins: [
    react(),
    cssInJsPlugin({
      functionName: "css",
      classNamePrefix: "css-",
      cssOutputPath: "generated-styles.css",
    }),
  ],
});
