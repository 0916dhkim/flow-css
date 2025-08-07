import webpack = require("webpack");
import type { Compiler } from "webpack";
import Context = require("./context");

const ID = Math.floor(Math.random() * 100);
console.log(`[plugin] load ${ID}`);

const PLUGIN_NAME = "FlowCssPlugin";

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

class FlowCssPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      console.log(`[flowcss] compilation ${compilation.name}`);
      webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
        PLUGIN_NAME,
        this.#beforeLoaders.bind(this)
      );
    });

    // Add HMR support for development mode
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async (compiler) => {
      await this.#handleHMR(compiler);
    });
  }

  async #handleHMR(compiler: Compiler) {
    const changedFiles = new Set<string>();
    for (const file of compiler.modifiedFiles ?? []) {
      changedFiles.add(file);
    }
    for (const file of compiler.removedFiles ?? []) {
      changedFiles.add(file);
    }

    if (changedFiles.size === 0) {
      return;
    }

    console.log(`[hmr] files changed: ${Array.from(changedFiles).join("\n")}`);

    try {
      const context = await Context.getOrCreate(compiler.context);
      const { scanner } = context;

      let needsInvalidation = false;
      for (const changedFile of changedFiles) {
        if (NODE_MODULES_REGEX.test(changedFile)) {
          continue;
        }
        if (SCRIPT_REGEX.test(changedFile)) {
          console.log(`[hmr] manual scanning ${changedFile}`);
          const hasStyleChanges = await scanner.scanFile(changedFile);
          if (hasStyleChanges) {
            needsInvalidation = true;
          }
        }
      }

      if (needsInvalidation) {
        console.log(`[hmr] needs invalidation`);
      }
    } catch (error) {
      console.error("Error in FlowCSS HMR:", error);
    }
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
