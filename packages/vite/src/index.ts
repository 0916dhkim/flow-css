import type { Plugin } from "vite";
import {
  Scanner,
  Transformer,
  Registry,
  FileService,
  isCssFile,
  type FlowCssConfig,
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
      
      // Resolve css imports to safe fallback to prevent runtime errors
      resolveId(id) {
        if (id === "@flow-css/core/css" || id.includes("flow-css/core/css")) {
          return id; // Let it resolve normally, but we'll provide safe fallback content
        }
        return null;
      },
      
      // Provide safe fallback module for css imports instead of error-throwing function
      load(id) {
        if (id === "@flow-css/core/css" || id.includes("flow-css/core/css")) {
          // Return a safe function that won't crash the application
          return 'export const css = () => ""; export default css;';
        }
        return null;
      },
      
      async transform(code, id) {
        if (isCssFile(id)) {
          return await transformer?.transformCss(code, id);
        }
        
        // Only process JavaScript/TypeScript files that are not in node_modules or dist or external libraries
        if (
          !/\.(js|ts|jsx|tsx)$/.test(id) ||
          /node_modules|\/dist\/$/.test(id)
        ) {
          return null;
        }
        
        return await transformer?.transformJs(code, id);
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
