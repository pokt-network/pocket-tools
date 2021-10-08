import { globalCss } from "./stitches-config";

export const globalStyles = globalCss({
  "*": {
    boxSizing: "border-box",
  },
  "*::before": {
    boxSizing: "border-box",
  },
  "*::after": {
    boxSizing: "border-box",
  },
  html: {
    overflowY: "scroll",
  },
  body: {
    backgroundColor: 'rgb(17, 17, 17)',
    backgroundImage: "radial-gradient(#333 1px,transparent 0), radial-gradient(#333 1px,transparent 0)",
    backgroundPosition: '0 0, 25px 25px',
    backgroundSize: '50px 50px',
    color: "#ccc",
    font: '16px/1.5 "Source Serif Pro", serif',
    margin: 0,
    minWidth: "720px",
    position: "relative",
  },
  a: {
    color: "inherit",
  },
  "button, .button": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    padding: "1px 6px 0px",
    font: "inherit",
    fontSize: 15,
    textTransform: "lowercase",
    whiteSpace: "nowrap",
    textDecoration: "none",
    color: "#ccc",
    background: "#000",
    border: "2px solid",
    borderColor: "#fff #888 #888 #fff",
    cursor: "pointer",
    outline: 0,
  },
  "button:active:not(:disabled), .button:active:not(:disabled)": {
    border: "2px solid",
    borderColor: "#888 #fff #fff #888",
  },
  "button:disabled, .button:disabled": {
    color: "#aaa",
    borderColor: "#888",
    cursor: "default",
  },
  "button:focus-visible, .button:focus-visible": {
    outline: 0,
    borderColor: "#fff",
  },
});
