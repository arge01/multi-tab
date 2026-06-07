import type { TabInstance, URLAdapter } from "../types";

/** Options for {@link searchParamsAdapter}. */
export interface SearchParamsAdapterOptions {
  /** Query-string key for tab instance IDs. @default "tabs" */
  tabsParam?: string;
  /** Query-string key for the active tab. @default "active" */
  activeParam?: string;
}

/**
 * URL adapter that uses the vanilla browser `URLSearchParams` +
 * `history.replaceState` APIs.
 *
 * **No dependency on any router library** — works in any SPA.
 *
 * @example
 * ```tsx
 * import { searchParamsAdapter } from 'react-multi-tab';
 *
 * <MultiTabProvider adapter={searchParamsAdapter()} registry={registry}>
 * ```
 */
export function searchParamsAdapter(
  options?: SearchParamsAdapterOptions
): URLAdapter {
  const tabsKey = options?.tabsParam ?? "tabs";
  const activeKey = options?.activeParam ?? "active";

  return {
    read() {
      if (typeof window === "undefined") return null;

      const params = new URLSearchParams(window.location.search);
      const tabsStr = params.get(tabsKey);
      const activeTab = params.get(activeKey);

      if (!tabsStr) return null;

      const tabs = tabsStr.split(",").filter(Boolean);
      return { tabs, activeTab };
    },

    write(tabs: TabInstance[], activeTabId: string | null) {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);

      if (tabs.length > 0) {
        params.set(tabsKey, tabs.map((t) => t.instanceId).join(","));
        if (activeTabId) {
          params.set(activeKey, activeTabId);
        } else {
          params.delete(activeKey);
        }
      } else {
        params.delete(tabsKey);
        params.delete(activeKey);
      }

      const qs = params.toString().replace(/%2C/g, ",");
      const newUrl = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;

      window.history.replaceState(null, "", newUrl);
    },

    subscribe(callback: () => void) {
      window.addEventListener("popstate", callback);
      return () => window.removeEventListener("popstate", callback);
    },
  };
}
