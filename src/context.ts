import { createContext } from "react";
import type { MultiTabContextValue } from "./types";

/**
 * Internal React context — not exported from the public API.
 * Consumers interact via `useMultiTab` and `useTabData` hooks.
 */
export const MultiTabContext = createContext<MultiTabContextValue | null>(null);
