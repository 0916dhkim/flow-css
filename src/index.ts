import type { Plugin } from "vite";
import { transform } from "esbuild";
import { styleToString } from "./style-to-string";
import { StyleObject } from "./style-object";

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

    // Use a more robust approach to find and replace css() calls
    const functionNameRegex = new RegExp(`\\b${functionName}\\s*\\(`, "g");
    let transformedCode = code;
    let match;

    // Process all matches from end to beginning to avoid index shifting
    const matches: { start: number; end: number; objectContent: string }[] = [];

    while ((match = functionNameRegex.exec(code)) !== null) {
      const start = match.index;
      const functionStart = start + match[0].length;

      // Find the matching closing parenthesis, handling nested structures
      let depth = 1;
      let i = functionStart;
      let objectStart = -1;
      let objectEnd = -1;
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
          } else if (char === "{" && objectStart === -1) {
            objectStart = i;
          } else if (char === "}" && objectStart !== -1 && objectEnd === -1) {
            objectEnd = i;
          }
        }

        i++;
      }

      if (depth === 0 && objectStart !== -1 && objectEnd !== -1) {
        const objectContent = code.substring(objectStart, objectEnd + 1);
        matches.push({
          start,
          end: i,
          objectContent,
        });
      }
    }

    // Process matches in reverse order to avoid index shifting
    for (let i = matches.length - 1; i >= 0; i--) {
      const { start, end, objectContent } = matches[i];
      const className = generateClassName();
      // objectContent is a JS object string, not JSON. Use Function constructor to evaluate safely.
      cssRulesForFile[className] = (0, eval)(`(${objectContent})`);

      // Replace the function call with the class name
      transformedCode =
        transformedCode.substring(0, start) +
        `"${className}"` +
        transformedCode.substring(end);
    }

    // Only validate if we actually made changes
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
