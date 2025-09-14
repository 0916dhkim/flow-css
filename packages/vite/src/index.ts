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
      // Don't enforce order - let it run whenever needed
      
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
    },
    {
      name: "flow-css:ssr-transform",
      enforce: "post", // Run after other transformations for SSR
      
      async transform(code, id) {
        // Only process files that still have css imports after the main transform
        if (code.includes('@flow-css/core/css') && !/node_modules/.test(id)) {
          // Re-run transformation for SSR build
          return await transformer?.transformJs(code, id);
        }
        
        return null;
      },
    },
    {
      name: "flow-css:final-cleanup",
      enforce: "post" as const,
      
      // Clean up any remaining css error function chunks
      generateBundle(options, bundle) {
        // Remove css error function chunks that shouldn't be needed anymore
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if ('code' in chunk && fileName.includes('css-') && 
              chunk.code.includes('css() function is meant to be compiled away')) {
            // Only delete if no other chunks reference this css chunk
            const chunkBaseName = fileName.replace('assets/', '').replace('.js', '');
            const isReferenced = Object.values(bundle).some((otherChunk) => 
              'code' in otherChunk && (
                otherChunk.code.includes(`from"./${chunkBaseName}.js"`) ||
                otherChunk.code.includes(`from'./${chunkBaseName}.js'`)
              )
            );
            
            if (!isReferenced) {
              delete bundle[fileName];
            }
          }
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
