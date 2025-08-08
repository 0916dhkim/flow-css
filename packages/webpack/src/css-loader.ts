import type { LoaderDefinitionFunction } from "webpack";
import Context = require("./context");

const webpackCssLoader: LoaderDefinitionFunction = function (
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

    try {
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

export = webpackCssLoader;
