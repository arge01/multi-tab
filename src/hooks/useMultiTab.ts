import { useSyncExternalStore } from "react";
import type { OpenTabOptions, TabInstance } from "../types";
import { useInternalContext } from "./useInternalContext";

/** Public return type of {@link useMultiTab}. */
export interface UseMultiTabReturn {
  /** Currently open tabs. */
  tabs: TabInstance[];
  /** Instance ID of the active tab, or `null` if none. */
  activeTabId: string | null;
  /** Open a new tab for the given page ID. Returns the instance ID. */
  openTab: (pageId: string, options?: OpenTabOptions) => string;
  /** Close a tab by instance ID. */
  closeTab: (instanceId: string) => void;
  /** Activate (switch to) a tab by instance ID. */
  activateTab: (instanceId: string) => void;
  /** Close every open tab. */
  closeAllTabs: () => void;
  /** Close all tabs except the specified one. */
  closeOtherTabs: (instanceId: string) => void;
}

/**
 * Primary hook for managing tabs.
 *
 * @example
 * ```tsx
 * const { tabs, activeTabId, openTab, closeTab } = useMultiTab();
 * ```
 */
export function useMultiTab(): UseMultiTabReturn {
  const {
    store,
    openTab,
    closeTab,
    activateTab,
    closeAllTabs,
    closeOtherTabs,
  } = useInternalContext();

  // Subscribe to the store to get the latest tabs and activeTabId
  const state = useSyncExternalStore(store.subscribe, store.getState);

  return {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    openTab,
    closeTab,
    activateTab,
    closeAllTabs,
    closeOtherTabs,
  };
}
