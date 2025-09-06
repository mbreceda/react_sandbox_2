import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { fn } from "@storybook/test";

import { breakpoints } from "../src/styles/breakpoints";
import "../src/index.css";

// Create custom viewports based on your breakpoints
const responsiveBreakpoints = Object.keys(breakpoints).reduce(
  (acc, key) => {
    acc[`breakpoint${key}`] = {
      name: `Breakpoint - ${key}`,
      styles: {
        width: `${breakpoints[key as keyof typeof breakpoints]}px`,
        height: "calc(100% - 20px)",
      },
      type: "other",
    };
    return acc;
  },
  {} as typeof INITIAL_VIEWPORTS
);

const preview: Preview = {
  parameters: {
    actions: { action: fn },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#333333" },
      ],
    },
    viewport: {
      defaultViewport: "responsive",
      viewports: { ...responsiveBreakpoints, ...INITIAL_VIEWPORTS },
    },
  },
};

export default preview;
