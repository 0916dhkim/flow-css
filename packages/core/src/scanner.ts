import type { StyleObject } from "./style-object.js";
import { parseStyleObject } from "./style-object.js";
import type { Registry } from "./registry.js";
import type { FileService } from "./file-service.js";
import { Project, SyntaxKind } from "ts-morph";

export type FileType = "script" | "css" | "other";

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
    this.#registry.markFresh();
  }

  /**
   * Scan a file for css calls and add them to the registry
   * @param file The file to scan
   * @returns True if the file has css calls, false otherwise
   */
  async scanFile(file: string) {
    if (this.checkFileType(file) !== "script") {
      return;
    }

    const cssCalls = await this.#extractCssCalls(file);
    for (const cssCall of cssCalls) {
      this.#registry.addStyle(cssCall, file);
    }
    return cssCalls.length > 0;
  }

  checkFileType(file: string): FileType {
    const SCRIPT_REGEX = /\.(js|ts)x?$/;
    const CSS_REGEX = /\.css$/;
    if (SCRIPT_REGEX.test(file)) {
      return "script";
    } else if (CSS_REGEX.test(file)) {
      return "css";
    } else {
      return "other";
    }
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
          const evaluatedObject = parseStyleObject(args);
          matches.push(evaluatedObject);
        } catch (error) {
          console.error(error);
          throw new Error(
            `Failed to evaluate css arguments in ${filePath}: ${args}`
          );
        }
      }
    } catch (error) {
      console.error(error);
      throw new Error(`Error parsing AST for ${filePath}`);
    }

    return matches;
  }
}
