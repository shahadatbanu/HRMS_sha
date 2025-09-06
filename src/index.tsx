import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { base_path } from "./environment";
import store from "./core/data/redux/store";
import { Provider } from "react-redux";
import { UserProvider } from "./core/context/UserContext";

// Load only essential CSS first
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../src/index.scss";

// Lazy load heavy components
const ALLRoutes = React.lazy(() => import("./feature-module/router/router"));

// Lazy load other CSS files
const loadAdditionalStyles = () => {
  import("../src/style/css/feather.css");
  import("../src/style/icon/boxicons/boxicons/css/boxicons.min.css");
  import("../src/style/icon/weather/weathericons.css");
  import("../src/style/icon/typicons/typicons.css");
  import("../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css");
  import("../node_modules/@fortawesome/fontawesome-free/css/all.min.css");
  import("../src/style/icon/ionic/ionicons.css");
  import("../src/style/icon/tabler-icons/webfont/tabler-icons.css");
  // Import Bootstrap JS as a module
  import("../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js" as any).catch(() => {
    // Silently handle import error for JS file
  });
};

// Load additional styles after initial render
setTimeout(loadAdditionalStyles, 1000);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px'
  }}>
    Loading...
  </div>
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <UserProvider>
        <BrowserRouter basename={base_path}>
          <Suspense fallback={<LoadingFallback />}>
            <ALLRoutes />
          </Suspense>
        </BrowserRouter>
      </UserProvider>
    </Provider>
  </React.StrictMode>
);
