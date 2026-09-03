import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SpotlightProvider } from "./spotlight";
import "./styles/global.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <SpotlightProvider>
      <App />
    </SpotlightProvider>
  </StrictMode>,
);
