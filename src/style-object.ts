import type React from "react";

/**
 * Extending React's stylesheet type to allow nested selectors.
 */
export type StyleObject =
  | React.CSSProperties
  | Record<`--${string}`, string>
  | {
      [selector: string]: StyleObject;
    };
