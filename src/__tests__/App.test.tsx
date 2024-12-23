import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import App from "../App"; // Adjust the import path as necessary
import theme from "../theme"; // Adjust the import path as necessary

describe("App", () => {
  it("renders correctly", () => {
    const { container } = render(
      <ChakraProvider value={theme}>
        <App />
      </ChakraProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
