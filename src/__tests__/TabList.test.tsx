import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import React from "react";
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
  { id: "c", label: "C", component: Dummy },
]);

function Harness() {
  return (
    <MultiTabProvider registry={registry}>
      <Inner />
    </MultiTabProvider>
  );
}

function Inner() {
  const { tabs, openTab } = useMultiTab();

  return (
    <div>
      <button onClick={() => openTab("a")}>Open A</button>
      <button onClick={() => openTab("b")}>Open B</button>
      <button onClick={() => openTab("c")}>Open C</button>

      <TabList aria-label="Tabs">
        {tabs.map((t) => (
          <TabTrigger key={t.instanceId} instanceId={t.instanceId}>
            {t.label}
          </TabTrigger>
        ))}
      </TabList>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TabList", () => {
  it('renders with role="tablist"', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("has aria-label", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));

    expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Tabs");
  });

  it("ArrowRight moves focus to next tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabTriggers = screen.getAllByRole("tab");
    tabTriggers[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tabTriggers[1]);
  });

  it("ArrowRight wraps to first tab at the end", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabTriggers = screen.getAllByRole("tab");
    tabTriggers[1].focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tabTriggers[0]);
  });

  it("ArrowLeft moves focus to previous tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabTriggers = screen.getAllByRole("tab");
    tabTriggers[1].focus();

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tabTriggers[0]);
  });

  it("ArrowLeft wraps to last tab at the start", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const tabTriggers = screen.getAllByRole("tab");
    tabTriggers[0].focus();

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tabTriggers[1]);
  });

  it("Home moves focus to first tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));
    await user.click(screen.getByText("Open C"));

    const tabTriggers = screen.getAllByRole("tab");
    tabTriggers[2].focus();

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(tabTriggers[0]);
  });

  it("End moves focus to last tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));
    await user.click(screen.getByText("Open C"));

    const tabTriggers = screen.getAllByRole("tab");
    tabTriggers[0].focus();

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(tabTriggers[2]);
  });
});
