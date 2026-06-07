# react-multi-tab

A headless, accessible, router-agnostic, and fully type-safe multi-tab component library for React.

[![npm version](https://img.shields.io/npm/v/react-multi-tab.svg)](https://npmjs.org/package/react-multi-tab)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Agnostic & Pluggable:** Works independently of any bundler or router. Includes adapters for memory, URL Search Params, and `react-router-dom`.
- **Headless & Accessible:** Follows the WAI-ARIA Tabs pattern. Complete keyboard navigation (`Arrow keys`, `Home`, `End`) out of the box. You control the styling.
- **TypeScript Generics:** Fully type-safe context, components, and hooks. Never use `any` again.
- **State Preservation:** Keeps tab content mounted when inactive (via `hidden` attribute) to preserve form states and scroll positions.

## 🚀 Performance & Developer Experience (DX)

We have built the core state-management of `react-multi-tab` to meet the highest performance and Developer Experience (DX) standards.

### 1. `useSyncExternalStore` (The Performance Boost)
We stripped the large object out of React Context and replaced it with a custom Vanilla JS store (`createMultiTabStore`). 
By utilizing React 18's `useSyncExternalStore`, components like `useTabData` now strictly subscribe to only the data they care about.

> **Why it matters:** Typing in an input field inside a specific tab will **NO LONGER** trigger a re-render across the entire Tab system. Only the component that called `useTabData` for that specific tab will update!

### 2. `TabInstanceContext` (The DX Boost)
Developers no longer need to manually pass down the cryptic `instanceId` to every page component.
Because `<TabPanels />` implicitly wraps your components with `<TabContent>`, it invisibly provides the context to all descendants.

```tsx
// Inside any page (e.g., A-Page.tsx)
const [data, setData] = useTabData<APageData>(); // Boom! Magic.
```
> `useTabData` automatically finds its own tab's context. If no context is found, it safely falls back to the globally active tab.

### 3. Built for Redux/Zustand Users
For teams that prefer keeping form data in a global Redux slice instead of our internal data store, we introduced the `useTabInstanceId()` hook.
```tsx
import { useTabInstanceId } from 'react-multi-tab';

function MyReduxPage() {
  const tabId = useTabInstanceId(); // Seamlessly gets the ID!
  
  const handleChange = () => {
    dispatch(updateFormSlice({ tabId, data: '...' }));
  }
}
```

### 4. Smart Tab History
When a tab is closed, the library remembers the exact history of your active tabs and gracefully falls back to the **previously active** tab instead of abruptly jumping to the end of the list. Exactly like VS Code!

## Installation

```bash
npm install react-multi-tab
# or
yarn add react-multi-tab
```

## Basic Usage

Here is a full example showing how to build a tabbed layout using the vanilla URL `searchParamsAdapter` and the new explicit page registry.

### 1. Define Your Pages & Registry

Create your page components and register them explicitly.

```tsx
// src/registry.ts
import { createPageRegistry, useTabData } from 'react-multi-tab';

interface DashboardData { filter?: string; }

function Dashboard({ instanceId }: { instanceId: string }) {
  // 100% Type-safe!
  const [data, setData] = useTabData<DashboardData>();
  
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Filter: {data.filter ?? 'None'}</p>
      <button onClick={() => setData({ filter: 'Active' })}>Set Filter</button>
    </div>
  );
}

function Settings() {
  return <h2>Settings</h2>;
}

// Create a bundler-agnostic registry
export const registry = createPageRegistry([
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'settings', label: 'Settings', component: Settings },
]);
```

### 2. Wrap with Provider & Build the Layout

Use the provided headless components to build your accessible tab interface. They include all necessary ARIA attributes and keyboard events.

```tsx
// src/App.tsx
import { 
  MultiTabProvider, 
  searchParamsAdapter,
  TabList, 
  TabTrigger, 
  TabCloseButton, 
  TabPanels,
  useMultiTab
} from 'react-multi-tab';
import { registry } from './registry';

function MainLayout() {
  const { tabs, openTab } = useMultiTab();

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar / Menu */}
      <nav style={{ width: 200 }}>
        <button onClick={() => openTab('dashboard')}>Open Dashboard</button>
        <button onClick={() => openTab('settings')}>Open Settings</button>
      </nav>

      <div style={{ flex: 1 }}>
        {/* Accessible Tab List */}
        <TabList aria-label="My Application Tabs">
          {tabs.map((tab) => (
            <TabTrigger key={tab.instanceId} instanceId={tab.instanceId}>
              {tab.label}
              <TabCloseButton instanceId={tab.instanceId} />
            </TabTrigger>
          ))}
        </TabList>

        {/* Renders all active and hidden tab panels */}
        <TabPanels />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MultiTabProvider 
      registry={registry}
      adapter={searchParamsAdapter()} // Syncs active tabs to the browser URL
    >
      <MainLayout />
    </MultiTabProvider>
  );
}
```

## Running the Playground

You can easily test the components locally using the built-in Playground!

1. Go to the project root directory.
2. Run the playground command:
```bash
yarn run dev:demo
```
3. Open `http://localhost:3000` to interact with the demo.

## Advanced Features

### React Router Integration

If you want to sync your tab state with React Router, you can use the optional adapter.

```tsx
import { MultiTabProvider } from 'react-multi-tab';
import { useReactRouterAdapter } from 'react-multi-tab/adapters/react-router';

function App() {
  const routerAdapter = useReactRouterAdapter();

  return (
    <MultiTabProvider registry={registry} adapter={routerAdapter}>
      <MainLayout />
    </MultiTabProvider>
  );
}
```

## License

MIT © Arif GEVENCİ
