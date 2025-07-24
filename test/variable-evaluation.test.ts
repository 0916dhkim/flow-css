import { test } from "node:test";
import assert from "node:assert";
import { transformCode } from "../dist/index.js";

// Test case 1: Using a constant variable
test("handles css() call with constant variable", async () => {
  const input = `
const BACKGROUND_COLOR = "red";
const className = css({ background: BACKGROUND_COLOR });
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  // Should find the css call and replace it with a class name
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  // Should have the resolved value
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].background, "red");
  
  // Original css call should be replaced
  assert(!code.includes("css({"));
});

// Test case 2: CSS calls inside functions (currently not supported - documents limitation)
test("css() calls inside functions are not transformed (current limitation)", async () => {
  const input = `
const BACKGROUND_COLOR = "red";
function outer() {
  const className = css({ background: BACKGROUND_COLOR });
  return className;
}
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  // Currently, css calls inside functions are not transformed
  // This is a known limitation - the plugin focuses on top-level calls
  assert(code.includes("css({"), "CSS call inside function should remain unchanged");
  assert.equal(Object.keys(cssRules || {}).length, 0, "No CSS rules should be generated");
});

// Test case 3: Multiple variables and complex object
test("handles css() call with multiple variables", async () => {
  const input = `
const PRIMARY_COLOR = "blue";
const FONT_SIZE = 16;
const PADDING = 20;
const styles = css({ 
  color: PRIMARY_COLOR,
  fontSize: FONT_SIZE,
  padding: PADDING
});
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].color, "blue");
  assert.equal(cssRules[className].fontSize, 16);
  assert.equal(cssRules[className].padding, 20);
});

// Test case 4: Using imported constant (simulated)
test("handles css() call with imported constant", async () => {
  const input = `
// Simulate an import by defining the constant
const THEME_COLORS = { primary: "green", secondary: "orange" };
const className = css({ 
  color: THEME_COLORS.primary,
  borderColor: THEME_COLORS.secondary
});
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].color, "green");
  assert.equal(cssRules[className].borderColor, "orange");
});

// Test case 5: Computed values
test("handles css() call with computed values", async () => {
  const input = `
const BASE_SIZE = 8;
const MULTIPLIER = 2;
const className = css({ 
  padding: BASE_SIZE * MULTIPLIER,
  margin: BASE_SIZE + 4
});
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].padding, 16);
  assert.equal(cssRules[className].margin, 12);
});

// Test case 6: React component context (currently not supported - documents limitation)
test("css() calls in React components are not transformed (current limitation)", async () => {
  const input = `
const PRIMARY_COLOR = "purple";
function MyComponent() {
  const isActive = true;
  const className = css({ 
    color: PRIMARY_COLOR,
    opacity: isActive ? 1 : 0.5
  });
  return className;
}
`;
  const { code, cssRules } = await transformCode(input, "test.tsx");
  
  // Currently, css calls inside React components are not transformed
  // This is a known limitation - executing React components at build time is complex
  assert(code.includes("css({"), "CSS call inside React component should remain unchanged");
  assert.equal(Object.keys(cssRules || {}).length, 0, "No CSS rules should be generated");
});

// Test case 7: Multiple css() calls with different variables
test("handles multiple css() calls with different variables", async () => {
  const input = `
const RED = "red";
const BLUE = "blue";
const headerClass = css({ color: RED });
const bodyClass = css({ color: BLUE });
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const classNames = code.match(/css-[a-z0-9]{6}/g);
  assert(classNames && classNames.length === 2, "Should find exactly 2 class names");
  
  // Check that we have both colors in the CSS rules
  const colors = Object.values(cssRules ?? {}).map((rule: any) => rule.color);
  assert(colors.includes("red"));
  assert(colors.includes("blue"));
});

// Test case 8: Template literals with variables
test("handles css() call with template literals", async () => {
  const input = `
const PRIMARY_COLOR = "#ff6b6b";
const BORDER_WIDTH = 2;
const className = css({ 
  color: PRIMARY_COLOR,
  border: \`\${BORDER_WIDTH}px solid \${PRIMARY_COLOR}\`
});
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].color, "#ff6b6b");
  assert.equal(cssRules[className].border, "2px solid #ff6b6b");
});

// Test case 9: Fallback for unsupported cases (should not crash)
test("handles unsupported cases gracefully", async () => {
  const input = `
function getColor() { return "dynamic"; }
const className = css({ color: getColor() });
`;
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  // Should not crash, but may not transform the call if it can't evaluate it
  // The exact behavior depends on implementation - it should either transform with the resolved value
  // or leave the original code unchanged
  assert(typeof code === "string");
});