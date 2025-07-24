import { test } from "node:test";
import assert from "node:assert";
import { transformCode } from "../dist/index.js";

// Test case 1: Simulated import from a theme file
test("handles css() call with imported theme colors", async () => {
  const input = `
// Simulating: import { theme } from './theme';
const theme = {
  colors: {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745"
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24
  }
};

const buttonStyles = css({
  backgroundColor: theme.colors.primary,
  color: "white",
  padding: theme.spacing.md,
  margin: theme.spacing.sm
});
`;
  
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].backgroundColor, "#007bff");
  assert.equal(cssRules[className].color, "white");
  assert.equal(cssRules[className].padding, 16);
  assert.equal(cssRules[className].margin, 8);
});

// Test case 2: Simulated named imports
test("handles css() call with named imports", async () => {
  const input = `
// Simulating: import { PRIMARY_COLOR, FONT_SIZE } from './constants';
const PRIMARY_COLOR = "#ff6b6b";
const FONT_SIZE = 18;
const BORDER_RADIUS = 4;

const cardStyles = css({
  color: PRIMARY_COLOR,
  fontSize: FONT_SIZE,
  borderRadius: BORDER_RADIUS,
  border: \`1px solid \${PRIMARY_COLOR}\`
});
`;
  
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].color, "#ff6b6b");
  assert.equal(cssRules[className].fontSize, 18);
  assert.equal(cssRules[className].borderRadius, 4);
  assert.equal(cssRules[className].border, "1px solid #ff6b6b");
});

// Test case 3: Simulated default import
test("handles css() call with default import", async () => {
  const input = `
// Simulating: import colors from './colors';
const colors = {
  brand: "#4f46e5",
  text: "#1f2937",
  background: "#f9fafb"
};

const headerStyles = css({
  backgroundColor: colors.brand,
  color: colors.background,
  borderBottom: \`2px solid \${colors.text}\`
});
`;
  
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].backgroundColor, "#4f46e5");
  assert.equal(cssRules[className].color, "#f9fafb");
  assert.equal(cssRules[className].borderBottom, "2px solid #1f2937");
});

// Test case 4: Mixed imports and local constants
test("handles css() call mixing imported and local values", async () => {
  const input = `
// Simulating imports
const BRAND_COLOR = "#e11d48";
const spacing = { xs: 4, sm: 8, md: 16 };

// Local constants
const LOCAL_SHADOW = "0 2px 4px rgba(0,0,0,0.1)";
const isRounded = true;

const mixedStyles = css({
  color: BRAND_COLOR,
  padding: spacing.md,
  margin: spacing.sm,
  boxShadow: LOCAL_SHADOW,
  borderRadius: isRounded ? 8 : 0
});
`;
  
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].color, "#e11d48");
  assert.equal(cssRules[className].padding, 16);
  assert.equal(cssRules[className].margin, 8);
  assert.equal(cssRules[className].boxShadow, "0 2px 4px rgba(0,0,0,0.1)");
  assert.equal(cssRules[className].borderRadius, 8);
});

// Test case 5: Nested object access from imports
test("handles css() call with deeply nested imported values", async () => {
  const input = `
// Simulating: import { designSystem } from './design-system';
const designSystem = {
  tokens: {
    colors: {
      semantic: {
        error: "#dc2626",
        warning: "#f59e0b",
        success: "#10b981"
      }
    },
    typography: {
      sizes: {
        body: 16,
        caption: 14,
        heading: 24
      }
    }
  }
};

const alertStyles = css({
  color: designSystem.tokens.colors.semantic.error,
  fontSize: designSystem.tokens.typography.sizes.body,
  padding: 12
});
`;
  
  const { code, cssRules } = await transformCode(input, "test.ts");
  
  const match = code.match(/css-[a-z0-9]{6}/);
  assert(match, "No class name found");
  const className = match[0];
  
  assert(cssRules?.[className]);
  assert.equal(cssRules[className].color, "#dc2626");
  assert.equal(cssRules[className].fontSize, 16);
  assert.equal(cssRules[className].padding, 12);
});