import type { ComponentType, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Page Definition
// ---------------------------------------------------------------------------

/**
 * Definition of a page type that can be opened as a tab.
 *
 * @typeParam TData – Shape of the per-tab data store for this page.
 */
export interface PageDefinition<TData = Record<string, unknown>> {
  /** Unique identifier for this page type. */
  id: string;
  /** Default display label shown on the tab. */
  label: string;
  /** React component rendered inside the tab panel. */
  component: ComponentType<TabComponentProps<TData>>;
  /** Optional icon element displayed next to the label. */
  icon?: ReactNode;
  /** Whether this tab can be closed by the user. @default true */
  closable?: boolean;
}

// ---------------------------------------------------------------------------
// Tab Instance
// ---------------------------------------------------------------------------

/** Represents a single open tab at runtime. */
export interface TabInstance {
  /** Unique runtime identifier (auto-generated or user-provided). */
  instanceId: string;
  /** The `id` of the corresponding {@link PageDefinition}. */
  pageId: string;
  /** Display label for the tab. */
  label: string;
  /** Whether this tab can be closed. */
  closable: boolean;
}

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

/**
 * Props injected into every page component rendered inside a tab.
 *
 * @typeParam TData – Shape of the per-tab data store.
 */
export interface TabComponentProps<TData = Record<string, unknown>> {
  /** Unique instance identifier of the owning tab. */
  instanceId: string;
  /** Current data for this tab instance. */
  data: TData;
  /** Merge partial data into this tab's store. */
  setData: (update: Partial<TData>) => void;
}

// ---------------------------------------------------------------------------
// Actions & Options
// ---------------------------------------------------------------------------

/** Options accepted by `openTab`. */
export interface OpenTabOptions {
  /** Custom label (overrides the page definition's label). */
  label?: string;
  /** Custom instance ID (default: auto-generated). */
  instanceId?: string;
  /** Whether to activate the tab immediately. @default true */
  activate?: boolean;
}

// ---------------------------------------------------------------------------
// Internal State
// ---------------------------------------------------------------------------

/** Internal state managed by the provider's reducer. */
export interface MultiTabState {
  tabs: TabInstance[];
  activeTabId: string | null;
  tabData: Record<string, Record<string, unknown>>;
  /** Tracks the history of active tabs to restore the previous one on close. */
  activeTabHistory: string[];
}

// ---------------------------------------------------------------------------
// Context Value
// ---------------------------------------------------------------------------

/** Full context value exposed internally. */
export interface MultiTabContextValue {
  store: {
    getState: () => MultiTabState;
    subscribe: (listener: () => void) => () => void;
    dispatch: (action: { type: string; [key: string]: unknown }) => void;
  };
  registry: PageRegistry;
  openTab: (pageId: string, options?: OpenTabOptions) => string;
  closeTab: (instanceId: string) => void;
  activateTab: (instanceId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (instanceId: string) => void;
  setTabData: (instanceId: string, data: Record<string, unknown>) => void;
  getTabData: (instanceId: string) => Record<string, unknown>;
  removeTabData: (instanceId: string) => void;
}

// ---------------------------------------------------------------------------
// Page Registry
// ---------------------------------------------------------------------------

/** Immutable page registry returned by {@link createPageRegistry}. */
export interface PageRegistry {
  /** Registered page definitions. */
  pages: ReadonlyArray<PageDefinition>;
  /** Look up a page by its `id`. Returns `undefined` if not found. */
  getPage: (id: string) => PageDefinition | undefined;
}

// ---------------------------------------------------------------------------
// URL Adapter
// ---------------------------------------------------------------------------

/**
 * Adapter interface for syncing tab state with an external store (URL, etc.).
 *
 * Implement this to integrate with any routing solution.
 */
export interface URLAdapter {
  /** Read initial / current tab state from the external store. */
  read(): { tabs: string[]; activeTab: string | null } | null;
  /** Persist current tab state to the external store. */
  write(tabs: TabInstance[], activeTabId: string | null): void;
  /** Subscribe to external changes (e.g. browser back/forward). */
  subscribe?(callback: () => void): () => void;
  /** Cleanup resources. Called when the provider unmounts. */
  destroy?(): void;
}

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------

/** Props for {@link MultiTabProvider}. */
export interface MultiTabProviderProps {
  /** Page registry created via `createPageRegistry`. */
  registry: PageRegistry;
  /** Optional URL adapter for state persistence. */
  adapter?: URLAdapter;
  /** Tab to activate on first mount (instanceId). */
  defaultActiveTab?: string;
  children: ReactNode;
  /** Fired after a new tab is opened. */
  onTabOpen?: (instance: TabInstance) => void;
  /** Fired after a tab is closed. */
  onTabClose?: (instanceId: string) => void;
  /** Fired when the active tab changes. */
  onTabChange?: (instanceId: string) => void;
}
