import type { LoaderDefinitionFunction } from "webpack";
import Context = require("./context");

const webpackJsLoader: LoaderDefinitionFunction = function (
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
    const { transformer } = await Context.get();
    try {
      const result = await transformer.transformJs(code, filePath);

      if (result == null) {
        return NO_OP;
      }

      return {
        code: result.code,
        map,
        meta,
      };
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

export = webpackJsLoader;
