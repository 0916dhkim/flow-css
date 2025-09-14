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

    this.#registry.addRoot(id);

    return {
      code: transformed,
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

      // Remove unused css imports since we've transformed all css() calls
      const imports = sourceFile.getImportDeclarations();
      
      for (const importDecl of imports) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        
        if (moduleSpecifier === "@flow-css/core/css" || moduleSpecifier.includes("flow-css/core/css")) {
          // Check if any named imports are still used after transformation
          const namedImports = importDecl.getNamedImports();
          const importsToRemove: any[] = [];
          
          for (const namedImport of namedImports) {
            const importName = namedImport.getName();
            
            if (importName === "css") {
              // Check if 'css' identifier is still used anywhere in the code
              const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)
                .filter(id => id.getText() === "css" && id !== namedImport.getNameNode());
              
              if (identifiers.length === 0) {
                importsToRemove.push(namedImport);
              }
            }
          }
          
          // Remove the unused imports
          for (const importToRemove of importsToRemove) {
            importToRemove.remove();
          }
          
          // If no named imports left, remove the entire import declaration
          if (importDecl.getNamedImports().length === 0) {
            importDecl.remove();
          }
        }
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
