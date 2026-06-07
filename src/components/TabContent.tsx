import { TabInstanceContext } from "../context/TabInstanceContext";

export interface TabContentProps {
  instanceId: string;
  children: React.ReactNode;
}

/**
 * A wrapper component that provides the `TabInstanceContext` to all children.
 * This allows hooks like `useTabData` and `useTabInstanceId` to automatically
 * resolve the active tab's instanceId without it being explicitly passed.
 *
 * @example
 * ```tsx
 * <TabContent instanceId={activeTab.instanceId}>
 *   <ActivePageComponent />
 * </TabContent>
 * ```
 */
export function TabContent({ instanceId, children }: TabContentProps) {
  return (
    <TabInstanceContext.Provider value={instanceId}>
      {children}
    </TabInstanceContext.Provider>
  );
}
