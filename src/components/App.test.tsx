import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("shows default tab", async () => {
    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/Accept terms and conditions/)).toBeInTheDocument();
    });
  });

  it("loads content and changes URL when tab is changed", async () => {
    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(window.location.href).toContain("basic");
      expect(getByText(/Context/)).toBeInTheDocument();
    });

    const contextTab = getByText("Context");
    await userEvent.click(contextTab);

    await waitFor(() => {
      expect(
        getByText(/Below is the plugin context object/)
      ).toBeInTheDocument();
      expect(window.location.href).toContain("context");
    });
  });

  it("loads deeplinked tab", async () => {
    // Set the URL to the "colors" tab.
    window.history.pushState({}, "Test page", "/?examplePluginRoute=/colors");

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/Theme variable swatches/)).toBeInTheDocument();
    });
  });
});
