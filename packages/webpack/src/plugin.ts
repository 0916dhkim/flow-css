import type { Compiler, WebpackPluginInstance } from "webpack";
import {
  Scanner,
  Transformer,
  Registry,
  FileService,
} from "@flow-css/core";

export interface FlowCssWebpackPluginOptions {
  // Future options can go here
}

export default class FlowCssWebpackPlugin implements WebpackPluginInstance {
  private options: FlowCssWebpackPluginOptions;
  private registry: Registry;
  private scanner: Scanner | null = null;
  private transformer: Transformer | null = null;
  private fs: FileService;

  constructor(options: FlowCssWebpackPluginOptions = {}) {
    this.options = options;
    this.registry = new Registry();
    this.fs = FileService();
  }

  apply(compiler: Compiler) {
    const pluginName = "FlowCssWebpackPlugin";

    // Initialize scanner and transformer during compilation
    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, callback) => {
      try {
        const rootPath = compiler.context || process.cwd();
        this.scanner = new Scanner(rootPath, this.registry, this.fs);
        await this.scanner.scanAll();
        this.transformer = new Transformer(this.registry);
        
        // Store references on the compiler for the loader to access
        (compiler as any).__flowCssRegistry = this.registry;
        (compiler as any).__flowCssTransformer = this.transformer;
        
        callback();
      } catch (error) {
        callback(error as Error);
      }
    });

    // Watch for file changes in development
    if (compiler.options.mode === "development") {
      compiler.hooks.watchRun.tapAsync(pluginName, async (compiler, callback) => {
        try {
          if (this.scanner && this.registry.isStale) {
            await this.scanner.scanAll();
          }
          callback();
        } catch (error) {
          callback(error as Error);
        }
      });
    }
  }
}