import React from "react";
import { MenuItemProps } from "@/components/multipage/menuItems";
import { CollectMultiPageRegistry } from "@/decorators/MultiPage";

import.meta.glob("@/views/multipage/pages/*.tsx", {
  eager: true,
});

interface MultiPagesProps {
  tabs: Array<{ menuItem: MenuItemProps; instanceId: string }>;
  activeTab: string;
}

function MultiPages({ tabs, activeTab }: MultiPagesProps) {
  const views = CollectMultiPageRegistry();

  return (
    <main className="multi-page-container">
      {tabs.map((tab) => {
        const view = views.find((f) => f.menuId === tab.menuItem.id);

        return (
          <div
            key={tab.instanceId}
            className={`page-content ${activeTab === tab.instanceId ? "active" : "hidden"}`}>
            {view?.page && (
              <div className="page-instance">
                {React.cloneElement(view.page as React.ReactElement, {
                  key: tab.instanceId,
                })}
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}

export default MultiPages;
