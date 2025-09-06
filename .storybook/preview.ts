import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import "../src/index.css";
import { fn } from "@storybook/test";

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
      viewports: INITIAL_VIEWPORTS,
    },
  },
};

export default preview;
