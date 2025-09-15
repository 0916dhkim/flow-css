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
): any[] {
  const fs = FileService();
  const registry = new Registry({ theme: pluginConfig.theme });
  let scanner: Scanner | null = null;
  let transformer: Transformer | null = null;

  return [
    {
      name: "flow-css:config",
      async configResolved(config: any) {
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
      name: "flow-css:pre",
      enforce: "pre",
      async transform(code: string, id: string) {
        if (isCssFile(id)) {
          return await transformer?.transformCss(code, id);
        }
      },
      async hotUpdate(ctx: any) {
        const hasStyleChanges = await scanner?.scanFile(ctx.file);
        if (!hasStyleChanges) {
          return ctx.modules;
        }
        if (registry.hasInvalidStyle) {
          await scanner?.scanAll();
        }
        const nextModules = [...ctx.modules];
        for (const root of registry.styleRoots) {
          // Handle both Vite 6 and 7+ APIs
          let rootModule = null;
          if ((this as any).environment?.moduleGraph) {
            // Vite 7+ API
            rootModule = (this as any).environment.moduleGraph.getModuleById(root);
          } else if (ctx.server?.moduleGraph) {
            // Vite 6 fallback - use server.moduleGraph
            rootModule = ctx.server.moduleGraph.getModuleById(root);
          }
          
          if (rootModule) {
            nextModules.push(rootModule);
          }
        }
        return nextModules;
      },
    },
    {
      name: "flow-css:post",
      enforce: "post",
      async transform(code: string, id: string) {
        if (isScriptFile(id)) {
          return await transformer?.transformJs(code, id);
        }
      },
    },
  ];
}
