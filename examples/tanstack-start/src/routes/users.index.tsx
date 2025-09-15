import { createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'

export const Route = createFileRoute('/users/')({
  component: UsersIndexComponent,
})

function UsersIndexComponent() {
  return (
    <div>
      Select a user or{' '}
      <a
        href="/api/users"
        className={css({
          color: "#1e40af",
          textDecoration: "underline",
          "&:hover": {
            color: "#2563eb",
          },
        })}
      >
        view as JSON
      </a>
    </div>
  )
}
