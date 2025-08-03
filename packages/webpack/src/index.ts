import type { LoaderContext } from "webpack";
import {
  Scanner,
  Transformer,
  Registry,
  FileService,
} from "@flow-css/core";

interface FlowCssLoaderOptions {
  // Future options can go here
}

// Global state to avoid re-scanning on every file
let globalRegistry: Registry | null = null;
let globalTransformer: Transformer | null = null;
let isInitialized = false;

export default function flowCssLoader(
  this: LoaderContext<FlowCssLoaderOptions>,
  source: string
): string {
  const callback = this.async();
  
  if (!callback) {
    throw new Error("flow-css loader requires async callback");
  }

  const filePath = this.resourcePath;

  // Only process JavaScript/TypeScript files that are not in node_modules
  if (
    !/\.(js|ts|jsx|tsx)$/.test(filePath) ||
    /node_modules/.test(filePath)
  ) {
    callback(null, source);
    return source;
  }

  const initializeIfNeeded = async () => {
    if (!isInitialized) {
      const rootPath = this.rootContext || process.cwd();
      const fs = FileService();
      globalRegistry = new Registry();
      const scanner = new Scanner(rootPath, globalRegistry, fs);
      
      await scanner.scanAll();
      globalTransformer = new Transformer(globalRegistry);
      isInitialized = true;
    }
  };

  const processFile = async () => {
    try {
      await initializeIfNeeded();

      if (!globalTransformer) {
        callback(null, source);
        return;
      }

      // Transform the JavaScript/TypeScript code
      const result = globalTransformer.transformJs(source, filePath);
      
      if (result) {
        callback(null, result.code);
      } else {
        callback(null, source);
      }
    } catch (error) {
      callback(error as Error);
    }
  };

  processFile();
  return source;
}

export { flowCssLoader };