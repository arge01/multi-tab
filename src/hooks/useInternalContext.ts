import { useContext } from "react";
import { MultiTabContext } from "../context";
import type { MultiTabContextValue } from "../types";

/**
 * Internal hook — use `useMultiTab` or `useTabData` instead.
 *
 * @throws If called outside a `<MultiTabProvider>`.
 * @internal
 */
export function useInternalContext(): MultiTabContextValue {
  const ctx = useContext(MultiTabContext);
  if (!ctx) {
    throw new Error(
      "react-multi-tab: Hooks must be used within a <MultiTabProvider>."
    );
  }
  return ctx;
}
