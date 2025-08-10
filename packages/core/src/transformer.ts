import { Project, SyntaxKind } from "ts-morph";
import { parseStyleObject, type StyleObject } from "./style-object.js";
import { styleToString } from "./style-to-string.js";
import type { Registry } from "./registry.js";
import { result } from "./result.js";
import postcss from "postcss";

type Options = {
  registry: Registry;
  onUnknownStyle?: (styleObject: StyleObject) => void;
};

export class Transformer {
  #registry: Registry;
  #onUnknownStyle: (styleObject: StyleObject) => void;

  constructor(options: Options) {
    this.#registry = options.registry;
    this.#onUnknownStyle = options.onUnknownStyle || (() => {});
  }

  transformCss(code: string, id: string) {
    const generated = this.#generateStyleStringFromRegistry();
    const transformed = this.#replaceFlowCssDirectiveWithGeneratedStyles(
      id,
      code,
      generated,
    );

    this.#registry.addRoot(id);

    return {
      code: transformed,
    };
  }

  transformJs(code: string, id: string) {
    try {
      // Create a ts-morph project to work with the AST
      const project = new Project({
        useInMemoryFileSystem: true,
      });

      // Create a source file from the code
      const sourceFile = project.createSourceFile(id, code);

      const cssCalls = sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((expr) => expr.getExpression().getText() === "css");

      if (cssCalls.length === 0) {
        return null;
      }

      // Replace each css() call with the className.
      for (const call of cssCalls) {
        const firstParam = call.getArguments()[0]!.getText();
        const styleObject = parseStyleObject(firstParam);
        const className = this.#registry.styleToClassName(styleObject);
        if (!this.#registry.hasClassName(className)) {
          this.#onUnknownStyle(styleObject);
        }
        call.replaceWithText(`"${className}"`);
      }

      return {
        code: sourceFile.getFullText(),
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error parsing AST for: ${id}`);
    }
  }

  #generateStyleStringFromRegistry() {
    return Object.entries(this.#registry.styles)
      .map(
        ([className, styleObject]) =>
          `.${className} {\n${styleToString(styleObject)}\n}`,
      )
      .join("\n");
  }

  #replaceFlowCssDirectiveWithGeneratedStyles(
    id: string,
    originalString: string,
    generatedString: string,
  ) {
    const originalRoot = result(() => postcss.parse(originalString))
      .catch((e) => {
        console.error(e);
        throw new Error(`Invalid source ${id}`);
      })
      .done();
    const generatedRoot = result(() => postcss.parse(generatedString))
      .catch(() => {
        this.#registry.markInvalid();
        console.error(generatedString);
        throw new Error("Invalid CSS");
      })
      .done();

    originalRoot.walkAtRules("flow-css", (atRule) => {
      atRule.replaceWith(generatedRoot);
    });

    return originalRoot.toString();
  }
}
