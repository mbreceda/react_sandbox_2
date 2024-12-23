import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "../App"; // Adjust the import path as necessary

describe("App", () => {
  it("renders correctly", () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
