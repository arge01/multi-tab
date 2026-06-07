import type { PageDefinition, PageRegistry } from "./types";

/**
 * Create an immutable page registry from an array of page definitions.
 *
 * @example
 * ```ts
 * const registry = createPageRegistry([
 *   { id: 'dashboard', label: 'Dashboard', component: DashboardPage },
 *   { id: 'settings',  label: 'Settings',  component: SettingsPage },
 * ]);
 * ```
 *
 * @throws If any page is missing `id`, `label`, or `component`.
 * @throws If duplicate `id` values are found.
 */
export function createPageRegistry(pages: PageDefinition[]): PageRegistry {
  const ids = new Set<string>();

  for (const page of pages) {
    if (!page.id) {
      throw new Error("react-multi-tab: Page definition must have an id.");
    }
    if (!page.label) {
      throw new Error(`react-multi-tab: Page "${page.id}" must have a label.`);
    }
    if (!page.component) {
      throw new Error(
        `react-multi-tab: Page "${page.id}" must have a component.`
      );
    }
    if (ids.has(page.id)) {
      throw new Error(`react-multi-tab: Duplicate page id: "${page.id}".`);
    }
    ids.add(page.id);
  }

  // Shallow-copy so mutations to the original array don't affect the registry.
  const frozen = [...pages];

  return {
    pages: frozen,
    getPage: (id: string) => frozen.find((p) => p.id === id),
  };
}
