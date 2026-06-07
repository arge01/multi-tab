import type { URLAdapter } from "../types";

/**
 * In-memory adapter — no URL synchronisation.
 *
 * This is the implicit default when no `adapter` prop is passed to
 * `MultiTabProvider`. Useful for embedded UIs or tests.
 */
export function memoryAdapter(): URLAdapter {
  return {
    read: () => null,
    write: () => {
      /* noop */
    },
  };
}
