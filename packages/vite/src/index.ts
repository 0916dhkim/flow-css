import type { Plugin, ResolvedConfig } from "vite";
import {
  Scanner,
  Transformer,
  Registry,
  FileService,
  isCssFile,
  type FlowCssConfig,
  isScriptFile,
} from "@flow-css/core";

export default function flowCssVitePlugin(
  pluginConfig: FlowCssConfig = {}
): Plugin[] {
  const fs = FileService();
  const registry = new Registry({ theme: pluginConfig.theme });
  let scanner: Scanner | null = null;
  let transformer: Transformer | null = null;

  // Following @vitejs/plugin-react pattern: define each plugin with explicit Plugin type
  const flowCssConfigPlugin: Plugin = {
    name: "flow-css:config",
    async configResolved(config: ResolvedConfig) {
      scanner = new Scanner(config.root, registry, fs);
      await scanner.scanAll();
      transformer = new Transformer({
        registry,
        theme: pluginConfig.theme,
        onUnknownStyle: (styleObject) => {
          throw new Error(
            `Style object not found. The scanner must have missed this style object.`
          );
        },
      });
    },
  };

  const flowCssPrePlugin: Plugin = {
    name: "flow-css:pre",
    enforce: "pre",
    async transform(code: string, id: string) {
      if (isCssFile(id)) {
        return await transformer?.transformCss(code, id);
      }
    },
  };

  const flowCssPostPlugin: Plugin = {
    name: "flow-css:post",
    enforce: "post",
    async transform(code: string, id: string) {
      if (isScriptFile(id)) {
        return await transformer?.transformJs(code, id);
      }
    },
  };

  return [flowCssConfigPlugin, flowCssPrePlugin, flowCssPostPlugin];
}
