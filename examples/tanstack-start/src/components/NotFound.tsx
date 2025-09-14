import { Link } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'

export function NotFound({ children }: { children?: any }) {
  return (
    <div className={css({
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      padding: "0.5rem",
    })}>
      <div className={css({
        color: "#6b7280",
        "@media (prefers-color-scheme: dark)": {
          color: "#9ca3af",
        },
      })}>
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <p className={css({
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexWrap: "wrap",
      })}>
        <button
          onClick={() => window.history.back()}
          className={css({
            backgroundColor: "#10b981",
            color: "white",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
            borderRadius: "0.25rem",
            textTransform: "uppercase",
            fontWeight: "900",
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
          })}
        >
          Go back
        </button>
        <Link
          to="/"
          className={css({
            backgroundColor: "#0891b2",
            color: "white",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
            borderRadius: "0.25rem",
            textTransform: "uppercase",
            fontWeight: "900",
            fontSize: "0.875rem",
            textDecoration: "none",
          })}
        >
          Start Over
        </Link>
      </p>
    </div>
  )
}
