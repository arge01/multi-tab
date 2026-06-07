import { createContext, useContext } from "react";

/**
 * Context that provides the current tab instance ID.
 * This is meant to be wrapped around each rendered tab's content.
 */
export const TabInstanceContext = createContext<string | null>(null);

/**
 * Hook to retrieve the current tab's instance ID.
 * Throws an error if used outside a TabInstanceContext.
 * Extremely useful for integrating with Redux or when components
 * need to automatically know which tab they belong to.
 */
export function useTabInstanceId(): string {
  const instanceId = useContext(TabInstanceContext);
  if (!instanceId) {
    throw new Error(
      "react-multi-tab: useTabInstanceId must be used within a component rendered inside a Tab."
    );
  }
  return instanceId;
}
