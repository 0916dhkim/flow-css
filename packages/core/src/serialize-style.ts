import { camelToKebab } from "./string-util.js";
import type { StyleFunction, StyleObject } from "./style-object.js";

/**
 * Transforms a stylesheet object into CSS string
 * so that it can be rendered in React.
 */
const styleToString = (style: StyleObject) => {
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

export const serializeStyle = (
  style: StyleObject | StyleFunction,
  theme?: FlowCss.Theme
) => {
  let interpolated = style;
  if (typeof interpolated === "function") {
    if (theme == null) {
      throw new Error("Flow CSS theme is requested but not available.");
    }
    interpolated = interpolated(theme);
  }
  return styleToString(interpolated);
};
