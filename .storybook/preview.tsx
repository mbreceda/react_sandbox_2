import React from "react";
import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { fn } from "@storybook/test";
import { ThemeProvider } from "styled-components";

import { breakpoints } from "../src/styles/breakpoints";
import { lightTheme, darkTheme } from "../src/styles/theme";
import { GlobalStyle } from "../src/styles/GlobalStyle";
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
    viewport: {
      defaultViewport: "responsive",
      viewports: { ...responsiveBreakpoints, ...INITIAL_VIEWPORTS },
    },
  },
};

// Define decorators directly in the preview file
export const decorators = [
  (StoryFn, context) => {
    // Get theme selection from globals or default to light
    const themeMode = context.globals.theme || "light";
    const theme = themeMode === "dark" ? darkTheme : lightTheme;

    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <StoryFn />
      </ThemeProvider>
    );
  },
];

// Global types configuration for the toolbar
export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light", icon: "sun" },
        { value: "dark", title: "Dark", icon: "moon" },
      ],
      showName: true,
    },
  },
};

export default preview;
