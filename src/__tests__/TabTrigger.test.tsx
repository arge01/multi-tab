import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MultiTabProvider } from "../components/MultiTabProvider";
import { TabList } from "../components/TabList";
import { TabTrigger } from "../components/TabTrigger";
import { useMultiTab } from "../hooks/useMultiTab";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const Dummy = (_props: TabComponentProps) => <div />;

const registry = createPageRegistry([
  { id: "a", label: "A", component: Dummy },
  { id: "b", label: "B", component: Dummy },
]);

function Harness() {
  return (
    <MultiTabProvider registry={registry}>
      <Inner />
    </MultiTabProvider>
  );
}

function Inner() {
  const { tabs, activeTabId, openTab } = useMultiTab();

  return (
    <div>
      <button onClick={() => openTab("a")}>Open A</button>
      <button onClick={() => openTab("b")}>Open B</button>

      <TabList aria-label="Tabs">
        {tabs.map((t) => (
          <TabTrigger key={t.instanceId} instanceId={t.instanceId}>
            {t.label}
          </TabTrigger>
        ))}
      </TabList>

      <span data-testid="active">{activeTabId ?? "none"}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TabTrigger", () => {
  it('renders with role="tab"', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const tab = screen.getByRole("tab");
    expect(tab).toBeInTheDocument();
  });

  it("has correct ARIA attributes when active", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const tab = screen.getByRole("tab");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tab).toHaveAttribute("tabindex", "0");
    expect(tab).toHaveAttribute("aria-controls");
    expect(tab.getAttribute("aria-controls")).toMatch(/^rmt-tabpanel-/);
  });

  it("has correct ARIA attributes when inactive", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabs = screen.getAllByRole("tab");
    // First tab (A) is inactive since B was opened last
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[0]).toHaveAttribute("tabindex", "-1");
  });

  it("clicking a tab activates it", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabs = screen.getAllByRole("tab");

    // Click on A tab to activate it
    await user.click(tabs[0]);

    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("has data-state attribute", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("data-state", "inactive");
    expect(tabs[1]).toHaveAttribute("data-state", "active");
  });

  it("id matches the pattern rmt-tab-{instanceId}", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    const tab = screen.getByRole("tab");
    expect(tab.id).toMatch(/^rmt-tab-a-/);
  });
});
