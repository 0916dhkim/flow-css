import type { LoaderContext } from "webpack";
import type { Registry, Transformer } from "@flow-css/core";

interface FlowCssLoaderOptions {
  // Future options can go here
}

export default function flowCssLoader(
  this: LoaderContext<FlowCssLoaderOptions>,
  source: string
): string {
  const callback = this.async();
  
  if (!callback) {
    throw new Error("flow-css loader requires async callback");
  }

  try {
    // Get registry and transformer from the compiler instance
    const registry = (this._compiler as any)?.__flowCssRegistry as Registry;
    const transformer = (this._compiler as any)?.__flowCssTransformer as Transformer;

    if (!registry || !transformer) {
      // If plugin hasn't been set up, return source unchanged
      callback(null, source);
      return source;
    }

    // Only process JavaScript/TypeScript files that are not in node_modules
    const filePath = this.resourcePath;
    if (
      !/\.(js|ts|jsx|tsx)$/.test(filePath) ||
      /node_modules/.test(filePath)
    ) {
      callback(null, source);
      return source;
    }

    // Transform the JavaScript/TypeScript code
    const result = transformer.transformJs(source, filePath);
    
    if (result) {
      callback(null, result.code);
      return result.code;
    } else {
      callback(null, source);
      return source;
    }
  } catch (error) {
    callback(error as Error);
    return source;
  }
}