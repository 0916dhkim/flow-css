import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import flowCss from "@flow-css/vite";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), flowCss()],
});
