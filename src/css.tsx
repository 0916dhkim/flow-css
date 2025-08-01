import type { StyleObject } from "./style-object.js";
import { hashStyle } from "./hash.js";
import { styleToString } from "./style-to-string.js";

export const css = (styles: StyleObject) =>
  hashStyle("css", styleToString(styles));
