import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.tsx";
import { DataProvider as Provider } from "@/components/multipage/Provider";
import "@/styles/index.scss";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
