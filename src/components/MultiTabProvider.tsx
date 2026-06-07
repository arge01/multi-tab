import { useCallback, useEffect, useMemo, useRef } from "react";
import { MultiTabContext } from "../context";
import { createMultiTabStore } from "../store";
import type {
  MultiTabProviderProps,
  OpenTabOptions,
  TabInstance,
} from "../types";

// ---------------------------------------------------------------------------
// Instance ID generator
// ---------------------------------------------------------------------------

let counter = 0;

function generateInstanceId(pageId: string): string {
  counter += 1;
  return `${pageId}-${counter}`;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function MultiTabProvider({
  registry,
  adapter,
  defaultActiveTab,
  children,
  onTabOpen,
  onTabClose,
  onTabChange,
}: MultiTabProviderProps) {
  // Initialize the external store exactly once
  const store = useRef(
    createMultiTabStore({
      tabs: [],
      activeTabId: defaultActiveTab ?? null,
      tabData: {},
      activeTabHistory: defaultActiveTab ? [defaultActiveTab] : [],
    })
  ).current;

  // Keep callback refs so they're always up-to-date
  const cbRef = useRef({ onTabOpen, onTabClose, onTabChange });
  cbRef.current = { onTabOpen, onTabClose, onTabChange };

  // Track previous active tab to fire `onTabChange` properly.
  // We'll use a local state or subscribe to store to detect active tab changes.
  const prevActiveRef = useRef<string | null>(defaultActiveTab ?? null);

  useEffect(
    () =>
      store.subscribe(() => {
        const state = store.getState();
        if (
          state.activeTabId !== null &&
          state.activeTabId !== prevActiveRef.current
        ) {
          cbRef.current.onTabChange?.(state.activeTabId);
        }
        prevActiveRef.current = state.activeTabId;
      }),
    [store]
  );

  // ---- Adapter: restore on mount -------------------------------------------
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current || !adapter) return;
    initialised.current = true;

    const saved = adapter.read();
    if (!saved || saved.tabs.length === 0) return;

    const restoredTabs: TabInstance[] = saved.tabs
      .map((instanceId) => {
        const parts = instanceId.split("-");
        for (let i = parts.length - 1; i >= 1; i--) {
          const candidateId = parts.slice(0, i).join("-");
          const page = registry.getPage(candidateId);
          if (page) {
            return {
              instanceId,
              pageId: page.id,
              label: page.label,
              closable: page.closable !== false,
            } satisfies TabInstance;
          }
        }
        return null;
      })
      .filter((t): t is TabInstance => t !== null);

    if (restoredTabs.length > 0) {
      const activeTab =
        saved.activeTab &&
        restoredTabs.some((t) => t.instanceId === saved.activeTab)
          ? saved.activeTab
          : restoredTabs[restoredTabs.length - 1].instanceId;

      store.dispatch({
        type: "RESTORE",
        state: { tabs: restoredTabs, activeTabId: activeTab },
      });
    }
  }, [adapter, registry, store]);

  // ---- Adapter: persist on change ------------------------------------------
  useEffect(() => {
    if (!adapter) return;
    return store.subscribe(() => {
      const { tabs, activeTabId } = store.getState();
      adapter.write(tabs, activeTabId);
    });
  }, [adapter, store]);

  // ---- Adapter: subscribe to external changes ------------------------------
  useEffect(() => {
    if (!adapter?.subscribe) return;
    const unsubscribe = adapter.subscribe(() => {
      const saved = adapter.read();
      const currentState = store.getState();
      if (saved?.activeTab && saved.activeTab !== currentState.activeTabId) {
        store.dispatch({ type: "ACTIVATE_TAB", instanceId: saved.activeTab });
      }
    });
    return unsubscribe;
  }, [adapter, store]);

  // ---- Adapter: cleanup on unmount -----------------------------------------
  useEffect(() => () => adapter?.destroy?.(), [adapter]);

  // ---- Actions -------------------------------------------------------------

  const openTab = useCallback(
    (pageId: string, options?: OpenTabOptions): string => {
      const page = registry.getPage(pageId);
      if (!page) {
        throw new Error(
          `react-multi-tab: Page "${pageId}" not found in registry.`
        );
      }

      const instanceId = options?.instanceId ?? generateInstanceId(pageId);
      const tab: TabInstance = {
        instanceId,
        pageId,
        label: options?.label ?? page.label,
        closable: page.closable !== false,
      };

      store.dispatch({
        type: "OPEN_TAB",
        tab,
        activate: options?.activate !== false,
      });
      cbRef.current.onTabOpen?.(tab);

      return instanceId;
    },
    [registry, store]
  );

  const closeTab = useCallback(
    (instanceId: string) => {
      store.dispatch({ type: "CLOSE_TAB", instanceId });
      cbRef.current.onTabClose?.(instanceId);
    },
    [store]
  );

  const activateTab = useCallback(
    (instanceId: string) => {
      store.dispatch({ type: "ACTIVATE_TAB", instanceId });
    },
    [store]
  );

  const closeAllTabs = useCallback(() => {
    store.dispatch({ type: "CLOSE_ALL" });
  }, [store]);

  const closeOtherTabs = useCallback(
    (instanceId: string) => {
      store.dispatch({ type: "CLOSE_OTHERS", instanceId });
    },
    [store]
  );

  const setTabData = useCallback(
    (instanceId: string, data: Record<string, unknown>) => {
      store.dispatch({ type: "SET_DATA", instanceId, data });
    },
    [store]
  );

  const getTabData = useCallback(
    (instanceId: string): Record<string, unknown> =>
      store.getState().tabData[instanceId] ?? {},
    [store]
  );

  const removeTabData = useCallback(
    (instanceId: string) => {
      store.dispatch({ type: "REMOVE_DATA", instanceId });
    },
    [store]
  );

  // ---- Context value -------------------------------------------------------

  const contextValue = useMemo(
    () => ({
      store,
      registry,
      openTab,
      closeTab,
      activateTab,
      closeAllTabs,
      closeOtherTabs,
      setTabData,
      getTabData,
      removeTabData,
    }),
    [
      store,
      registry,
      openTab,
      closeTab,
      activateTab,
      closeAllTabs,
      closeOtherTabs,
      setTabData,
      getTabData,
      removeTabData,
    ]
  );

  return (
    <MultiTabContext.Provider value={contextValue}>
      {children}
    </MultiTabContext.Provider>
  );
}
