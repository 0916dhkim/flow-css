import webpack = require("webpack");
import type { Compiler } from "webpack";
const PLUGIN_NAME = "FlowCssPlugin";

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

class FlowCssPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
        PLUGIN_NAME,
        this.#beforeLoaders.bind(this)
      );
    });
  }

  #beforeLoaders(
    ...payload: HookPayloadOf<
      ReturnType<
        (typeof webpack.NormalModule)["getCompilationHooks"]
      >["beforeLoaders"]
    >
  ) {
    const [loaders, normalModule] = payload;
    const resource = normalModule.resource;
    if (resource == null || NODE_MODULES_REGEX.test(resource)) {
      return;
    }
    if (CSS_REGEX.test(resource) || SCRIPT_REGEX.test(resource)) {
      loaders.push({
        loader: require.resolve("./loader"),
        type: "module",
        ident: null,
      });
    }
  }
}

/**
 * Extract the type of payload provided from a Webpack plugin hook.
 */
type HookPayloadOf<
  THook extends {
    tap: (options: any, callback: (payload: any) => void) => void;
  }
> = Parameters<Parameters<THook["tap"]>[1]>;

export = FlowCssPlugin;
