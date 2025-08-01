import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import cssInJsPlugin from "../dist/index";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), cssInJsPlugin()],
});
