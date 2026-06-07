import { useCallback, useContext } from "react";
import { useSyncExternalStore } from "react";
import { TabInstanceContext } from "../context/TabInstanceContext";
import { useInternalContext } from "./useInternalContext";

const EMPTY_DATA = Object.freeze({});

/**
 * Read and write per-tab data with full TypeScript generics.
 *
 * When no `instanceId` is provided, the hook automatically targets the
 * ID from the surrounding `TabContent`. If not inside a `TabContent`,
 * it falls back to the globally active tab.
 *
 * This hook is highly optimized using `useSyncExternalStore` to prevent
 * unnecessary re-renders. A component using this hook will ONLY re-render
 * when the specific data for its resolved `instanceId` changes!
 *
 * @typeParam TData – Shape of the data stored for this tab instance.
 *
 * @example
 * ```tsx
 * interface FormData { name: string; email: string }
 *
 * function MyPage() {
 *   const [data, setData] = useTabData<FormData>();
 *   // data  : FormData
 *   // setData: (update: Partial<FormData>) => void
 * }
 * ```
 */
export function useTabData<TData = Record<string, unknown>>(
  instanceId?: string
): [TData, (update: Partial<TData>) => void] {
  const { store, setTabData } = useInternalContext();
  const contextId = useContext(TabInstanceContext);

  // Fallback requires us to check store state. We do it once per render safely
  // since activeTabId rarely changes without the store updating anyway.
  const fallbackId = store.getState().activeTabId;
  const resolvedId = instanceId ?? contextId ?? fallbackId;

  const getSnapshot = useCallback(() => {
    if (!resolvedId) return EMPTY_DATA as unknown as TData;
    const tabData = store.getState().tabData[resolvedId];
    return (tabData ?? EMPTY_DATA) as unknown as TData;
  }, [resolvedId, store]);

  const data = useSyncExternalStore(store.subscribe, getSnapshot);

  const setData = useCallback(
    (update: Partial<TData>) => {
      if (resolvedId) {
        setTabData(resolvedId, update as Record<string, unknown>);
      }
    },
    [resolvedId, setTabData]
  );

  return [data, setData];
}
