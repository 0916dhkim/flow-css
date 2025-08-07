import type { Registry, Scanner, Transformer } from "@flow-css/core";

export type Context = {
  registry: Registry;
  scanner: Scanner;
  transformer: Transformer;
};
