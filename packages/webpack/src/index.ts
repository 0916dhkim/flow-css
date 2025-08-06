import type { LoaderDefinitionFunction } from "webpack";
import { Transformer, Registry } from "@flow-css/core";

interface FlowCssLoaderOptions {
  // Future options can go here
}

type Context = {
  transformer: Transformer;
};

let _context: Context | null = null;

function getContext(): Context {
  if (_context != null) {
    return _context;
  }
  const registry = new Registry();
  const transformer = new Transformer({ registry });

  return { transformer };
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

  // Only process JavaScript/TypeScript files that are not in node_modules
  if (!/\.(js|ts|jsx|tsx)$/.test(filePath) || /node_modules/.test(filePath)) {
    noop();
    return;
  }

  try {
    const { transformer } = getContext();

    // Transform the JavaScript/TypeScript code
    const result = transformer.transformJs(code, filePath);

    if (result == null) {
      noop();
      return;
    } else {
      callback(null, result.code, map, meta);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to transform ${filePath}`);
  }
};

export default flowCssLoader;
