import type { Registry, Scanner, Transformer } from "@flow-css/core";
import core = require("@flow-css/core");
import AsyncSingleton = require("./async-singleton");

class Context {
  static #singleton = new AsyncSingleton<Context>();

  static async getOrCreate(root: string): Promise<Context> {
    console.log("[plugin] Context.getOrCreate called for root:", root);
    return this.#singleton.getOrCreate(async () => {
      console.log("[plugin] Creating new Context for root:", root);
      const context = new Context(root);
      await context.scanner.scanAll();
      console.log("[plugin] Context initialized and scanAll completed");
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
