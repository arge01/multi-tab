import { useSyncExternalStore } from "react";
import { useInternalContext } from "../hooks/useInternalContext";
import { TabContent } from "./TabContent";
import { TabPanel } from "./TabPanel";

/**
 * Props for {@link TabPanels}.
 */
export interface TabPanelsProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders **all** open tab panels and hides inactive ones.
 *
 * This is the simplest way to display tab content. Each page component
 * receives its `instanceId`, `data`, and `setData` as props automatically.
 *
 * Inactive panels stay mounted (using the `hidden` attribute) so their
 * state is preserved across tab switches.
 *
 * @example
 * ```tsx
 * <TabPanels />
 * ```
 */
export function TabPanels({ className, style }: TabPanelsProps) {
  const { store, registry, setTabData } = useInternalContext();
  const state = useSyncExternalStore(store.subscribe, store.getState);

  return (
    <div className={className} style={style}>
      {state.tabs.map((tab) => {
        const page = registry.getPage(tab.pageId);
        if (!page) return null;

        const isActive = state.activeTabId === tab.instanceId;
        const data = state.tabData[tab.instanceId] ?? {};
        const Component = page.component;

        return (
          <TabPanel
            key={tab.instanceId}
            instanceId={tab.instanceId}
            hidden={!isActive}
          >
            <TabContent instanceId={tab.instanceId}>
              <Component
                instanceId={tab.instanceId}
                data={data}
                setData={(update) =>
                  setTabData(tab.instanceId, update as Record<string, unknown>)
                }
              />
            </TabContent>
          </TabPanel>
        );
      })}
    </div>
  );
}
