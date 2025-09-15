import { createFileRoute } from "@tanstack/react-router";
import { css } from "@flow-css/core/css";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className={css({ padding: "1rem", backgroundColor: "lightblue" })}>
      <h3>Welcome Home!!!</h3>
    </div>
  );
}
