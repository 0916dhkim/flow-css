import { hashStyle } from "./hash.js";
import type { StyleObject } from "./style-object.js";
import { serializeStyle } from "./serialize-style.js";

type Options = {
  theme?: FlowCss.Theme;
};

export class Registry {
  #theme?: FlowCss.Theme;
  #styles: Record<string, StyleObject>;
  #buildDependencies: Set<string>;
  /** Style roots are CSS files that include the `@flow-css` directive.  */
  #styleRoots: Set<string>;
  #hasInvalidStyle: boolean;

  constructor(options: Options) {
    this.#theme = options.theme;
    this.#styles = {};
    this.#buildDependencies = new Set();
    this.#styleRoots = new Set();
    this.#hasInvalidStyle = false;
  }

  get hasInvalidStyle() {
    return this.#hasInvalidStyle;
  }

  markInvalid() {
    this.#styles = {};
    this.#buildDependencies = new Set();
    this.#styleRoots = new Set();
    this.#hasInvalidStyle = true;
  }

  markValid() {
    this.#hasInvalidStyle = false;
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
    return hashStyle("flow", serializeStyle(style, this.#theme));
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

  /**
   * Check if there are registered styles but no CSS file with `@flow-css;` directive.
   * Returns a diagnostic object indicating whether the configuration is valid.
   */
  validateStyleRoots(): {
    valid: boolean;
    styleCount: number;
    rootCount: number;
    message: string | null;
  } {
    const styleCount = Object.keys(this.#styles).length;
    const rootCount = this.#styleRoots.size;

    if (styleCount > 0 && rootCount === 0) {
      return {
        valid: false,
        styleCount,
        rootCount,
        message:
          `[flow-css] Found ${styleCount} css() call(s) but no CSS file contains the @flow-css; directive. ` +
          `Generated styles will not be injected and elements will be unstyled. ` +
          `Add @flow-css; to a CSS file that is imported in your application (e.g. index.css or globals.css). ` +
          `See: https://github.com/0916dhkim/flow-css#usage`,
      };
    }

    return { valid: true, styleCount, rootCount, message: null };
  }
}
