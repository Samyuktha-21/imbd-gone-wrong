import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { SpotlightProvider } from "./spotlight";
import { WatchlistProvider } from "./watchlist";
import "./styles/global.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <WatchlistProvider>
        <SpotlightProvider>
          <App />
        </SpotlightProvider>
      </WatchlistProvider>
    </BrowserRouter>
  </StrictMode>,
);
