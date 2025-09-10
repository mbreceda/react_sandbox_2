import { ThemeProvider } from "styled-components";
import { Decorator } from "@storybook/react";
import { GlobalStyle } from "../src/styles/GlobalStyle";
import { lightTheme, darkTheme } from "../src/styles/theme";

// Creates a decorator that allows theme switching in Storybook
const wrapperTheme: Decorator = (StoryFn, context) => {
  // Use dark mode if background is set to dark in Storybook controls
  const isDarkMode = context.globals.backgrounds?.value === "#333333";
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <StoryFn />
    </ThemeProvider>
  );
};

export const globalDecorators = [wrapperTheme];
