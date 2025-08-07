import webpack = require("webpack");
import type { Compiler } from "webpack";
import Context = require("./context");

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

    // Add HMR support for development mode
    if (compiler.options.mode === 'development' || compiler.options.watch) {
      compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, async (compiler, callback) => {
        try {
          await this.#handleHMR(compiler);
          callback();
        } catch (error) {
          callback(error instanceof Error ? error : new Error(String(error)));
        }
      });
    }
  }

  async #handleHMR(compiler: Compiler) {
    const modifiedFiles = compiler.modifiedFiles;
    const removedFiles = compiler.removedFiles;
    
    if (!modifiedFiles && !removedFiles) {
      return;
    }

    try {
      const context = await Context.getOrCreate(compiler.context);
      const { registry, scanner } = context;

      let needsInvalidation = false;

      // Check modified files for CSS calls
      if (modifiedFiles) {
        for (const file of modifiedFiles) {
          if (SCRIPT_REGEX.test(file) && !NODE_MODULES_REGEX.test(file)) {
            const hasStyleChanges = await scanner.scanFile(file);
            if (hasStyleChanges) {
              needsInvalidation = true;
            }
          }
        }
      }

      // Check removed files 
      if (removedFiles) {
        for (const file of removedFiles) {
          if (SCRIPT_REGEX.test(file) && !NODE_MODULES_REGEX.test(file)) {
            needsInvalidation = true;
          }
        }
      }

      // If we detected changes in CSS calls, invalidate CSS files and rescan if needed
      if (needsInvalidation) {
        if (registry.isStale) {
          await scanner.scanAll();
        }

        // Invalidate all CSS files that depend on style definitions
        // We'll use webpack's built-in invalidation via the compilation hooks
        // The actual invalidation will happen during the next compilation cycle
        for (const styleRoot of registry.styleRoots) {
          // Add the CSS file as a file dependency to ensure it gets rebuilt
          // This will be processed in the next compilation cycle
          compiler.hooks.compilation.tap(`${PLUGIN_NAME}-invalidation`, (compilation) => {
            compilation.fileDependencies.add(styleRoot);
          });
        }
      }
    } catch (error) {
      console.error('Error in FlowCSS HMR:', error);
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
