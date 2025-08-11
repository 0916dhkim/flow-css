import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowCss from "@flow-css/vite";
import theme from "./src/theme";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), flowCss({ theme })],
});
