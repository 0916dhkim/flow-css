import type { LoaderDefinitionFunction } from "webpack";
import {
  Transformer,
  Registry,
  styleToString,
  Scanner,
  FileService,
} from "@flow-css/core";

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

interface FlowCssLoaderOptions {
  // Future options can go here
}

type Context = {
  registry: Registry;
  transformer: Transformer;
};

let _context: Context | null = null;

async function getContext(root: string): Promise<Context> {
  if (_context != null) {
    return _context;
  }
  const registry = new Registry();
  const fs = FileService();
  const scanner = new Scanner(root, registry, fs);
  const transformer = new Transformer({
    registry,
    onUnknownStyle: (styleObject) => {
      throw new Error(
        `Style object not found. The scanner must have missed this style object: ${styleToString(
          styleObject
        )}`
      );
    },
  });

  await scanner.scanAll();

  return { registry, transformer };
}

const flowCssLoader: LoaderDefinitionFunction<FlowCssLoaderOptions> = function (
  this,
  code,
  map,
  meta
) {
  const callback = this.async();
  const noop = () => callback(null, code, map, meta);

  const filePath = this.resourcePath;

  const inner = async () => {
    if (NODE_MODULES_REGEX.test(filePath)) {
      return noop();
    }

    const { registry, transformer } = await getContext(this.rootContext);

    try {
      if (SCRIPT_REGEX.test(filePath)) {
        const result = transformer.transformJs(code, filePath);

        if (result == null) {
          return noop();
        }

        return callback(null, result.code, map, meta);
      } else if (CSS_REGEX.test(filePath)) {
        const result = transformer.transformCss(code, filePath);

        if (result == null) {
          return noop();
        }

        for (const dep of registry.buildDependencies) {
          this.addDependency(dep);
        }

        return callback(null, result.code, map, meta);
      }
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to transform ${filePath}`);
    }
  };

  inner();
};

export default flowCssLoader;
