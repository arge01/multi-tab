import { useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { TabInstance, URLAdapter } from "../types";

/** Options for {@link useReactRouterAdapter}. */
export interface ReactRouterAdapterOptions {
  /** Query-string key for tab instance IDs. @default "tabs" */
  tabsParam?: string;
  /** Query-string key for the active tab. @default "active" */
  activeParam?: string;
}

/**
 * React Router v6+ adapter (hook).
 *
 * Must be called **inside** a `<BrowserRouter>` or equivalent.
 * Returns a stable {@link URLAdapter} reference.
 *
 * @example
 * ```tsx
 * import { useReactRouterAdapter } from 'react-multi-tab/adapters/react-router';
 *
 * function App() {
 *   const adapter = useReactRouterAdapter();
 *   return (
 *     <MultiTabProvider adapter={adapter} registry={registry}>
 *       ...
 *     </MultiTabProvider>
 *   );
 * }
 * ```
 */
export function useReactRouterAdapter(
  options?: ReactRouterAdapterOptions
): URLAdapter {
  const [, setSearchParams] = useSearchParams();

  // Keep a stable ref so the adapter object identity doesn't change.
  const setParamsRef = useRef(setSearchParams);
  setParamsRef.current = setSearchParams;

  const tabsKey = options?.tabsParam ?? "tabs";
  const activeKey = options?.activeParam ?? "active";

  return useMemo<URLAdapter>(
    () => ({
      read() {
        const params = new URLSearchParams(window.location.search);
        const tabsStr = params.get(tabsKey);
        const activeTab = params.get(activeKey);

        if (!tabsStr) return null;
        return { tabs: tabsStr.split(",").filter(Boolean), activeTab };
      },

      write(tabs: TabInstance[], activeTabId: string | null) {
        const newParams: Record<string, string> = {};
        if (tabs.length > 0) {
          newParams[tabsKey] = tabs.map((t) => t.instanceId).join(",");
          if (activeTabId) newParams[activeKey] = activeTabId;
        }
        setParamsRef.current(newParams, { replace: true });
      },

      subscribe(callback: () => void) {
        window.addEventListener("popstate", callback);
        return () => window.removeEventListener("popstate", callback);
      },
    }),
    [tabsKey, activeKey]
  );
}
