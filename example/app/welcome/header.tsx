import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { css } from "../../../dist/css";

export function Header() {
  return (
    <header
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.25rem",
        border: "1px solid red",
      })}
    >
      <div
        className={css({
          width: "500px",
          maxWidth: "100vw",
          padding: "1rem",
        })}
      >
        <img
          src={logoLight}
          alt="React Router"
          className={css({
            display: "block",
            width: "100%",
          })}
        />
        <img
          src={logoDark}
          alt="React Router"
          className={css({
            display: "none",
            width: "100%",
          })}
        />
      </div>
    </header>
  );
}
