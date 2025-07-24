import type { Plugin } from "vite";
import { transform, build } from "esbuild";
import { styleToString } from "./style-to-string.js";
import { StyleObject } from "./style-object.js";
import * as vm from "vm";

interface PluginOptions {
  functionName?: string;
  classNamePrefix?: string;
  cssOutputPath?: string;
}

const rulesToString = (rules: Record<string, StyleObject>): string => {
  return Object.entries(rules)
    .map(([className, content]) => {
      return `.${className} {\n${styleToString(content)}\n}`;
    })
    .join("\n\n");
};

interface CssCallInfo {
  id: string;
  styles: StyleObject;
}

export async function transformCode(
  code: string,
  id: string,
  options: PluginOptions = {}
): Promise<{ code: string; cssRules?: Record<string, StyleObject> }> {
  const { functionName = "css", classNamePrefix = "css-" } = options;

  const generateClassName = (): string => {
    const hash = Math.random().toString(36).substring(2, 8);
    return `${classNamePrefix}${hash}`;
  };

  if (
    !id.endsWith(".tsx") &&
    !id.endsWith(".ts") &&
    !id.endsWith(".jsx") &&
    !id.endsWith(".js")
  ) {
    return { code };
  }

  try {
    const cssRulesForFile: Record<string, StyleObject> = {};

    // Find all css() calls using regex
    const functionNameRegex = new RegExp(`\\b${functionName}\\s*\\(`, "g");
    let match;
    const cssCallPositions: { start: number; end: number; callId: string }[] = [];
    let callCounter = 0;

    // First pass: identify all css() call positions and assign unique IDs
    while ((match = functionNameRegex.exec(code)) !== null) {
      const start = match.index;
      const functionStart = start + match[0].length;

      // Find the matching closing parenthesis
      let depth = 1;
      let i = functionStart;
      let inString = false;
      let stringChar = "";

      while (i < code.length && depth > 0) {
        const char = code[i];

        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && code[i - 1] !== "\\") {
          inString = false;
          stringChar = "";
        } else if (!inString) {
          if (char === "(") {
            depth++;
          } else if (char === ")") {
            depth--;
          }
        }

        i++;
      }

      if (depth === 0) {
        const callId = `css_call_${callCounter++}`;
        cssCallPositions.push({
          start,
          end: i,
          callId,
        });
      }
    }

    if (cssCallPositions.length === 0) {
      return { code };
    }

    // Create a modified version of the code that collects css() call results
    let modifiedCode = code;
    
    // Replace css function calls with collection logic
    for (let i = cssCallPositions.length - 1; i >= 0; i--) {
      const { start, end, callId } = cssCallPositions[i];
      
      // Extract the arguments part
      const argsStart = code.indexOf('(', start) + 1;
      const argsEnd = end - 1;
      const args = code.substring(argsStart, argsEnd);
      
      // Replace the call with collection logic
      const replacement = `(__cssCollector["${callId}"] = (${args}), "${callId}")`;
      modifiedCode = modifiedCode.substring(0, start) + replacement + modifiedCode.substring(end);
    }

    try {
      // Transform the modified code using esbuild to handle TypeScript/JSX
      const result = await transform(modifiedCode, {
        loader: id.endsWith(".tsx")
          ? "tsx"
          : id.endsWith(".ts")
          ? "ts"
          : id.endsWith(".jsx")
          ? "jsx"
          : "js",
        target: "es2020",
        format: "cjs",
        platform: "node",
      });

      // Execute the transformed code in a VM context
      const context = vm.createContext({
        __cssCollector: {},
        console: console, // Allow console for debugging
        module: { exports: {} }, // Provide module for CommonJS
        exports: {}, // Provide exports
        require: () => ({}), // Provide a dummy require function
        global: {}, // Provide global object
        // Add React-like globals to prevent errors
        React: {},
        useState: () => [null, () => {}],
        // Add other globals if needed
      });

      // Execute the code
      vm.runInContext(result.code, context);
      const collector = context.__cssCollector;

      // Now transform the original code with the resolved values
      let transformedCode = code;
      for (let i = cssCallPositions.length - 1; i >= 0; i--) {
        const { start, end, callId } = cssCallPositions[i];
        const resolvedStyles = collector[callId];
        
        if (resolvedStyles && typeof resolvedStyles === 'object') {
          const className = generateClassName();
          cssRulesForFile[className] = resolvedStyles;
          
          // Replace the css() call with the class name
          transformedCode = transformedCode.substring(0, start) + `"${className}"` + transformedCode.substring(end);
        }
      }

      // Validate the transformed code
      if (transformedCode !== code) {
        try {
          await transform(transformedCode, {
            loader: id.endsWith(".tsx")
              ? "tsx"
              : id.endsWith(".ts")
              ? "ts"
              : "jsx",
            target: "es2020",
            format: "esm",
            sourcemap: false,
          });
        } catch (error) {
          console.warn(`Failed to validate transformed code for ${id}:`, error);
          return { code };
        }
      }

      return { code: transformedCode, cssRules: cssRulesForFile };

    } catch (error) {
      console.warn(`Failed to evaluate code for ${id}:`, error);
      return { code };
    }

  } catch (error) {
    console.warn(`Failed to parse ${id}:`, error);
    return { code };
  }
}

export default function cssInJsPlugin(options: PluginOptions = {}): Plugin {
  const {
    functionName = "css",
    classNamePrefix = "css-",
    cssOutputPath = "generated-styles.css",
  } = options;

  const allCssRules: Record<string, StyleObject> = {};

  return {
    name: "vite-css-in-js-plugin",

    async transform(code, id) {
      const { code: transformedCode, cssRules: cssRulesForFile } =
        await transformCode(code, id, options);

      if (cssRulesForFile != null) {
        for (const [className, content] of Object.entries(cssRulesForFile)) {
          allCssRules[className] = content;
        }
      }

      return transformedCode !== code ? transformedCode : null;
    },

    generateBundle() {
      const cssContent = rulesToString(allCssRules);

      // Emit the CSS file as an asset that will be included in the bundle
      this.emitFile({
        type: "asset",
        fileName: cssOutputPath,
        source: cssContent,
      });
    },

    writeBundle() {
      // This hook ensures the CSS file is written to the output directory
      // The file is already emitted in generateBundle, this just ensures it's written
    },

    transformIndexHtml(html) {
      // Add CSS link to the HTML head if CSS rules were generated
      return html.replace(
        "</head>",
        `  <link rel="stylesheet" href="/${cssOutputPath}">\n  </head>`
      );
    },
  };
}
