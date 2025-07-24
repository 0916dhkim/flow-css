import { css } from "my-library";

// Simple example with css() calls
const buttonStyle = css({
  padding: 12,
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  backgroundColor: "var(--primary-color)",
});

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 20,
});

// Example with nested function calls
function createStyles() {
  return {
    container: css({
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }),
    button: css({
      padding: 12,
      borderRadius: 6,
      border: "none",
      cursor: "pointer",
    }),
  };
}

// Example with conditional styles
function getDynamicStyles(isActive: boolean) {
  return css({
    color: isActive ? "green" : "red",
    fontSize: 16,
    fontWeight: isActive ? "bold" : "normal",
  });
}
