import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MultiTabProvider } from "../components/MultiTabProvider";
import { useMultiTab } from "../hooks/useMultiTab";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PageA = ({ data }: TabComponentProps) => (
  <div data-testid="page-a">Page A: {JSON.stringify(data)}</div>
);
const PageB = (_props: TabComponentProps) => (
  <div data-testid="page-b">Page B</div>
);

const registry = createPageRegistry([
  { id: "page-a", label: "Page A", component: PageA },
  { id: "page-b", label: "Page B", component: PageB },
]);

/** Renders the provider with an interactive control surface. */
function TestHarness({
  onOpen,
  onClose,
  onChange,
}: {
  onOpen?: (inst: { instanceId: string }) => void;
  onClose?: (id: string) => void;
  onChange?: (id: string) => void;
}) {
  return (
    <MultiTabProvider
      registry={registry}
      onTabOpen={onOpen}
      onTabClose={onClose}
      onTabChange={onChange}
    >
      <Controls />
    </MultiTabProvider>
  );
}

function Controls() {
  const { tabs, activeTabId, openTab, closeTab, closeAllTabs } = useMultiTab();

  return (
    <div>
      <button onClick={() => openTab("page-a")}>Open A</button>
      <button onClick={() => openTab("page-b")}>Open B</button>
      <button
        onClick={() => {
          if (activeTabId) closeTab(activeTabId);
        }}
      >
        Close Active
      </button>
      <button onClick={closeAllTabs}>Close All</button>
      <div data-testid="tab-count">{tabs.length}</div>
      <div data-testid="active-tab">{activeTabId ?? "none"}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MultiTabProvider", () => {
  it("renders children", () => {
    render(
      <MultiTabProvider registry={registry}>
        <div data-testid="child">Hello</div>
      </MultiTabProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("starts with no tabs", () => {
    render(<TestHarness />);
    expect(screen.getByTestId("tab-count")).toHaveTextContent("0");
    expect(screen.getByTestId("active-tab")).toHaveTextContent("none");
  });

  it("opens a tab and activates it", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByText("Open A"));

    expect(screen.getByTestId("tab-count")).toHaveTextContent("1");
    expect(screen.getByTestId("active-tab")).not.toHaveTextContent("none");
  });

  it("opens multiple tabs", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
  });

  it("closes the active tab and falls back to the last remaining", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByText("Open A"));
    const firstTabId = screen.getByTestId("active-tab").textContent;

    await user.click(screen.getByText("Open B"));
    // B is now active
    expect(screen.getByTestId("active-tab").textContent).not.toBe(firstTabId);

    await user.click(screen.getByText("Close Active"));
    // Should fall back to A
    expect(screen.getByTestId("tab-count")).toHaveTextContent("1");
    expect(screen.getByTestId("active-tab").textContent).toBe(firstTabId);
  });

  it("closes all tabs", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));
    await user.click(screen.getByText("Close All"));

    expect(screen.getByTestId("tab-count")).toHaveTextContent("0");
    expect(screen.getByTestId("active-tab")).toHaveTextContent("none");
  });

  it("fires onTabOpen callback", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<TestHarness onOpen={onOpen} />);

    await user.click(screen.getByText("Open A"));

    expect(onOpen).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ pageId: "page-a", label: "Page A" })
    );
  });

  it("fires onTabClose callback", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<TestHarness onClose={onClose} />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Close Active"));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("fires onTabChange callback when active tab changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TestHarness onChange={onChange} />);

    await user.click(screen.getByText("Open A"));
    await user.click(screen.getByText("Open B"));

    // Should have fired twice — once for A, once for B
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("throws when opening an unregistered page", async () => {
    function BadControls() {
      const { openTab } = useMultiTab();
      return (
        <button
          onClick={() => {
            try {
              openTab("nonexistent");
            } catch (e) {
              const el = document.getElementById("error-msg");
              if (el) el.textContent = (e as Error).message;
            }
          }}
        >
          Open Bad
        </button>
      );
    }

    render(
      <MultiTabProvider registry={registry}>
        <BadControls />
        <div id="error-msg" data-testid="error-msg" />
      </MultiTabProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Open Bad"));

    expect(screen.getByTestId("error-msg")).toHaveTextContent(
      "not found in registry"
    );
  });
});
