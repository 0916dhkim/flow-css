import webpack = require("webpack");
import type { Compiler } from "webpack";
import type {
  CallbackOf,
  CompilerHooks,
  NormalModuleCompilationHooks,
} from "./webpack-types";

const PLUGIN_NAME = "FlowCssPlugin";

class WebpackPluginEventSource {
  #compiler: Compiler;
  constructor(compiler: Compiler) {
    this.#compiler = compiler;
  }

  addListener<TEvent extends WebpackPluginEvent>(
    event: TEvent
  ): AddListener<TEvent> {
    const _addListener = buildAddListenerFunction[event];
    return _addListener(this.#compiler) as AddListener<TEvent>;
  }
}

/**
 * Describes where to attach a handler for each event type.
 */
const buildAddListenerFunction = {
  run: (compiler) => (handler: CallbackOf<CompilerHooks["run"]>) =>
    compiler.hooks.run.tapPromise(PLUGIN_NAME, handler),
  beforeCompile:
    (compiler) => (handler: CallbackOf<CompilerHooks["beforeCompile"]>) =>
      compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, handler),
  beforeRun: (compiler) => (handler: CallbackOf<CompilerHooks["beforeRun"]>) =>
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, handler),
  watchRun: (compiler) => (handler: CallbackOf<CompilerHooks["watchRun"]>) => {
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, handler);
  },
  beforeLoaders:
    (compiler) =>
    (handler: CallbackOf<NormalModuleCompilationHooks["beforeLoaders"]>) => {
      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
        webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
          PLUGIN_NAME,
          handler
        );
      });
    },
} satisfies Record<string, (compiler: Compiler) => void>;

type WebpackPluginEvent = keyof typeof buildAddListenerFunction;
type AddListener<TEvent extends WebpackPluginEvent> = ReturnType<
  (typeof buildAddListenerFunction)[TEvent]
>;

export = WebpackPluginEventSource;
