import { test } from "node:test";
import assert from "node:assert";
import { transformCode } from "../dist/index.js";

// Real-world test using static CSS calls that the plugin handles well
test("transforms static css() calls in real-world code", async () => {
  const appContent = `
import { css } from "./src/my-library.js";

// Theme constants
const COLORS = {
  primary: "#007bff",
  text: "#333",
  background: "#f8f9fa"
};

const SPACING = {
  small: 8,
  medium: 16,
  large: 24
};

// Static CSS styles that can be resolved at build time
const headerStyles = css({
  backgroundColor: COLORS.primary,
  color: "white",
  padding: SPACING.medium,
  fontSize: 18
});

const cardStyles = css({
  backgroundColor: COLORS.background,
  border: \`1px solid \${COLORS.text}\`,
  borderRadius: 4,
  padding: SPACING.large,
  margin: SPACING.small
});

const buttonStyles = css({
  backgroundColor: COLORS.primary,
  color: "white",
  padding: \`\${SPACING.small}px \${SPACING.medium}px\`,
  border: "none",
  borderRadius: 3,
  cursor: "pointer"
});

export { headerStyles, cardStyles, buttonStyles };
`;

  const { code, cssRules } = await transformCode(appContent, "styles.ts");

  // Check that css() calls were replaced with class names
  const classNames = code.match(/css-[a-z0-9]{6}/g);
  assert(classNames && classNames.length === 3, "Should find exactly 3 css() calls transformed");
  assert(!code.includes("css({"), "No css() calls should remain in the code");

  // Check that CSS rules were generated and contain expected values
  const allRules = Object.values(cssRules ?? {});
  assert.equal(allRules.length, 3, "Should have 3 CSS rules");

  // Verify specific style values
  const backgroundColors = allRules.map((rule: any) => rule.backgroundColor).filter(Boolean);
  assert(backgroundColors.includes("#007bff"), "Should include primary color");
  assert(backgroundColors.includes("#f8f9fa"), "Should include background color");

  const paddings = allRules.map((rule: any) => rule.padding).filter(Boolean);
  assert(paddings.includes(16), "Should include medium spacing");
  assert(paddings.includes(24), "Should include large spacing");
  assert(paddings.includes("8px 16px"), "Should include computed padding string");

  // Check that all class names are unique
  const uniqueClassNames = new Set(classNames);
  assert.equal(
    classNames.length,
    uniqueClassNames.size,
    "All class names should be unique"
  );

  console.log("✅ Real-world static CSS transformation test passed!");
  console.log("Generated CSS rules:", Object.keys(cssRules || {}));
});

// Test with component that has static styles (documenting current limitation)
test("css() calls inside components remain unchanged (current limitation)", async () => {
  const componentContent = `
import { css } from "./src/my-library.js";
import { useState } from "react";

const THEME_COLOR = "#ff6b6b";

function MyComponent() {
  const [state, setState] = useState(1);

  // These css() calls are inside a component function
  // Currently not transformed - this is a known limitation
  const dynamicStyle = css({
    color: THEME_COLOR,
    opacity: state > 0 ? 1 : 0.5
  });

  return (
    <div className={dynamicStyle}>
      Component content
    </div>
  );
}

export default MyComponent;
`;

  const { code, cssRules } = await transformCode(componentContent, "Component.tsx");

  // CSS calls inside components are not currently transformed
  assert(code.includes("css({"), "CSS calls inside components should remain unchanged");
  assert.equal(Object.keys(cssRules || {}).length, 0, "No CSS rules should be generated for component-scoped calls");

  console.log("✅ Component limitation test passed - behavior documented");
});
