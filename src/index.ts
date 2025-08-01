import type { Plugin } from "vite";
import path from "node:path";
import { Scanner } from "./scanner.js";
import { Transformer } from "./transformer.js";
import { Registry } from "./registry.js";

export default function cssInJsPlugin(): Plugin[] {
  const registry = new Registry();
  let scanner: Scanner | null = null;
  let transformer: Transformer | null = null;

  function getExtension(id: string) {
    let filename = id.split("?", 2)[0]!;
    return path.extname(filename).slice(1);
  }

  function _isCssFile(id: string) {
    if (id.includes("/.vite/")) {
      return false;
    }
    let extension = getExtension(id);
    let isCssFile = extension === "css" || id.includes("&lang.css");
    return isCssFile;
  }

  return [
    {
      name: "vite-css-in-js-plugin:config",
      async configResolved(config) {
        scanner = new Scanner(config.root, registry);
        await scanner.scanAll();
        transformer = new Transformer(registry);
      },
    },
    {
      name: "vite-css-in-js-plugin",
      enforce: "pre",
      async transform(code, id) {
        if (_isCssFile(id)) {
          return transformer?.transformCss(code, id, (id) =>
            this.addWatchFile(id)
          );
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
      handleHotUpdate(ctx) {
        const isUpdated = scanner?.scanFile(ctx.file);
        if (!isUpdated) {
          return ctx.modules;
        }
        const nextModules = [...ctx.modules];
        for (const root of registry.styleRoots) {
          const rootModules = ctx.server.moduleGraph.fileToModulesMap.get(root);
          if (rootModules) {
            for (const module of rootModules) {
              console.log(module.id);
              nextModules.push(module);
            }
          }
        }
        return nextModules;
      },
    },
  ];
}
