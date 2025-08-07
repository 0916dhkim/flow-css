import type { Registry, Scanner, Transformer } from "@flow-css/core";
import core = require("@flow-css/core");

declare global {
  var __FLOW_CSS_SINGLETON__: Promise<Context> | undefined;
}

class Context {
  static getOrCreate(root: string): Promise<Context> {
    if (global.__FLOW_CSS_SINGLETON__ == undefined) {
      global.__FLOW_CSS_SINGLETON__ = (async () => {
        const context = new Context(root);
        await context.scanner.scanAll();
        return context;
      })();
    }
    return global.__FLOW_CSS_SINGLETON__;
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
