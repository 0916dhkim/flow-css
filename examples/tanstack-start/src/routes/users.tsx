import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { css } from "@flow-css/core/css";
import type { User } from "../utils/users";

export const Route = createFileRoute("/users")({
  loader: async () => {
    const res = await fetch("/api/users");

    if (!res.ok) {
      throw new Error("Unexpected status code");
    }

    const data = (await res.json()) as Array<User>;

    return data;
  },
  component: UsersComponent,
});

function UsersComponent() {
  const users = Route.useLoaderData();

  return (
    <div
      className={css({
        padding: "0.5rem",
        display: "flex",
        gap: "0.5rem",
      })}
    >
      <ul
        className={css({
          listStyleType: "disc",
          paddingLeft: "1rem",
        })}
      >
        {[
          ...users,
          { id: "i-do-not-exist", name: "Non-existent User", email: "" },
        ].map((user) => {
          return (
            <li
              key={user.id}
              className={css({
                whiteSpace: "nowrap",
              })}
            >
              <Link
                to="/users/$userId"
                params={{
                  userId: String(user.id),
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
                activeProps={{
                  className: css({
                    color: "#000",
                    fontWeight: "bold",
                  }),
                }}
              >
                <div>{user.name}</div>
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
