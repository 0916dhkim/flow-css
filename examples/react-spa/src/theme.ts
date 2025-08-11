const APP_THEME = {
  spacing: (n: number) => `${n * 0.25}rem`,
  colors: {
    textSecondary: "#888",
  },
} as const;

type AppTheme = typeof APP_THEME;

declare global {
  namespace FlowCss {
    interface Theme extends AppTheme {}
  }
}

export default APP_THEME;
