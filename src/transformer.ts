import { Project, SyntaxKind } from "ts-morph";
import { parseStyleObject } from "./style-object.js";
import { styleToString } from "./style-to-string.js";
import type { Registry } from "./registry.js";

export class Transformer {
  #registry: Registry;

  constructor(registry: Registry) {
    this.#registry = registry;
  }

  transformCss(code: string, id: string, addWatchFile: (id: string) => void) {
    const generated = Object.entries(this.#registry.styles)
      .map(
        ([className, styleObject]) =>
          `.${className} {\n${styleToString(styleObject)}\n}`
      )
      .join("\n");
    const transformed = code.replace("@tiny-css;", generated);

    this.#registry.addRoot(id);
    for (const buildDependency of this.#registry.buildDependencies) {
      addWatchFile(buildDependency);
    }

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
        const className = this.#registry.getClassName(styleObject);
        if (className == null) {
          throw new Error(
            `Style object not found. The scanner must have missed this style object: ${styleToString(
              styleObject
            )}`
          );
        }
        call.replaceWithText(`"${className}"`);
      }

      return {
        code: sourceFile.getFullText(),
      };
    } catch (error) {
      console.error("Error parsing AST for:", id, error);
      // Return null to let Vite handle the file normally
      return null;
    }
  }
}
