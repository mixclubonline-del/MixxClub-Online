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
// In dev/preview, unregister any existing SW to avoid stale UI/layouts
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.unregister();
  });
  if ('caches' in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
