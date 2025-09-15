import { Link, createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'
import { fetchPost } from '../utils/posts'
import { PostErrorComponent } from '~/components/PostError'

export const Route = createFileRoute('/posts_/$postId/deep')({
  loader: async ({ params: { postId } }) =>
    fetchPost({
      data: postId,
    }),
  errorComponent: PostErrorComponent,
  component: PostDeepComponent,
})

function PostDeepComponent() {
  const post = Route.useLoaderData()

  return (
    <div className={css({
      padding: "0.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    })}>
      <Link
        to="/posts"
        className={css({
          display: "block",
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
          color: "#1e40af",
          "&:hover": {
            color: "#2563eb",
          },
        })}
      >
        ← All Posts
      </Link>
      <h4 className={css({
        fontSize: "1.25rem",
        fontWeight: "bold",
        textDecoration: "underline",
      })}>{post.title}</h4>
      <div className={css({
        fontSize: "0.875rem",
      })}>{post.body}</div>
    </div>
  )
}
