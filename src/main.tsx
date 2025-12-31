import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CombinedProviders } from "./store/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CombinedProviders>
      <App />
    </CombinedProviders>
  </StrictMode>
);
