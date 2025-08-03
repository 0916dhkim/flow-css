import type { Compiler, WebpackPluginInstance } from "webpack";
import {
  Scanner,
  Transformer,
  Registry,
  FileService,
  styleToString,
} from "@flow-css/core";
import path from "node:path";

export interface FlowCssWebpackPluginOptions {
  filename?: string;
}

export default class FlowCssWebpackPlugin implements WebpackPluginInstance {
  private options: FlowCssWebpackPluginOptions;
  private registry: Registry;
  private scanner: Scanner | null = null;
  private transformer: Transformer | null = null;
  private fs: FileService;

  constructor(options: FlowCssWebpackPluginOptions = {}) {
    this.options = {
      filename: "flow-css.css",
      ...options,
    };
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

    // Generate CSS file during emit phase
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      try {
        if (!this.transformer) {
          callback(new Error("Transformer not initialized"));
          return;
        }

        // Generate CSS content
        const cssContent = this.generateCss();
        
        // Add CSS file to compilation assets
        const filename = this.options.filename!;
        compilation.assets[filename] = {
          source: () => cssContent,
          size: () => cssContent.length,
          buffer: () => Buffer.from(cssContent),
          map: () => null,
          sourceAndMap: () => ({ source: cssContent, map: null }),
          updateHash: () => {},
        };

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

  private generateCss(): string {
    const styles = this.registry.styles;
    return Object.entries(styles)
      .map(([className, styleObject]) => 
        `.${className} {\n${styleToString(styleObject)}\n}`
      )
      .join('\n');
  }
}