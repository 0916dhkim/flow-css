import { Project, SyntaxKind } from "ts-morph";
import { parseStyleObject, type StyleObject } from "./style-object.js";
import { serializeStyle } from "./serialize-style.js";
import type { Registry } from "./registry.js";
import { result } from "./result.js";
import postcss from "postcss";

type Options = {
  registry: Registry;
  theme?: FlowCss.Theme;
  onUnknownStyle?: (styleObject: StyleObject) => void;
};

export class Transformer {
  #registry: Registry;
  #theme?: FlowCss.Theme;
  #onUnknownStyle: (styleObject: StyleObject) => void;

  constructor(options: Options) {
    this.#registry = options.registry;
    this.#theme = options.theme;
    this.#onUnknownStyle = options.onUnknownStyle || (() => {});
  }

  async transformCss(code: string, id: string) {
    const generated = await this.#generateStyleStringFromRegistry();
    const transformed = this.#replaceFlowCssDirectiveWithGeneratedStyles(
      id,
      code,
      generated
    );

    if (transformed.hasFlowDirective) {
      this.#registry.addRoot(id);
    }

    return {
      code: transformed.code,
      hasFlowDirective: transformed.hasFlowDirective,
    };
  }

  async transformJs(code: string, id: string) {
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
        const className = await this.#registry.styleToClassName(styleObject);
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
          `.${className} {\n${serializeStyle(styleObject, this.#theme)}\n}`
      )
      .join("\n");
  }

  #replaceFlowCssDirectiveWithGeneratedStyles(
    id: string,
    originalString: string,
    generatedString: string
  ): { code: string; hasFlowDirective: boolean } {
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

    let hasFlowDirective = false;
    originalRoot.walkAtRules("flow-css", (atRule) => {
      hasFlowDirective = true;
      atRule.replaceWith(generatedRoot.clone());
    });

    return {
      code: originalRoot.toString(),
      hasFlowDirective,
    };
  }
}
