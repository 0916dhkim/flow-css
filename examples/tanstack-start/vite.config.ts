import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import flowCss from "@flow-css/vite";
import theme from "./src/styles/theme";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    flowCss({ theme }),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({ customViteReactPlugin: true }),
    viteReact(),
  ],
});
