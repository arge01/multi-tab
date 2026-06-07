import { useCallback, useRef } from "react";

/**
 * Props for {@link TabList}.
 */
export interface TabListProps {
  children: React.ReactNode;
  /** Accessible label for the tab list. */
  "aria-label"?: string;
  /** ID of an element that labels the tab list. */
  "aria-labelledby"?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Accessible container for tab triggers.
 *
 * Implements the **WAI-ARIA Tabs** pattern:
 * - `role="tablist"`
 * - `Arrow Left / Right` — move focus between tabs
 * - `Home / End` — jump to first / last tab
 *
 * @example
 * ```tsx
 * <TabList aria-label="Open pages">
 *   {tabs.map(t => <TabTrigger key={t.instanceId} instanceId={t.instanceId} />)}
 * </TabList>
 * ```
 */
export function TabList({
  children,
  className,
  style,
  ...ariaProps
}: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabElements =
        listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
      if (!tabElements || tabElements.length === 0) return;

      const tabs = Array.from(tabElements);
      const currentIndex = tabs.findIndex(
        (el) => el === document.activeElement
      );

      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;

        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;

        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;

        case "End":
          e.preventDefault();
          nextIndex = tabs.length - 1;
          break;

        default:
          return;
      }

      if (nextIndex !== null) {
        tabs[nextIndex].focus();
      }
    },
    []
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      className={className}
      style={style}
      onKeyDown={handleKeyDown}
      {...ariaProps}
    >
      {children}
    </div>
  );
}
