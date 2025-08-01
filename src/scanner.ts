import fs from "node:fs/promises";
import path from "node:path";
import type { StyleObject } from "./style-object.js";
import { parseStyleObject } from "./style-object.js";
import walk from "ignore-walk";
import type { Registry } from "./registry.js";

const CSS_CALL_REGEX = /css\s*\((.*?)\)/gs;

export class Scanner {
  #root: string;
  #registry: Registry;

  constructor(root: string, registry: Registry) {
    this.#root = root;
    this.#registry = registry;
  }

  async scanAll() {
    const files = await this.#getFiles();
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
    const absolutePath = path.join(this.#root, file);
    const cssCalls = await this.#extractCssCalls(file);
    for (const cssCall of cssCalls) {
      this.#registry.addStyle(cssCall, absolutePath);
    }
    return cssCalls.length > 0;
  }

  async #extractCssCalls(filePath: string): Promise<StyleObject[]> {
    const content = await fs.readFile(filePath, "utf-8");
    const matches: StyleObject[] = [];

    for (const match of content.matchAll(CSS_CALL_REGEX)) {
      const args = match[1];
      if (args == null) {
        throw new Error(`Invalid css call in ${filePath}`);
      }

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

    return matches;
  }

  async #getFiles() {
    const files = (
      await walk({
        path: this.#root,
        ignoreFiles: [".gitignore"],
      })
    ).filter((file) => !file.startsWith(".git/"));
    return files;
  }
}
