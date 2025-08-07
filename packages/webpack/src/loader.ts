import type { LoaderDefinitionFunction } from "webpack";
import core = require("@flow-css/core");
import type { Context } from "./context";

const SCRIPT_REGEX = /\.(js|ts)x?$/;
const CSS_REGEX = /\.css$/;
const NODE_MODULES_REGEX = /node_modules/;

type SerializableContext = {
  registryData: core.SerializableRegistryData;
  scanner: core.Scanner;
};

const flowCssLoader: LoaderDefinitionFunction<SerializableContext> = function (
  this,
  code,
  map,
  meta
) {
  const callback = this.async();
  const options = this.getOptions();
  
  // Validate that we have the required context
  if (!options || !options.registryData || !options.scanner) {
    return callback(
      new Error(
        `FlowCssLoader: Invalid context options. Expected registryData and scanner, got: ${JSON.stringify(Object.keys(options || {}))}`
      )
    );
  }
  
  const { registryData, scanner } = options;
  
  // Reconstruct the registry from serialized data
  const registry = core.Registry.fromSerializable(registryData);
  
  // Reconstruct the transformer from serializable data
  const transformer = new core.Transformer({
    registry,
    onUnknownStyle: (styleObject) => {
      throw new Error(
        `Style object not found. The scanner must have missed this style object: ${core.styleToString(
          styleObject
        )}`
      );
    },
  });
  
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
