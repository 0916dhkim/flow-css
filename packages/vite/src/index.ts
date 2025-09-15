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
) {
  const fs = FileService();
  const registry = new Registry({ theme: pluginConfig.theme });
  let scanner: Scanner | null = null;
  let transformer: Transformer | null = null;

  return [
    {
      name: "flow-css:config",
      // Runtime type: ResolvedConfig from Vite 7+
      // Using any to avoid cross-dependency type version conflicts
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
      enforce: "pre" as const,
      async transform(code: string, id: string) {
        if (isCssFile(id)) {
          return await transformer?.transformCss(code, id);
        }
      },
      // Runtime types: this = MinimalPluginContext & { environment: DevEnvironment }
      //                options = HotUpdateOptions
      // Using any to avoid cross-dependency type version conflicts while targeting Vite 7+
      async hotUpdate(options: any) {
        const hasStyleChanges = await scanner?.scanFile(options.file);
        if (!hasStyleChanges) {
          return options.modules;
        }
        if (registry.hasInvalidStyle) {
          await scanner?.scanAll();
        }
        const nextModules = [...options.modules];
        for (const root of registry.styleRoots) {
          // Vite 7+ API: this.environment.moduleGraph is available
          const rootModule = (this as any).environment.moduleGraph.getModuleById(root);
          if (rootModule) {
            nextModules.push(rootModule);
          }
        }
        return nextModules;
      },
    },
    {
      name: "flow-css:post",
      enforce: "post" as const,
      async transform(code: string, id: string) {
        if (isScriptFile(id)) {
          return await transformer?.transformJs(code, id);
        }
      },
    },
  ];
}
