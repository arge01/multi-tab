/**
 * Props for {@link TabPanel}.
 */
export interface TabPanelProps {
  /** Instance ID of the tab this panel belongs to. */
  instanceId: string;
  children: React.ReactNode;
  /** Whether the panel is hidden (inactive tab). */
  hidden?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Accessible tab panel.
 *
 * Implements the **WAI-ARIA** `tabpanel` role:
 * - `role="tabpanel"`
 * - `aria-labelledby` pointing to the matching `TabTrigger`
 * - `tabIndex={0}` for keyboard focusability
 * - Uses the `hidden` HTML attribute for inactive panels (keeps state
 *   mounted — no re-mount on tab switch).
 *
 * @example
 * ```tsx
 * <TabPanel instanceId={tab.instanceId} hidden={!isActive}>
 *   <MyPageComponent />
 * </TabPanel>
 * ```
 */
export function TabPanel({
  instanceId,
  children,
  hidden = false,
  className,
  style,
}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`rmt-tabpanel-${instanceId}`}
      aria-labelledby={`rmt-tab-${instanceId}`}
      tabIndex={0}
      hidden={hidden}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
