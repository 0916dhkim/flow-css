import { hashStyle } from "./hash.js";
import type { StyleObject } from "./style-object.js";
import { styleToString } from "./style-to-string.js";

export class Registry {
  #styles: Record<string, StyleObject>;
  #buildDependencies: Set<string>;
  #styleRoots: Set<string>;
  #isStale: boolean;

  constructor() {
    this.#styles = {};
    this.#buildDependencies = new Set();
    this.#styleRoots = new Set();
    this.#isStale = false;
  }

  get isStale() {
    return this.#isStale;
  }

  invalidate() {
    this.#styles = {};
    this.#buildDependencies = new Set();
    this.#styleRoots = new Set();
    this.#isStale = true;
  }

  markFresh() {
    this.#isStale = false;
  }

  addStyle(style: StyleObject, sourcefile: string) {
    const className = this.styleToClassName(style);
    this.#styles[className] = style;
    this.#buildDependencies.add(sourcefile);
  }

  addRoot(file: string) {
    this.#styleRoots.add(file);
  }

  hasClassName(className: string) {
    return this.#styles[className] != null;
  }

  styleToClassName(style: StyleObject) {
    return hashStyle("flow", styleToString(style));
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
