import type { Plugin } from "vite";
import { Scanner } from "./scanner.js";
import { Transformer } from "./transformer.js";
import { Registry } from "./registry.js";
import { FileService, isCssFile } from "./file-service.js";

export default function cssInJsPlugin(): Plugin[] {
  const fs = FileService();
  const registry = new Registry();
  let scanner: Scanner | null = null;
  let transformer: Transformer | null = null;

  return [
    {
      name: "vite-css-in-js-plugin:config",
      async configResolved(config) {
        scanner = new Scanner(config.root, registry, fs);
        await scanner.scanAll();
        transformer = new Transformer(registry);
      },
    },
    {
      name: "vite-css-in-js-plugin",
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
      async handleHotUpdate(ctx) {
        const isUpdated = await scanner?.scanFile(ctx.file);
        if (!isUpdated) {
          return ctx.modules;
        }
        if (registry.isStale) {
          await scanner?.scanAll();
        }
        const nextModules = [...ctx.modules];
        for (const root of registry.styleRoots) {
          const rootModules = ctx.server.moduleGraph.fileToModulesMap.get(root);
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
