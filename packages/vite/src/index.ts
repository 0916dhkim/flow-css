import type { Plugin } from "vite";
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

  return [
    {
      name: "flow-css:config",
      async configResolved(config) {
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
    },
    {
      name: "flow-css",
      enforce: "pre",
      async transform(code, id) {
        // Handle CSS files with @flow-css directive, including ?transform-only parameter
        if (isCssFile(id) || (id.includes('.css?transform-only') && code.includes('@flow-css'))) {
          return await transformer?.transformCss(code, id);
        }
        if (isScriptFile(id)) {
          return await transformer?.transformJs(code, id);
        }
      },
      async hotUpdate(ctx) {
        const hasStyleChanges = await scanner?.scanFile(ctx.file);
        if (!hasStyleChanges) {
          return ctx.modules;
        }
        if (registry.hasInvalidStyle) {
          await scanner?.scanAll();
        }
        const nextModules = [...ctx.modules];
        for (const root of registry.styleRoots) {
          const rootModules =
            this.environment.moduleGraph.fileToModulesMap.get(root);
          if (rootModules) {
            for (const module of rootModules) {
              nextModules.push(module);
            }
          }
        }
        return nextModules;
      },
    },
  ];
}
