/* istanbul ignore file */
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createSystem, defaultConfig } from "@chakra-ui/react";

// import styles from "./styles";
import colors from "./foundations/colors";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors,
      fonts: {
        heading: { value: "Roboto, sans-serif" },
        body: { value: "Roboto, sans-serif" },
      },
    },
  },
});

export default system;
