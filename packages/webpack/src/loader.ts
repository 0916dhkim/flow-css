import type { LoaderDefinitionFunction } from "webpack";
import type { Context } from "./context";

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

const flowCssLoader: LoaderDefinitionFunction<Context> = function (
  this,
  code,
  map,
  meta
) {
  const callback = this.async();
  const options = this.getOptions();
  
  // Validate that we have the required context
  if (!options || !options.registry || !options.transformer) {
    return callback(
      new Error(
        `FlowCssLoader: Invalid context options. Expected registry and transformer, got: ${JSON.stringify(Object.keys(options || {}))}`
      )
    );
  }
  
  const { registry, transformer } = options;
  const noop = () => callback(null, code, map, meta);

  const filePath = this.resourcePath;

  const inner = async () => {
    if (NODE_MODULES_REGEX.test(filePath)) {
      return noop();
    }

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

export = flowCssLoader;
