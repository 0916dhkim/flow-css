import type { Compiler } from "webpack";
import webpack = require("webpack");

/**
 * Extract the type of payload provided from a Webpack plugin hook.
 */
export type CallbackOf<THook> = Parameters<
  THook extends { tapPromise: any }
    ? THook["tapPromise"]
    : THook extends { tap: any }
    ? THook["tap"]
    : never
>[1];

export type CompilerHooks = Compiler["hooks"];
export type NormalModuleCompilationHooks = ReturnType<
  (typeof webpack.NormalModule)["getCompilationHooks"]
>;
