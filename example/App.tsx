import { css } from "./src/my-library.js";
import { useState } from "react";

function MyComponent() {
  const [state, setState] = useState(1);

  const handleClick = () => {
    setState(state + 1);
  };

  return (
    <div
      className={css({
        color: "red",
        fontSize: "16px",
        padding: "20px",
        backgroundColor: "var(--bg-color)",
      })}
      onClick={handleClick}
    >
      <h1
        className={css({
          margin: 0,
          color: "blue",
        })}
      >
        Counter: {state}
      </h1>
      <p
        className={css({
          fontSize: "14px",
          opacity: 0.8,
        })}
      >
        Click to increment
      </p>
    </div>
  );
}

export default MyComponent;
