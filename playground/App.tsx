import {
  MultiTabProvider,
  createPageRegistry,
  TabList,
  TabTrigger,
  TabCloseButton,
  TabPanels,
  useMultiTab,
  searchParamsAdapter,
} from "../src";
import APage from "./views/multipage/pages/A-Page";

// 1. Sayfaları Kaydedin (Registry)
const registry = createPageRegistry([
  { id: "a-page", label: "Dashboard (A Page)", component: APage },
  {
    id: "b-page",
    label: "Settings",
    component: () => <div className="p-6">Settings Page Content</div>,
  },
]);

// 2. Kenar Çubuğu (Menü) - Yeni Tab açmak için useMultiTab kullanır
function Sidebar() {
  const { openTab } = useMultiTab();

  return (
    <div className="w-64 bg-white shadow-lg z-10 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">react-multi-tab</h1>
        <p className="text-sm text-gray-500 mt-1">Playground</p>
      </div>
      <ul className="p-4 space-y-2">
        <li>
          <button
            onClick={() => openTab("a-page")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-gray-700"
          >
            Open Dashboard
          </button>
        </li>
        <li>
          <button
            onClick={() => openTab("b-page")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-gray-700"
          >
            Open Settings
          </button>
        </li>
      </ul>
    </div>
  );
}

// 3. Ana Uygulama Düzeni
function MainLayout() {
  const { tabs } = useMultiTab();

  return (
    <div className="flex h-screen bg-gray-50 w-full font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Listesi */}
        {tabs.length > 0 ? (
          <div className="bg-white border-b border-gray-200">
            <TabList className="flex items-center p-0 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <TabTrigger
                  key={tab.instanceId}
                  instanceId={tab.instanceId}
                  className="flex text-nowrap items-center border-r border-gray-200 px-4 py-3 text-sm font-medium transition-colors cursor-pointer data-[state=active]:border-t-2 data-[state=active]:border-t-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:bg-gray-50 data-[state=inactive]:text-gray-600 hover:bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {tab.label}
                  <TabCloseButton
                    instanceId={tab.instanceId}
                    className="ml-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </TabTrigger>
              ))}
            </TabList>
          </div>
        ) : (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-500">
              No tabs open. Select a page from the menu.
            </p>
          </div>
        )}

        {/* Tab İçerikleri */}
        <div className="flex-1 overflow-auto">
          <TabPanels className="h-full" />
        </div>
      </div>
    </div>
  );
}

// 4. Provider ile sarmalama
export default function App() {
  // Eğer Vanilla Search Params Adapter kullanmak istemezseniz,
  // react-router adaptörünü de kullanabilirsiniz. Biz playground'da
  // basitlik için searchParamsAdapter() kullanıyoruz.

  return (
    <MultiTabProvider registry={registry} adapter={searchParamsAdapter()}>
      <MainLayout />
    </MultiTabProvider>
  );
}
