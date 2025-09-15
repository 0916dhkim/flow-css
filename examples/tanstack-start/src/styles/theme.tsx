const APP_THEME = {
  spacing: (n: number) => `${n * 0.25}rem`,
  colors: {
    blue600: "#2563eb",
    blue800: "#1e40af",
    black: "#000",
  },
} as const;

type AppTheme = typeof APP_THEME;

declare global {
  namespace FlowCss {
    interface Theme extends AppTheme {}
  }
}

export default APP_THEME;
