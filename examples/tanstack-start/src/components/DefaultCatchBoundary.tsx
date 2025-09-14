import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div className={css({
      minWidth: "0",
      flex: "1",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem",
    })}>
      <ErrorComponent error={error} />
      <div className={css({
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        flexWrap: "wrap",
      })}>
        <button
          onClick={() => {
            router.invalidate()
          }}
          className={css({
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
            backgroundColor: "#4b5563",
            borderRadius: "0.25rem",
            color: "white",
            textTransform: "uppercase",
            fontWeight: "800",
            border: "none",
            cursor: "pointer",
            "@media (prefers-color-scheme: dark)": {
              backgroundColor: "#374151",
            },
          })}
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/"
            className={css({
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
              backgroundColor: "#4b5563",
              borderRadius: "0.25rem",
              color: "white",
              textTransform: "uppercase",
              fontWeight: "800",
              textDecoration: "none",
              "@media (prefers-color-scheme: dark)": {
                backgroundColor: "#374151",
              },
            })}
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className={css({
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
              backgroundColor: "#4b5563",
              borderRadius: "0.25rem",
              color: "white",
              textTransform: "uppercase",
              fontWeight: "800",
              textDecoration: "none",
              "@media (prefers-color-scheme: dark)": {
                backgroundColor: "#374151",
              },
            })}
            onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  )
}
