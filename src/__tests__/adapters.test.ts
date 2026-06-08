import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { memoryAdapter } from "../adapters/memory";
import { searchParamsAdapter } from "../adapters/search-params";

// ---------------------------------------------------------------------------
// Memory Adapter
// ---------------------------------------------------------------------------

describe("memoryAdapter", () => {
  it("read returns null", () => {
    const adapter = memoryAdapter();
    expect(adapter.read()).toBeNull();
  });

  it("write is a no-op", () => {
    const adapter = memoryAdapter();
    // Should not throw
    expect(() => adapter.write([], null)).not.toThrow();
  });

  it("has no subscribe", () => {
    const adapter = memoryAdapter();
    expect(adapter.subscribe).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Search Params Adapter
// ---------------------------------------------------------------------------

describe("searchParamsAdapter", () => {
  const originalLocation = window.location;

  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock location.search
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...originalLocation,
        search: "",
        pathname: "/app",
      },
    });

    replaceStateSpy = vi.spyOn(window.history, "replaceState");
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
    replaceStateSpy.mockRestore();
  });

  it("read returns null when no tabs in URL", () => {
    const adapter = searchParamsAdapter();
    expect(adapter.read()).toBeNull();
  });

  it("read parses tabs and active from URL", () => {
    window.location.search = "?tabs=a-1,b-2&active=b-2";

    const adapter = searchParamsAdapter();
    const result = adapter.read();

    expect(result).toEqual({
      tabs: ["a-1", "b-2"],
      activeTab: "b-2",
    });
  });

  it("read uses custom param names", () => {
    window.location.search = "?pages=x,y&current=y";

    const adapter = searchParamsAdapter({
      tabsParam: "pages",
      activeParam: "current",
    });

    const result = adapter.read();
    expect(result).toEqual({
      tabs: ["x", "y"],
      activeTab: "y",
    });
  });

  it("write persists tabs to URL via replaceState", () => {
    const adapter = searchParamsAdapter();

    adapter.write(
      [
        { instanceId: "a-1", pageId: "a", label: "A", closable: true },
        { instanceId: "b-2", pageId: "b", label: "B", closable: true },
      ],
      "b-2"
    );

    expect(replaceStateSpy).toHaveBeenCalledOnce();
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).toContain("tabs=a-1,b-2");
    expect(url).toContain("active=b-2");
  });

  it("write clears URL when no tabs", () => {
    const adapter = searchParamsAdapter();

    adapter.write([], null);

    expect(replaceStateSpy).toHaveBeenCalledOnce();
    const url = replaceStateSpy.mock.calls[0][2] as string;
    expect(url).toBe("/app");
  });

  it("subscribe listens to popstate events", () => {
    const adapter = searchParamsAdapter();
    const callback = vi.fn();

    const unsubscribe = adapter.subscribe!(callback);

    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(callback).toHaveBeenCalledOnce();

    unsubscribe();
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(callback).toHaveBeenCalledOnce(); // Still 1
  });
});
