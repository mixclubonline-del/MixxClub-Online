import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
// Analytics initialization disabled - add your GA4 and FB Pixel IDs to enable
// import { initGA } from "./lib/analytics";
// import { initFBPixel } from "./lib/fb-pixel";

// Initialize Google Analytics (disabled for launch)
// initGA();
// initFBPixel();

// Service worker auto-registered by vite-plugin-pwa

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
