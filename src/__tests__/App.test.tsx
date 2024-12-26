import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App"; // Adjust the import path as necessary
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { vi } from "vitest";

const mokedData = {
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
    },
    {
      name: "ivysaur",
      url: "https://pokeapi.co/api/v2/pokemon/2/",
    },
  ],
};

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useQuery: vi.fn(() => ({
      data: mokedData,
      isFetching: false,
      error: null,
    })),
  };
});

const queryClient = new QueryClient();

describe("App", () => {
  it("renders correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
    expect(screen.getByText(/ivysaur/i)).toBeInTheDocument();
  });
});
