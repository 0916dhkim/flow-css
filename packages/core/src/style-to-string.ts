import { camelToKebab } from "./string-util.js";
import type { StyleObject } from "./style-object.js";

/**
 * Transforms a stylesheet object into CSS string
 * so that it can be rendered in React.
 */
export const styleToString = (style: StyleObject) => {
  return Object.entries(style)
    .reduce((acc: string[], [key, value]) => {
      const normalizedKey = camelToKebab(key);
      let rule: string;
      if (typeof value === "string" || typeof value === "number") {
        rule = `${normalizedKey}:${value};`;
      } else {
        rule = `${normalizedKey}{${styleToString(value)}}`;
      }

      acc.push(rule);
      return acc;
    }, [])
    .join("\n");
};
