import type { Plugin } from "vite";
import { transform } from "esbuild";

interface CSSRule {
  className: string;
  properties: Record<string, string>;
}

interface PluginOptions {
  functionName?: string;
  classNamePrefix?: string;
  cssOutputPath?: string;
}

export async function transformCode(
  code: string,
  id: string,
  options: PluginOptions = {}
): Promise<{ code: string; css: string }> {
  const { functionName = "css", classNamePrefix = "css-" } = options;

  const generateClassName = (): string => {
    const hash = Math.random().toString(36).substring(2, 8);
    return `${classNamePrefix}${hash}`;
  };

  const extractCSSProperties = (
    objectString: string
  ): Record<string, string> => {
    const properties: Record<string, string> = {};

    try {
      // Remove outer braces and parse as JSON-like object
      const cleanObject = objectString.trim().replace(/^\{|\}$/g, "");

      // Split by comma, but be careful with nested objects and strings
      const pairs: string[] = [];
      let current = "";
      let depth = 0;
      let inString = false;
      let stringChar = "";

      for (let i = 0; i < cleanObject.length; i++) {
        const char = cleanObject[i];

        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar) {
          inString = false;
          stringChar = "";
        } else if (!inString) {
          if (char === "{" || char === "(") {
            depth++;
          } else if (char === "}" || char === ")") {
            depth--;
          } else if (char === "," && depth === 0) {
            pairs.push(current.trim());
            current = "";
            continue;
          }
        }

        current += char;
      }

      if (current.trim()) {
        pairs.push(current.trim());
      }

      for (const pair of pairs) {
        if (!pair) continue;

        const colonIndex = pair.indexOf(":");
        if (colonIndex === -1) continue;

        let key = pair.substring(0, colonIndex).trim();
        let value = pair.substring(colonIndex + 1).trim();

        // Remove quotes from key if present
        if (
          (key.startsWith('"') && key.endsWith('"')) ||
          (key.startsWith("'") && key.endsWith("'"))
        ) {
          key = key.slice(1, -1);
        }

        // Remove quotes from value if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Handle numeric values (add px)
        if (/^\d+$/.test(value)) {
          value = `${value}px`;
        }

        properties[key] = value;
      }
    } catch (error) {
      console.warn("Failed to parse CSS object:", objectString, error);
    }

    return properties;
  };

  const generateCSS = (rules: CSSRule[]): string => {
    return rules
      .map((rule) => {
        const properties = Object.entries(rule.properties)
          .map(([key, value]) => `  ${key}: ${value};`)
          .join("\n");
        return `.${rule.className} {\n${properties}\n}`;
      })
      .join("\n\n");
  };

  if (
    !id.endsWith(".tsx") &&
    !id.endsWith(".ts") &&
    !id.endsWith(".jsx") &&
    !id.endsWith(".js")
  ) {
    return { code, css: "" };
  }

  try {
    const cssRulesForFile: CSSRule[] = [];

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
        const objectContent = code.substring(objectStart + 1, objectEnd);
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
      const properties = extractCSSProperties(objectContent);
      cssRulesForFile.push({ className, properties });

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
        return { code, css: "" };
      }
    }

    const css = generateCSS(cssRulesForFile);
    return { code: transformedCode, css };
  } catch (error) {
    console.warn(`Failed to parse ${id}:`, error);
    return { code, css: "" };
  }
}

export default function cssInJsPlugin(options: PluginOptions = {}): Plugin {
  const {
    functionName = "css",
    classNamePrefix = "css-",
    cssOutputPath = "generated-styles.css",
  } = options;

  const cssRules: CSSRule[] = [];

  const generateCSS = (rules: CSSRule[]): string => {
    return rules
      .map((rule) => {
        const properties = Object.entries(rule.properties)
          .map(([key, value]) => `  ${key}: ${value};`)
          .join("\n");
        return `.${rule.className} {\n${properties}\n}`;
      })
      .join("\n\n");
  };

  return {
    name: "vite-css-in-js-plugin",

    async transform(code, id) {
      const { code: transformedCode, css } = await transformCode(
        code,
        id,
        options
      );

      if (css) {
        // Parse the CSS rules from the generated CSS string
        const rules = css.split("\n\n").map((rule) => {
          const className = rule.match(/\.([^ {]+)/)?.[1] || "";
          const properties: Record<string, string> = {};

          rule.split("\n").forEach((line) => {
            const match = line.match(/\s+([^:]+):\s*([^;]+);/);
            if (match) {
              properties[match[1].trim()] = match[2].trim();
            }
          });

          return { className, properties };
        });

        // Add unique rules to the global cssRules array
        rules.forEach((rule) => {
          const existingIndex = cssRules.findIndex(
            (existing) => existing.className === rule.className
          );
          if (existingIndex === -1) {
            cssRules.push(rule);
          } else {
            // Update existing rule with merged properties
            cssRules[existingIndex] = {
              ...cssRules[existingIndex],
              properties: {
                ...cssRules[existingIndex].properties,
                ...rule.properties,
              },
            };
          }
        });
      }

      return transformedCode !== code ? transformedCode : null;
    },

    generateBundle() {
      if (cssRules.length > 0) {
        const cssContent = generateCSS(cssRules);

        // Emit the CSS file as an asset that will be included in the bundle
        this.emitFile({
          type: "asset",
          fileName: cssOutputPath,
          source: cssContent,
        });
      }
    },

    writeBundle() {
      // This hook ensures the CSS file is written to the output directory
      // The file is already emitted in generateBundle, this just ensures it's written
    },

    transformIndexHtml(html) {
      // Add CSS link to the HTML head if CSS rules were generated
      if (cssRules.length > 0) {
        return html.replace(
          "</head>",
          `  <link rel="stylesheet" href="/${cssOutputPath}">\n  </head>`
        );
      }
      return html;
    },
  };
}
