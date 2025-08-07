import type { LoaderDefinitionFunction } from "webpack";
import Context = require("./context");

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

const flowCssLoader: LoaderDefinitionFunction = function (
  this,
  code,
  map,
  meta
) {
  const callback = this.async();
  const NO_OP = {
    code,
    map,
    meta,
  };

  const filePath = this.resourcePath;

  const inner = async () => {
    const { registry, transformer } = await Context.getOrCreate(this.context);
    if (NODE_MODULES_REGEX.test(filePath)) {
      return NO_OP;
    }

    try {
      if (SCRIPT_REGEX.test(filePath)) {
        const result = transformer.transformJs(code, filePath);

        if (result == null) {
          return NO_OP;
        }

        return {
          code: result.code,
          map,
          meta,
        };
      } else if (CSS_REGEX.test(filePath)) {
        // Register this CSS file as a style root for HMR tracking
        registry.addRoot(filePath);

        const result = transformer.transformCss(code, filePath);

        if (result == null) {
          return NO_OP;
        }

        for (const dep of registry.buildDependencies) {
          this.addDependency(dep);
        }

        return {
          code: result.code,
          map,
          meta,
        };
      } else {
        return NO_OP;
      }
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to transform ${filePath}`);
    }
  };

  inner()
    .then((result) => callback(null, result.code, result.map, result.meta))
    .catch((error) => {
      callback(error);
    });
};

export = flowCssLoader;
