import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { menuItems, MenuItemProps } from "@/components/multipage/menuItems";
import MultiPages from "@/views/multipage";

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tabs, setTabs] = useState<
    Array<{ menuItem: MenuItemProps; instanceId: string }>
  >([]);
  const [activeTab, setActiveTab] = useState<string>();

  // URL'den state'i yükle (sayfa yenilendiğinde)
  useEffect(() => {
    const tabsParam = searchParams.get("tabs");
    const activeParam = searchParams.get("active");

    if (tabsParam) {
      const decodedTabsParam = decodeURIComponent(tabsParam);
      const tabInstances = decodedTabsParam
        .split(",")
        .map((instanceId) => {
          const menuQuery = instanceId.split("-").slice(0, -1).join("-");
          const menuItem = menuItems.find((item) => item.query === menuQuery);
          return menuItem ? { menuItem, instanceId } : null;
        })
        .filter(
          (tab): tab is { menuItem: MenuItemProps; instanceId: string } =>
            tab !== null
        );

      setTabs(tabInstances);

      if (
        activeParam &&
        tabInstances.some((tab) => tab?.instanceId === activeParam)
      ) {
        setActiveTab(activeParam);
      } else if (tabInstances.length > 0) {
        setActiveTab(tabInstances?.[tabInstances.length - 1]?.instanceId);
      }
    }
  }, []);

  // Tab'lar veya aktif tab değiştiğinde URL'yi güncelle
  useEffect(() => {
    if (tabs.length > 0 && activeTab) {
      const tabIds = tabs.map((tab) => tab.instanceId);
      setSearchParams({
        tabs: tabIds.join(","),
        active: activeTab,
      });
    } else if (tabs.length === 0) {
      setSearchParams({});
    }
  }, [tabs, activeTab, setSearchParams]);

  const handleMenuClick = (menuItem: MenuItemProps) => {
    const instanceId = `${menuItem.query}-${Date.now()}`;

    setTabs((prev) => {
      const newTabs = [...prev, { menuItem, instanceId }];
      return newTabs;
    });

    setActiveTab(instanceId);
  };

  const closeTab = (instanceId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((tab) => tab.instanceId !== instanceId);

      // Eğer kapatılan tab aktifse, başka bir tabi aktif yap
      if (instanceId === activeTab && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].instanceId);
      } else if (newTabs.length === 0) {
        setActiveTab("");
      }

      return newTabs;
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Ana Menü - Sol Sidebar */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <ul className="main-menu p-4 space-y-2">
            {menuItems.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => handleMenuClick(v)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 font-medium text-gray-700">
                  {v.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar - Üst Kısım */}
          {tabs.length > 0 && (
            <div className="bg-white border-b border-gray-200">
              <ul className="multi-tab flex items-center px-4">
                {tabs.map((tab) => (
                  <li
                    key={tab.instanceId}
                    className={`flex items-center border-r border-gray-200 ${
                      activeTab === tab.instanceId
                        ? "bg-white border-t-2 border-t-blue-500"
                        : "bg-gray-100"
                    }`}>
                    <button
                      onClick={() => setActiveTab(tab.instanceId)}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        activeTab === tab.instanceId
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      {tab.menuItem.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.instanceId);
                      }}
                      className="tab-close px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <MultiPages tabs={tabs} activeTab={activeTab || ""} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
