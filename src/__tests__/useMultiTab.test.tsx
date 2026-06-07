import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import React from "react";
import { MultiTabProvider } from "../components/MultiTabProvider";
import { useMultiTab } from "../hooks/useMultiTab";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PageA = (_props: TabComponentProps) => <div>Page A</div>;
const PageB = (_props: TabComponentProps) => <div>Page B</div>;
const PageC = (_props: TabComponentProps) => <div>Page C</div>;

const registry = createPageRegistry([
  { id: "a", label: "A", component: PageA },
  { id: "b", label: "B", component: PageB },
  { id: "c", label: "C", component: PageC, closable: false },
]);

function Harness() {
  return (
    <MultiTabProvider registry={registry}>
      <Controls />
    </MultiTabProvider>
  );
}

function Controls() {
  const {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    activateTab,
    closeAllTabs,
    closeOtherTabs,
  } = useMultiTab();

  return (
    <div>
      <button onClick={() => openTab("a")}>Open A</button>
      <button onClick={() => openTab("b")}>Open B</button>
      <button onClick={() => openTab("c")}>Open C</button>
      <button onClick={() => openTab("a", { activate: false })}>
        Open A Silent
      </button>
      <button onClick={() => openTab("a", { label: "Custom" })}>
        Open A Custom
      </button>
      <button
        onClick={() => {
          if (activeTabId) closeTab(activeTabId);
        }}
      >
        Close Active
      </button>
      <button onClick={closeAllTabs}>Close All</button>
      <button
        onClick={() => {
          if (activeTabId) closeOtherTabs(activeTabId);
        }}
      >
        Close Others
      </button>

      <div data-testid="tab-count">{tabs.length}</div>
      <div data-testid="active-tab">{activeTabId ?? "none"}</div>
      <div data-testid="tab-labels">{tabs.map((t) => t.label).join(",")}</div>

      {/* Activate buttons for each tab */}
      {tabs.map((t) => (
        <button key={t.instanceId} onClick={() => activateTab(t.instanceId)}>
          Activate {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useMultiTab", () => {
  it("openTab returns an instance ID", async () => {
    let returnedId = "";
    function Inspector() {
      const { openTab } = useMultiTab();
      return (
        <button
          onClick={() => {
            returnedId = openTab("a");
          }}
        >
          Go
        </button>
      );
    }
    render(
      <MultiTabProvider registry={registry}>
        <Inspector />
      </MultiTabProvider>
    );

    await userEvent.setup().click(screen.getByText("Go"));
    expect(returnedId).toContain("a-");
  });

  it("openTab with activate=false does not change active tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    const firstId = screen.getByTestId("active-tab").textContent;

    await user.click(screen.getByText("Open A Silent"));
    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active-tab")).toHaveTextContent(firstId!);
  });

  it("openTab with custom label uses the label", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A Custom"));
    expect(screen.getByTestId("tab-labels")).toHaveTextContent("Custom");
  });

  it("activateTab switches the active tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const bId = screen.getByTestId("active-tab").textContent;

    // Activate A
    await user.click(screen.getByText("Activate A"));
    expect(screen.getByTestId("active-tab").textContent).not.toBe(bId);
  });

  it("closeOtherTabs keeps only the active tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));
    await user.click(screen.getByText("Open C"));

    expect(screen.getByTestId("tab-count")).toHaveTextContent("3");

    await user.click(screen.getByText("Close Others"));

    expect(screen.getByTestId("tab-count")).toHaveTextContent("1");
  });

  it("closeTab on a non-active tab does not change active tab", async () => {
    const user = userEvent.setup();

    function InnerControls() {
      const { tabs, activeTabId, openTab, closeTab } = useMultiTab();
      return (
        <div>
          <button onClick={() => openTab("a")}>Open A</button>
          <button onClick={() => openTab("b")}>Open B</button>
          {tabs
            .filter((t) => t.instanceId !== activeTabId)
            .map((t) => (
              <button key={t.instanceId} onClick={() => closeTab(t.instanceId)}>
                Close {t.label}
              </button>
            ))}
          <div data-testid="active">{activeTabId ?? "none"}</div>
          <div data-testid="count">{tabs.length}</div>
        </div>
      );
    }

    render(
      <MultiTabProvider registry={registry}>
        <InnerControls />
      </MultiTabProvider>
    );

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    const activeBeforeClose = screen.getByTestId("active").textContent;

    await user.click(screen.getByText("Close A"));

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("active")).toHaveTextContent(activeBeforeClose!);
  });
});
