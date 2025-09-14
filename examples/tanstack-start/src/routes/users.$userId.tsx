import { createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'
import { NotFound } from 'src/components/NotFound'
import { UserErrorComponent } from 'src/components/UserError'

export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params: { userId } }) => {
    try {
      const res = await fetch('/api/users/' + userId)
      if (!res.ok) {
        throw new Error('Unexpected status code')
      }

      const data = await res.json()

      return data
    } catch {
      throw new Error('Failed to fetch user')
    }
  },
  errorComponent: UserErrorComponent,
  component: UserComponent,
  notFoundComponent: () => {
    return <NotFound>User not found</NotFound>
  },
})

function UserComponent() {
  const user = Route.useLoaderData()

  return (
    <div className={css({
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    })}>
      <h4 className={css({
        fontSize: "1.25rem",
        fontWeight: "bold",
        textDecoration: "underline",
      })}>{user.name}</h4>
      <div className={css({
        fontSize: "0.875rem",
      })}>{user.email}</div>
      <div>
        <a
          href={`/api/users/${user.id}`}
          className={css({
            color: "#1e40af",
            textDecoration: "underline",
            "&:hover": {
              color: "#2563eb",
            },
          })}
        >
          View as JSON
        </a>
      </div>
    </div>
  )
}
