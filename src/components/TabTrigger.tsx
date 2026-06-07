import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import { useInternalContext } from "../hooks/useInternalContext";

/**
 * Props for {@link TabTrigger}.
 */
export interface TabTriggerProps {
  /** Instance ID of the tab this trigger controls. */
  instanceId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

/**
 * Accessible tab trigger button.
 *
 * Implements the **WAI-ARIA** `tab` role:
 * - `role="tab"`
 * - `aria-selected` reflects active state
 * - `aria-controls` points to the matching `tabpanel`
 * - Roving `tabIndex` (`0` for active, `-1` for inactive)
 * - `Enter` / `Space` activates the tab
 *
 * @example
 * ```tsx
 * <TabTrigger instanceId={tab.instanceId}>
 *   {tab.label}
 *   <TabCloseButton instanceId={tab.instanceId} />
 * </TabTrigger>
 * ```
 */
export function TabTrigger({
  instanceId,
  children,
  className,
  style,
  disabled = false,
}: TabTriggerProps) {
  const { store, activateTab } = useInternalContext();
  const state = useSyncExternalStore(store.subscribe, store.getState);
  const isActive = state.activeTabId === instanceId;

  const handleClick = useCallback(() => {
    if (!disabled) activateTab(instanceId);
  }, [instanceId, disabled, activateTab]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault();
        activateTab(instanceId);
      }
    },
    [instanceId, disabled, activateTab]
  );

  return (
    <div
      role="tab"
      id={`rmt-tab-${instanceId}`}
      aria-selected={isActive}
      aria-controls={`rmt-tabpanel-${instanceId}`}
      tabIndex={isActive ? 0 : -1}
      className={className}
      style={style}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </div>
  );
}
