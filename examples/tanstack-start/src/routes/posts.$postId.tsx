import { Link, createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'
import { fetchPost } from '../utils/posts'
import { NotFound } from '~/components/NotFound'
import { PostErrorComponent } from '~/components/PostError'

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params: { postId } }) => fetchPost({ data: postId }),
  errorComponent: PostErrorComponent,
  component: PostComponent,
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>
  },
})

function PostComponent() {
  const post = Route.useLoaderData()

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
      })}>{post.title}</h4>
      <div className={css({
        fontSize: "0.875rem",
      })}>{post.body}</div>
      <Link
        to="/posts/$postId/deep"
        params={{
          postId: post.id,
        }}
        activeProps={{ className: css({
          color: "#000",
          fontWeight: "bold",
        }) }}
        className={css({
          display: "inline-block",
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
          color: "#1e40af",
          "&:hover": {
            color: "#2563eb",
          },
        })}
      >
        Deep View
      </Link>
    </div>
  )
}
