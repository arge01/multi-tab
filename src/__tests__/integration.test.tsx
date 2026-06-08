import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MultiTabProvider } from "../components/MultiTabProvider";
import { TabCloseButton } from "../components/TabCloseButton";
import { TabList } from "../components/TabList";
import { TabPanels } from "../components/TabPanels";
import { TabTrigger } from "../components/TabTrigger";
import { useMultiTab } from "../hooks/useMultiTab";
import { useTabData } from "../hooks/useTabData";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// ---------------------------------------------------------------------------
// Page Components
// ---------------------------------------------------------------------------

interface DashboardData {
  filter: string;
}

function DashboardPage(_props: TabComponentProps) {
  const [data, setData] = useTabData<DashboardData>();

  return (
    <div data-testid="dashboard">
      <span data-testid="filter">{data.filter ?? "none"}</span>
      <button onClick={() => setData({ filter: "active" })}>
        Filter Active
      </button>
    </div>
  );
}

function SettingsPage(_props: TabComponentProps) {
  return <div data-testid="settings">Settings Content</div>;
}

function UnclosablePage(_props: TabComponentProps) {
  return <div data-testid="unclosable">Cannot close me</div>;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const registry = createPageRegistry([
  { id: "dashboard", label: "Dashboard", component: DashboardPage },
  { id: "settings", label: "Settings", component: SettingsPage },
  {
    id: "unclosable",
    label: "Permanent",
    component: UnclosablePage,
    closable: false,
  },
]);

function FullApp() {
  return (
    <MultiTabProvider registry={registry}>
      <AppLayout />
    </MultiTabProvider>
  );
}

function AppLayout() {
  const { tabs, openTab } = useMultiTab();

  return (
    <div>
      <nav>
        <button onClick={() => openTab("dashboard")}>Open Dashboard</button>
        <button onClick={() => openTab("settings")}>Open Settings</button>
        <button onClick={() => openTab("unclosable")}>Open Permanent</button>
      </nav>

      <TabList aria-label="Application tabs">
        {tabs.map((tab) => (
          <TabTrigger key={tab.instanceId} instanceId={tab.instanceId}>
            {tab.label}
            <TabCloseButton instanceId={tab.instanceId} />
          </TabTrigger>
        ))}
      </TabList>

      <TabPanels />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integration Tests
// ---------------------------------------------------------------------------

describe("Integration: Full multi-tab flow", () => {
  it("complete lifecycle: open → navigate → interact → close", async () => {
    const user = userEvent.setup();
    render(<FullApp />);

    // 1. Open Dashboard
    await user.click(screen.getByText("Open Dashboard"));
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();

    // 2. Interact with dashboard data
    await user.click(screen.getByText("Filter Active"));
    expect(screen.getByTestId("filter")).toHaveTextContent("active");

    // 3. Open Settings
    await user.click(screen.getByText("Open Settings"));
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByTestId("settings")).toBeVisible();

    // 4. Dashboard content preserved in DOM (hidden)
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();

    // 5. Navigate back to Dashboard
    const dashboardTab = screen.getAllByRole("tab")[0];
    await user.click(dashboardTab);

    // 6. Dashboard data should be preserved
    expect(screen.getByTestId("filter")).toHaveTextContent("active");

    // 7. Close Dashboard via close button
    const closeButtons = screen.getAllByLabelText(/^Close/);
    await user.click(closeButtons[0]); // Close Dashboard

    // 8. Only Settings remains
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    expect(screen.getByTestId("settings")).toBeVisible();
  });

  it("unclosable tabs do not render close button", async () => {
    const user = userEvent.setup();
    render(<FullApp />);

    await user.click(screen.getByText("Open Permanent"));

    // Tab should exist
    expect(screen.getByRole("tab")).toBeInTheDocument();

    // Close button should NOT exist for this tab
    expect(screen.queryByLabelText("Close Permanent")).not.toBeInTheDocument();
  });

  it("keyboard navigation across tabs", async () => {
    const user = userEvent.setup();
    render(<FullApp />);

    await user.click(screen.getByText("Open Dashboard"));
    await user.click(screen.getByText("Open Settings"));
    await user.click(screen.getByText("Open Permanent"));

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);

    // Focus first tab and navigate with arrow keys
    tabs[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tabs[1]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tabs[2]);

    await user.keyboard("{ArrowRight}"); // wraps
    expect(document.activeElement).toBe(tabs[0]);

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(tabs[2]);

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("multiple instances of the same page type", async () => {
    const user = userEvent.setup();
    render(<FullApp />);

    await user.click(screen.getByText("Open Dashboard"));
    await user.click(screen.getByText("Open Dashboard"));

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);

    // Both should show "Dashboard" label
    expect(tabs[0]).toHaveTextContent("Dashboard");
    expect(tabs[1]).toHaveTextContent("Dashboard");

    // Both panels should be in DOM
    const dashboards = screen.getAllByTestId("dashboard");
    expect(dashboards).toHaveLength(2);
  });
});
