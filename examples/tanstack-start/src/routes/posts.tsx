import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'
import { fetchPosts } from '../utils/posts'

export const Route = createFileRoute('/posts')({
  loader: async () => fetchPosts(),
  component: PostsComponent,
})

function PostsComponent() {
  const posts = Route.useLoaderData()

  return (
    <div className={css({
      padding: "0.5rem",
      display: "flex",
      gap: "0.5rem",
    })}>
      <ul className={css({
        listStyleType: "disc",
        paddingLeft: "1rem",
      })}>
        {[...posts, { id: 'i-do-not-exist', title: 'Non-existent Post' }].map(
          (post) => {
            return (
              <li key={post.id} className={css({
                whiteSpace: "nowrap",
              })}>
                <Link
                  to="/posts/$postId"
                  params={{
                    postId: post.id,
                  }}
                  className={css({
                    display: "block",
                    paddingTop: "0.25rem",
                    paddingBottom: "0.25rem",
                    color: "#1e40af",
                    "&:hover": {
                      color: "#2563eb",
                    },
                  })}
                  activeProps={{ className: css({
                    color: "#000",
                    fontWeight: "bold",
                  }) }}
                >
                  <div>{post.title.substring(0, 20)}</div>
                </Link>
              </li>
            )
          },
        )}
      </ul>
      <hr />
      <Outlet />
    </div>
  )
}
