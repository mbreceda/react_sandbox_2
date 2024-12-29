import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import Root from "../Root"; // Adjust the import path as necessary
import { ContactRecord } from "../pages/Contact";

// Mock data
const mockContacts: ContactRecord[] = [
  {
    id: 1,
    first: "John",
    last: "Doe",
    avatar: "",
    twitter: "",
    notes: "",
    favorite: false,
  },
  {
    id: 2,
    first: "Jane",
    last: "Smith",
    avatar: "",
    twitter: "",
    notes: "",
    favorite: true,
  },
];

// Mock useLoaderData
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLoaderData: () => ({ allContacts: mockContacts }),
    useSubmit: () => vi.fn(),
  };
});

describe("Root", () => {
  it("renders correctly", () => {
    const routes = [
      {
        path: "/",
        element: <Root />,
        loader: () => ({ allContacts: mockContacts }),
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    const { container } = render(<RouterProvider router={router} />);
    expect(container).toMatchSnapshot();
  });
});
