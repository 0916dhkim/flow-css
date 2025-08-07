import webpack = require("webpack");
import core = require("@flow-css/core");
import type { Compiler } from "webpack";
import type { Context } from "./context";

const PLUGIN_NAME = "FlowCssPlugin";

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

class FlowCssPlugin {
  #context: Context | null = null;

  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tapPromise(
      PLUGIN_NAME,
      this.#beforeRun.bind(this)
    );
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
        PLUGIN_NAME,
        this.#beforeLoaders.bind(this)
      );
    });
  }

  async #beforeRun(compiler: HookPayloadOf<Compiler["hooks"]["beforeRun"]>[0]) {
    const root = compiler.context;
    const registry = new core.Registry();
    const fs = core.FileService();
    const scanner = new core.Scanner(root, registry, fs);
    const transformer = new core.Transformer({
      registry,
      onUnknownStyle: (styleObject) => {
        throw new Error(
          `Style object not found. The scanner must have missed this style object: ${core.styleToString(
            styleObject
          )}`
        );
      },
    });

    await scanner.scanAll();

    this.#context = { registry, scanner, transformer };
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
      // Ensure context is initialized before using it
      if (this.#context == null) {
        throw new Error(
          `FlowCssPlugin: Context not initialized. Make sure the plugin is properly configured.`
        );
      }
      
      loaders.push({
        loader: require.resolve("./loader"),
        options: { 
          // Serialize the registry to avoid private field issues
          registryData: this.#context.registry.toSerializable(),
          scanner: this.#context.scanner
        },
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
