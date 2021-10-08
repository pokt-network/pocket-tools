import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      green: "rgb(0, 220, 130)",
      gold: "rgb(248, 183, 62)",
      pink: "rgb(255, 68, 183)",
    },
    space: {
      1: "8px",
    },
  },
});
