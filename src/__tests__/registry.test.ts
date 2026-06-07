import { describe, it, expect } from "vitest";
import { createPageRegistry } from "../registry";
import type { TabComponentProps } from "../types";

// Minimal test component
const TestPage = (_props: TabComponentProps) => null;

describe("createPageRegistry", () => {
  it("creates a registry from valid page definitions", () => {
    const registry = createPageRegistry([
      { id: "page-a", label: "Page A", component: TestPage },
      { id: "page-b", label: "Page B", component: TestPage },
    ]);

    expect(registry.pages).toHaveLength(2);
    expect(registry.pages[0].id).toBe("page-a");
    expect(registry.pages[1].id).toBe("page-b");
  });

  it("getPage returns the correct page definition", () => {
    const registry = createPageRegistry([
      { id: "dashboard", label: "Dashboard", component: TestPage },
    ]);

    const page = registry.getPage("dashboard");
    expect(page).toBeDefined();
    expect(page?.label).toBe("Dashboard");
  });

  it("getPage returns undefined for unknown id", () => {
    const registry = createPageRegistry([
      { id: "page-a", label: "Page A", component: TestPage },
    ]);

    expect(registry.getPage("nonexistent")).toBeUndefined();
  });

  it("throws on duplicate page ids", () => {
    expect(() =>
      createPageRegistry([
        { id: "dup", label: "First", component: TestPage },
        { id: "dup", label: "Second", component: TestPage },
      ])
    ).toThrow('Duplicate page id: "dup"');
  });

  it("throws on empty id", () => {
    expect(() =>
      createPageRegistry([{ id: "", label: "No ID", component: TestPage }])
    ).toThrow("must have an id");
  });

  it("throws on empty label", () => {
    expect(() =>
      createPageRegistry([{ id: "page-a", label: "", component: TestPage }])
    ).toThrow("must have a label");
  });

  it("throws on missing component", () => {
    expect(() =>
      createPageRegistry([
        {
          id: "page-a",
          label: "Page A",
          component: null as unknown as typeof TestPage,
        },
      ])
    ).toThrow("must have a component");
  });

  it("creates an immutable copy — original array mutations do not affect registry", () => {
    const pages = [{ id: "page-a", label: "Page A", component: TestPage }];
    const registry = createPageRegistry(pages);

    pages.push({ id: "page-b", label: "Page B", component: TestPage });

    expect(registry.pages).toHaveLength(1);
  });

  it("handles closable property default", () => {
    const registry = createPageRegistry([
      { id: "a", label: "A", component: TestPage },
      { id: "b", label: "B", component: TestPage, closable: false },
    ]);

    expect(registry.getPage("a")?.closable).toBeUndefined();
    expect(registry.getPage("b")?.closable).toBe(false);
  });

  it("accepts an empty array", () => {
    const registry = createPageRegistry([]);
    expect(registry.pages).toHaveLength(0);
    expect(registry.getPage("anything")).toBeUndefined();
  });
});
