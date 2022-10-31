import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "../App";

afterEach(() => {
  cleanup();
});

test("loads and data fetching works", async () => {
  render(<App />);

  // Click the search
  userEvent.click(screen.getByText("Søg"));
  expect(screen.getByRole("button")).toBeDisabled();

  // Check if there is a result
  await screen.findByText("RESULTAT");
  expect(screen.getByTestId("result")).toBeInTheDocument();
  expect(
    screen.queryByText("Der opstod en fejl, prøv igen")
  ).not.toBeInTheDocument();

  // Reset the result
  expect(screen.getByText("Nulstil")).toBeInTheDocument();
  userEvent.click(screen.getByText("Nulstil"));
  expect(screen.getByRole("button")).toBeEnabled();
});
