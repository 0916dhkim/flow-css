import { hashStyle } from "./hash.js";
import type { StyleObject } from "./style-object.js";
import { styleToString } from "./style-to-string.js";

export class Registry {
  #styles: Record<string, StyleObject>;
  #buildDependencies: Set<string>;
  #styleRoots: Set<string>;

  constructor() {
    this.#styles = {};
    this.#buildDependencies = new Set();
    this.#styleRoots = new Set();
  }

  addStyle(style: StyleObject, sourcefile: string) {
    const className = hashStyle("css", styleToString(style));
    this.#styles[className] = style;
    this.#buildDependencies.add(sourcefile);
  }

  addRoot(file: string) {
    this.#styleRoots.add(file);
  }

  getClassName(style: StyleObject) {
    const className = hashStyle("css", styleToString(style));
    const hasStyle = this.#styles[className] != null;
    return hasStyle ? className : null;
  }

  get styles() {
    return this.#styles;
  }

  get buildDependencies() {
    return Array.from(this.#buildDependencies);
  }

  get styleRoots() {
    return Array.from(this.#styleRoots);
  }
}
