import core = require("@flow-css/core");
import type { AcceptedPlugin } from "postcss";

const { FileService, Registry, Scanner, Transformer } = core;

const flowCss = (): AcceptedPlugin => {
  const registry = new Registry();
  const fs = FileService();
  const scanner = new Scanner(process.cwd(), registry, fs);
  const transformer = new Transformer({ registry });
  return {
    postcssPlugin: "@flow-css/postcss",
    AtRule: {
      "flow-css": async (root, { result }) => {
        await scanner.scanAll();
        const { code: generated } = transformer.transformCss(
          "@flow-css;",
          result.root.source?.input.from!
        );
        root.replaceWith(generated);

        // Report dependencies.
        for (const file of registry.buildDependencies) {
          result.messages.push({
            type: "dependency",
            plugin: "@flow-css/postcss",
            file,
            parent: result.root.source?.input.from!,
          });
        }
      },
    },
  };
};

flowCss.postcss = true;
module.exports = flowCss;
