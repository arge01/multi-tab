// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export { MultiTabProvider } from "./components/MultiTabProvider";
export { TabList } from "./components/TabList";
export { TabTrigger } from "./components/TabTrigger";
export { TabPanel } from "./components/TabPanel";
export { TabPanels } from "./components/TabPanels";
export { TabCloseButton } from "./components/TabCloseButton";
export { TabContent } from "./components/TabContent";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useMultiTab } from "./hooks/useMultiTab";
export { useTabData } from "./hooks/useTabData";
export { useTabInstanceId } from "./context/TabInstanceContext";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
export { createPageRegistry } from "./registry";

// ---------------------------------------------------------------------------
// Adapters (built-in)
// ---------------------------------------------------------------------------
export { memoryAdapter } from "./adapters/memory";
export { searchParamsAdapter } from "./adapters/search-params";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
  PageDefinition,
  TabInstance,
  TabComponentProps,
  OpenTabOptions,
  URLAdapter,
  PageRegistry,
  MultiTabProviderProps,
  MultiTabState,
} from "./types";

export type { TabListProps } from "./components/TabList";
export type { TabTriggerProps } from "./components/TabTrigger";
export type { TabPanelProps } from "./components/TabPanel";
export type { TabPanelsProps } from "./components/TabPanels";
export type { TabCloseButtonProps } from "./components/TabCloseButton";
export type { UseMultiTabReturn } from "./hooks/useMultiTab";
export type { SearchParamsAdapterOptions } from "./adapters/search-params";
