import { FileService, Registry, Scanner, Transformer } from "@flow-css/core";
import type { AcceptedPlugin } from "postcss";

function flowCss(): AcceptedPlugin {
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
          result.opts.from!
        );
        root.replaceWith(generated);

        // Report dependencies.
        for (const file of registry.buildDependencies) {
          result.messages.push({
            type: "dependency",
            plugin: "@flow-css/postcss",
            file,
            parent: result.opts.from,
          });
        }
      },
    },
  };
}

export default flowCss;
