import type { Plugin } from "vite";
import {
  Scanner,
  Transformer,
  Registry,
  FileService,
  isCssFile,
  styleToString,
} from "@flow-css/core";

export default function cssInJsPlugin(): Plugin[] {
  const fs = FileService();
  const registry = new Registry();
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
          onUnknownStyle: (styleObject) => {
            throw new Error(
              `Style object not found. The scanner must have missed this style object: ${styleToString(
                styleObject
              )}`
            );
          },
        });
      },
    },
    {
      name: "flow-css",
      enforce: "pre",
      async transform(code, id) {
        if (isCssFile(id)) {
          return transformer?.transformCss(code, id);
        }
        // Only process JavaScript/TypeScript files that are not in node_modules or dist or external libraries
        if (
          !/\.(js|ts|jsx|tsx)$/.test(id) ||
          /node_modules|\/dist\/$/.test(id)
        ) {
          return null;
        }
        return transformer?.transformJs(code, id);
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
