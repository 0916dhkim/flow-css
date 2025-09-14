import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'

export const Route = createFileRoute('/_pathlessLayout/_nested-layout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div>
      <div>I'm a nested layout</div>
      <div className={css({
        display: "flex",
        gap: "0.5rem",
        borderBottom: "1px solid #e5e7eb",
      })}>
        <Link
          to="/route-a"
          activeProps={{
            className: css({
              fontWeight: "bold",
            }),
          }}
        >
          Go to route A
        </Link>
        <Link
          to="/route-b"
          activeProps={{
            className: css({
              fontWeight: "bold",
            }),
          }}
        >
          Go to route B
        </Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
