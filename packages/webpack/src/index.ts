import type { Compiler } from "webpack";
import Context = require("./context");
import WebpackPluginEventSource = require("./webpack-plugin-event-source");
import type { CallbackOf, NormalModuleCompilationHooks } from "./webpack-types";
import core = require("@flow-css/core");

/**
 * Flow CSS Webpack Plugin.
 */
class FlowCssPlugin {
  apply(compiler: Compiler) {
    const eventSource = new WebpackPluginEventSource(compiler);

    // The plugin adds the loaders for asset files (like ts or css source files).
    // The loaders transform the files.
    eventSource.addListener("beforeLoaders")(injectFlowCssLoaders);

    // HMR-specific features.
    eventSource.addListener("watchRun")(rescanAllFilesIfNeeded);
    eventSource.addListener("watchRun")(triggerRebuildOfStaleStyles);
  }
}

const injectFlowCssLoaders: CallbackOf<
  NormalModuleCompilationHooks["beforeLoaders"]
> = (loaders, normalModule) => {
  const resource = normalModule.resource;
  if (resource == null) {
    return;
  }
  const fileType = core.checkFileType(resource);
  switch (fileType) {
    case "css":
      return loaders.push({
        loader: require.resolve("./css-loader"),
        type: "module",
        ident: null,
      });
    case "script":
      return loaders.push({
        loader: require.resolve("./js-loader"),
        type: "module",
        ident: null,
      });
    default:
      return;
  }
};

const rescanAllFilesIfNeeded = async (compiler: Compiler) => {
  const { registry, scanner } = await Context.getOrCreate(compiler.context);
  if (registry.hasInvalidStyle) {
    await scanner.scanAll();
  }
};

const triggerRebuildOfStaleStyles = async (compiler: Compiler) => {
  const changedFiles = new Set<string>();
  for (const file of compiler.modifiedFiles ?? []) {
    changedFiles.add(file);
  }
  for (const file of compiler.removedFiles ?? []) {
    changedFiles.add(file);
  }

  if (changedFiles.size === 0) {
    return;
  }

  try {
    const { registry, scanner } = await Context.getOrCreate(compiler.context);

    let isCssOutputStale = false;
    for (const changedFile of changedFiles) {
      const fileType = core.checkFileType(changedFile);
      if (fileType === "script") {
        if (await scanner.scanFile(changedFile)) {
          isCssOutputStale = true;
        }
      }
    }

    if (isCssOutputStale) {
      const next = new Set<string>(compiler.modifiedFiles);
      for (const styleRoot of registry.styleRoots) {
        next.add(styleRoot);
      }
      compiler.modifiedFiles = next;
    }
  } catch (error) {
    console.error("Error in FlowCSS HMR:", error);
  }
};

export = FlowCssPlugin;
