import { useState } from "react";
import clsx from "clsx";
import { css } from "@flow-css/core/css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className={Styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className={clsx(
              Styles.logo,
              "react",
              css({
                "@media (prefers-reduced-motion: no-preference)": {
                  "&:hover": {
                    animation: "logo-spin infinite 20s linear",
                  },
                },
              })
            )}
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={css((t) => ({ padding: t.spacing(8) }))}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={css((t) => ({ color: t.colors.textSecondary }))}>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

const Styles = {
  logo: css({
    height: "6em",
    padding: "1.5em",
    willChange: "filter",
    transition: "filter 300ms",
    "&:hover": {
      filter: "drop-shadow(0 0 2em #646cffaa)",
    },
    "&.react:hover": {
      filter: "drop-shadow(0 0 2em #61dafbaa)",
    },
  }),
};
