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
      const pairs = cleanObject.split(",").map((pair) => pair.trim());

      for (const pair of pairs) {
        if (!pair) continue;

        const colonIndex = pair.indexOf(":");
        if (colonIndex === -1) continue;

        const key = pair.substring(0, colonIndex).trim();
        let value = pair.substring(colonIndex + 1).trim();

        // Remove quotes if present
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
    const lines = code.split("\n");
    const newLines: string[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Look for css() function calls in this line
      const functionNameRegex = new RegExp(`\\b${functionName}\\s*\\(`, "g");
      let match;
      let lastIndex = 0;
      let newLine = "";

      while ((match = functionNameRegex.exec(line)) !== null) {
        // Add the text before the function call
        newLine += line.substring(lastIndex, match.index);

        const start = match.index;
        const functionStart = start + match[0].length;

        // Find the matching closing parenthesis
        let depth = 0;
        let objectStart = -1;
        let objectEnd = -1;
        let i = functionStart;

        while (i < line.length) {
          const char = line[i];

          if (char === "{" && objectStart === -1) {
            objectStart = i;
            depth = 1;
          } else if (char === "{") {
            depth++;
          } else if (char === "}") {
            depth--;
            if (depth === 0) {
              objectEnd = i;
              break;
            }
          } else if (char === ")" && depth === 0) {
            // Found the closing parenthesis
            break;
          }

          i++;
        }

        if (objectStart !== -1 && objectEnd !== -1) {
          const className = generateClassName();
          const objectString = line.substring(objectStart + 1, objectEnd);
          const properties = extractCSSProperties(objectString);
          cssRulesForFile.push({ className, properties });

          // Replace the function call with the class name
          newLine += `"${className}"`;
          lastIndex = i + 1;
        } else {
          // If we can't parse it properly, keep the original
          newLine += line.substring(lastIndex, match.index + match[0].length);
          lastIndex = match.index + match[0].length;
        }
      }

      // Add the remaining text
      newLine += line.substring(lastIndex);
      newLines.push(newLine);
    }

    const transformedCode = newLines.join("\n");

    // Validate the transformed code with esbuild
    try {
      await transform(transformedCode, {
        loader: id.endsWith(".tsx") ? "tsx" : id.endsWith(".ts") ? "ts" : "js",
        target: "es2020",
        format: "esm",
        sourcemap: false,
      });
    } catch (error) {
      console.warn(`Failed to validate transformed code for ${id}:`, error);
      return { code, css: "" };
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
        cssRules.push(
          ...css.split("\n\n").map((rule) => {
            const className = rule.match(/\.([^ {]+)/)?.[1] || "";
            const properties: Record<string, string> = {};

            rule.split("\n").forEach((line) => {
              const match = line.match(/\s+([^:]+):\s*([^;]+);/);
              if (match) {
                properties[match[1].trim()] = match[2].trim();
              }
            });

            return { className, properties };
          })
        );
      }

      return transformedCode !== code ? transformedCode : null;
    },

    generateBundle() {
      if (cssRules.length > 0) {
        const cssContent = generateCSS(cssRules);
        this.emitFile({
          type: "asset",
          fileName: cssOutputPath,
          source: cssContent,
        });
      }
    },
  };
}
