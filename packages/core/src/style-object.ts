import type React from "react";
import { runInNewContext } from "node:vm";

/**
 * Extending React's stylesheet type to allow nested selectors.
 */
export type StyleObject =
  | React.CSSProperties
  | Record<`--${string}`, string>
  | {
      [selector: string]: StyleObject;
    };

export type StyleFunction = (theme: FlowCss.Theme) => StyleObject;

export function parseStyleObject(str: string) {
  const evaluatedObject = runInNewContext(
    `(${str})`,
    {},
    {
      timeout: 1000, // 1 second timeout
    }
  );
  // TODO: Type check the evaluated object
  return evaluatedObject as StyleObject;
}

declare global {
  namespace FlowCss {
    interface Theme {}
  }
}
