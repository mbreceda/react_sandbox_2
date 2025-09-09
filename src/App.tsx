import React from "react";
import useDarkMode from "use-dark-mode";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";

export default function App() {
  const { value } = useDarkMode(false);
  const theme = value ? darkTheme : lightTheme;
  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        This is the Main App
      </ThemeProvider>
    </>
  );
}
