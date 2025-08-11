import type { Registry, Scanner, Transformer } from "@flow-css/core";
import core = require("@flow-css/core");

declare global {
  /**
   * Singleton to share the Flow CSS Context between Webpack loader & plugin instances.
   */
  var __FLOW_CSS_CONTEXT__: Promise<Context> | undefined;
}

type ContextOptions = {
  root: string;
  theme?: FlowCss.Theme;
};

/**
 * An object containing all stateful part of Flow CSS build steps.
 */
class Context {
  static init(options: ContextOptions): Promise<Context> {
    if (global.__FLOW_CSS_CONTEXT__ != undefined) {
      return global.__FLOW_CSS_CONTEXT__;
    }
    global.__FLOW_CSS_CONTEXT__ = (async () => {
      const context = new Context(options);
      await context.scanner.scanAll();
      return context;
    })();

    return global.__FLOW_CSS_CONTEXT__;
  }

  static get(): Promise<Context> {
    if (global.__FLOW_CSS_CONTEXT__ == undefined) {
      throw new Error("Flow CSS Context has not been initialized yet.");
    }
    return global.__FLOW_CSS_CONTEXT__;
  }

  registry: Registry;
  scanner: Scanner;
  transformer: Transformer;

  constructor(options: ContextOptions) {
    const fs = core.FileService();
    this.registry = new core.Registry({ theme: options.theme });
    this.scanner = new core.Scanner(options.root, this.registry, fs);
    this.transformer = new core.Transformer({
      registry: this.registry,
      theme: options.theme,
      onUnknownStyle: (styleObject) => {
        throw new Error(
          `Style object not found. The scanner must have missed this style object.`
        );
      },
    });
  }
}

export = Context;
