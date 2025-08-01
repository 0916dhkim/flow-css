import type { StyleObject } from "./style-object.js";
import { parseStyleObject } from "./style-object.js";
import type { Registry } from "./registry.js";
import type { FileService } from "./file-service.js";
import { Project, SyntaxKind } from "ts-morph";

export class Scanner {
  #root: string;
  #registry: Registry;
  #fs: FileService;

  constructor(root: string, registry: Registry, fs: FileService) {
    this.#fs = fs;
    this.#root = root;
    this.#registry = registry;
  }

  async scanAll() {
    const files = await this.#fs.getAllFilesExceptIgnored(this.#root);
    for (const file of files) {
      await this.scanFile(file);
    }
  }

  /**
   * Scan a file for css calls and add them to the registry
   * @param file - The file to scan
   * @returns True if the file has css calls, false otherwise
   */
  async scanFile(file: string) {
    const cssCalls = await this.#extractCssCalls(file);
    for (const cssCall of cssCalls) {
      this.#registry.addStyle(cssCall, file);
    }
    return cssCalls.length > 0;
  }

  async #extractCssCalls(filePath: string): Promise<StyleObject[]> {
    const content = await this.#fs.readFile(filePath);
    const matches: StyleObject[] = [];

    try {
      // Create a ts-morph project to work with the AST
      const project = new Project({
        useInMemoryFileSystem: true,
      });

      // Create a source file from the code
      const sourceFile = project.createSourceFile(filePath, content);

      // Find all css() function calls using AST
      const cssCalls = sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((expr) => expr.getExpression().getText() === "css");

      for (const call of cssCalls) {
        const firstArg = call.getArguments()[0];
        if (firstArg == null) {
          throw new Error(`Invalid css call in ${filePath}: missing arguments`);
        }

        const args = firstArg.getText();
        
        try {
          // Safely evaluate the JavaScript object literal
          const evaluatedObject = parseStyleObject(args);
          matches.push(evaluatedObject as StyleObject);
        } catch (error) {
          console.warn(
            `Failed to evaluate css arguments in ${filePath}: ${args}`
          );
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error parsing AST for ${filePath}:`, error);
      throw error;
    }

    return matches;
  }
}
