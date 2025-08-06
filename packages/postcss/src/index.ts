import { FileService, Registry, Scanner, Transformer } from "@flow-css/core";

const flowCssPlugin = (opts = {}) => {
  const registry = new Registry();
  const fs = FileService();
  const scanner = new Scanner(process.cwd(), registry, fs);
  const transformer = new Transformer({ registry });

  return {
    postcssPlugin: "@flow-css/postcss",
    AtRule: {
      "flow-css": async (rule: any, { result }: any) => {
        await scanner.scanAll();
        const { code: generated } = transformer.transformCss(
          "@flow-css;",
          result.root.source?.input.from || ""
        );
        rule.replaceWith(generated);

        // Report dependencies.
        for (const file of registry.buildDependencies) {
          result.messages.push({
            type: "dependency",
            plugin: "@flow-css/postcss",
            file,
            parent: result.root.source?.input.from,
          });
        }
      },
    },
  };
};

// Mark as PostCSS plugin
flowCssPlugin.postcss = true;

module.exports = flowCssPlugin;
module.exports.default = flowCssPlugin;
