import type { Registry, Scanner, Transformer } from "@flow-css/core";
import core = require("@flow-css/core");
import AsyncSingleton = require("./async-singleton");

// Global registry for Context instances keyed by root path
// This allows sharing contexts across multiple webpack instances
const globalContexts = (global as any).__flowCssContexts || ((global as any).__flowCssContexts = new Map<string, AsyncSingleton<Context>>());

class Context {
  static async getOrCreate(root: string): Promise<Context> {
    // Get or create a singleton for this specific root path
    if (!globalContexts.has(root)) {
      globalContexts.set(root, new AsyncSingleton<Context>());
    }
    
    const singleton = globalContexts.get(root)!;
    
    return singleton.getOrCreate(async () => {
      const context = new Context(root);
      await context.scanner.scanAll();
      return context;
    });
  }

  registry: Registry;
  scanner: Scanner;
  transformer: Transformer;

  constructor(root: string) {
    const fs = core.FileService();
    this.registry = new core.Registry();
    this.scanner = new core.Scanner(root, this.registry, fs);
    this.transformer = new core.Transformer({
      registry: this.registry,
      onUnknownStyle: (styleObject) => {
        throw new Error(
          `Style object not found. The scanner must have missed this style object: ${core.styleToString(
            styleObject
          )}`
        );
      },
    });
  }
}

export = Context;
