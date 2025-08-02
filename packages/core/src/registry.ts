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
    const className = hashStyle("flow", styleToString(style));
    this.#styles[className] = style;
    this.#buildDependencies.add(sourcefile);
  }

  addRoot(file: string) {
    this.#styleRoots.add(file);
  }

  getClassName(style: StyleObject) {
    const className = hashStyle("flow", styleToString(style));
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
