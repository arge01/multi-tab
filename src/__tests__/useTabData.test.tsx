import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import React from "react";
import { MultiTabProvider } from "../components/MultiTabProvider";
import { useMultiTab } from "../hooks/useMultiTab";
import { useTabData } from "../hooks/useTabData";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface FormData {
  name: string;
  count: number;
}

function TypedPage({ instanceId }: TabComponentProps) {
  const [data, setData] = useTabData<FormData>();

  return (
    <div data-testid={`page-${instanceId}`}>
      <span data-testid="data-name">{data.name ?? ""}</span>
      <span data-testid="data-count">{data.count ?? 0}</span>
      <button onClick={() => setData({ name: "Alice" })}>Set Name</button>
      <button onClick={() => setData({ count: 42 })}>Set Count</button>
    </div>
  );
}

const registry = createPageRegistry([
  { id: "typed", label: "Typed", component: TypedPage },
]);

// removed Harness

// removed Controls

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useTabData", () => {
  it("returns empty data by default", async () => {
    function Inner() {
      const { openTab } = useMultiTab();
      const [data] = useTabData<FormData>();
      return (
        <div>
          <button onClick={() => openTab("typed")}>Open</button>
          <span data-testid="raw">{JSON.stringify(data)}</span>
        </div>
      );
    }

    render(
      <MultiTabProvider registry={registry}>
        <Inner />
      </MultiTabProvider>
    );

    // Before opening any tab, data should be empty
    expect(screen.getByTestId("raw")).toHaveTextContent("{}");
  });

  it("merges partial updates", async () => {
    const user = userEvent.setup();

    function Inner() {
      const { openTab } = useMultiTab();
      const [data, setData] = useTabData<FormData>();

      return (
        <div>
          <button onClick={() => openTab("typed")}>Open</button>
          <button onClick={() => setData({ name: "Bob" })}>Set Name</button>
          <button onClick={() => setData({ count: 7 })}>Set Count</button>
          <span data-testid="name">{data.name ?? ""}</span>
          <span data-testid="count">{data.count ?? 0}</span>
        </div>
      );
    }

    render(
      <MultiTabProvider registry={registry}>
        <Inner />
      </MultiTabProvider>
    );

    await user.click(screen.getByText("Open"));
    await user.click(screen.getByText("Set Name"));
    expect(screen.getByTestId("name")).toHaveTextContent("Bob");

    await user.click(screen.getByText("Set Count"));
    expect(screen.getByTestId("count")).toHaveTextContent("7");
    // Name should still be there
    expect(screen.getByTestId("name")).toHaveTextContent("Bob");
  });

  it("isolates data between tab instances", async () => {
    const user = userEvent.setup();

    function Inner() {
      const { tabs, activeTabId, openTab, activateTab } = useMultiTab();
      const [data, setData] = useTabData<FormData>();

      return (
        <div>
          <button onClick={() => openTab("typed")}>Open</button>
          <button onClick={() => setData({ name: "Tab-Specific" })}>
            Set Name
          </button>
          <span data-testid="current-name">{data.name ?? "empty"}</span>
          <span data-testid="active">{activeTabId ?? "none"}</span>
          {tabs.map((t) => (
            <button
              key={t.instanceId}
              onClick={() => activateTab(t.instanceId)}
            >
              Go to {t.instanceId.substring(0, 10)}
            </button>
          ))}
        </div>
      );
    }

    render(
      <MultiTabProvider registry={registry}>
        <Inner />
      </MultiTabProvider>
    );

    // Open first tab and set data
    await user.click(screen.getByText("Open"));
    await user.click(screen.getByText("Set Name"));
    expect(screen.getByTestId("current-name")).toHaveTextContent(
      "Tab-Specific"
    );

    // Open second tab — should have fresh data
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("current-name")).toHaveTextContent("empty");
  });

  it("throws when used outside MultiTabProvider", () => {
    function Orphan() {
      useTabData();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow(
      "must be used within a <MultiTabProvider>"
    );
  });
});
