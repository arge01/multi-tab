import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MultiTabProvider } from "../components/MultiTabProvider";
import { TabPanels } from "../components/TabPanels";
import { useMultiTab } from "../hooks/useMultiTab";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PageA = (_props: TabComponentProps) => (
  <div data-testid="content-a">Content A</div>
);
const PageB = (_props: TabComponentProps) => (
  <div data-testid="content-b">Content B</div>
);

const registry = createPageRegistry([
  { id: "a", label: "A", component: PageA },
  { id: "b", label: "B", component: PageB },
]);

function Harness() {
  return (
    <MultiTabProvider registry={registry}>
      <Inner />
    </MultiTabProvider>
  );
}

function Inner() {
  const { openTab } = useMultiTab();

  return (
    <div>
      <button onClick={() => openTab("a")}>Open A</button>
      <button onClick={() => openTab("b")}>Open B</button>
      <TabPanels data-testid="panels" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TabPanel / TabPanels", () => {
  it('renders a tabpanel with role="tabpanel"', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const panel = screen.getByRole("tabpanel");
    expect(panel).toBeInTheDocument();
  });

  it("tabpanel has aria-labelledby pointing to tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby");
    expect(panel.getAttribute("aria-labelledby")).toMatch(/^rmt-tab-a-/);
  });

  it("tabpanel has id matching tab aria-controls", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const panel = screen.getByRole("tabpanel");
    expect(panel.id).toMatch(/^rmt-tabpanel-a-/);
  });

  it("tabpanel has tabIndex=0 for focusability", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("tabindex", "0");
  });

  it("inactive panels are hidden but stay in DOM", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    // B is active, so A's panel should be hidden
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels).toHaveLength(2);

    // The hidden one
    const hiddenPanel = panels.find((p) => p.hidden);
    expect(hiddenPanel).toBeDefined();

    // The visible one
    const visiblePanel = panels.find((p) => !p.hidden);
    expect(visiblePanel).toBeDefined();
  });

  it("renders page component content", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    expect(screen.getByTestId("content-a")).toBeInTheDocument();
    expect(screen.getByTestId("content-a")).toHaveTextContent("Content A");
  });

  it("preserves content of inactive tabs (no unmount)", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    // A's content should still be in the DOM (just hidden)
    expect(screen.getByTestId("content-a")).toBeInTheDocument();
    expect(screen.getByTestId("content-b")).toBeInTheDocument();
  });
});
