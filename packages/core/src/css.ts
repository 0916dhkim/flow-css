import type { StyleFunction, StyleObject } from "./style-object.js";

export const css = (styles: StyleObject | StyleFunction) => {
  throw new Error(
    "css() function is meant to be compiled away. It is a zero runtime library."
  );
};
