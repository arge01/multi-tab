import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import { useInternalContext } from "../hooks/useInternalContext";

/**
 * Props for {@link TabCloseButton}.
 */
export interface TabCloseButtonProps {
  /** Instance ID of the tab to close. */
  instanceId: string;
  /** Custom content (default: `×`). */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Override the auto-generated aria-label. */
  "aria-label"?: string;
}

/**
 * Button that closes a specific tab.
 *
 * Renders nothing if the tab's `closable` property is `false`.
 * Prevents the click from bubbling to `TabTrigger` so it doesn't
 * accidentally activate the tab.
 *
 * @example
 * ```tsx
 * <TabTrigger instanceId={tab.instanceId}>
 *   {tab.label}
 *   <TabCloseButton instanceId={tab.instanceId} />
 * </TabTrigger>
 * ```
 */
export function TabCloseButton({
  instanceId,
  children,
  className,
  style,
  "aria-label": ariaLabel,
}: TabCloseButtonProps) {
  const { store, closeTab } = useInternalContext();
  const state = useSyncExternalStore(store.subscribe, store.getState);
  const tab = state.tabs.find((t) => t.instanceId === instanceId);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      closeTab(instanceId);
    },
    [instanceId, closeTab]
  );

  if (!tab || !tab.closable) return null;

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? `Close ${tab.label}`}
      className={className}
      style={style}
      onClick={handleClick}
      tabIndex={-1}
    >
      {children ?? "×"}
    </button>
  );
}
