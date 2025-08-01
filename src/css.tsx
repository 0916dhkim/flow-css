import type { StyleObject } from "./style-object.js";

export const css = (styles: StyleObject) => {
  throw new Error(
    "css() function is meant to be compiled away. It is a zero runtime library."
  );
};
