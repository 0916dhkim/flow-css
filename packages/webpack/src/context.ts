import type { Registry, Scanner, Transformer } from "@flow-css/core";
import core = require("@flow-css/core");

declare global {
  /**
   * Singleton to share the Flow CSS Context between Webpack loader & plugin instances.
   */
  var __FLOW_CSS_CONTEXT__: Promise<Context> | undefined;
}

/**
 * An object containing all stateful part of Flow CSS build steps.
 */
class Context {
  static getOrCreate(root: string): Promise<Context> {
    if (global.__FLOW_CSS_CONTEXT__ == undefined) {
      global.__FLOW_CSS_CONTEXT__ = (async () => {
        const context = new Context(root);
        await context.scanner.scanAll();
        return context;
      })();
    }
    return global.__FLOW_CSS_CONTEXT__;
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
