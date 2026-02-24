import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./styles/mixxglass.css";
// Analytics initialization disabled - add your GA4 and FB Pixel IDs to enable
// import { initGA } from "./lib/analytics";
// import { initFBPixel } from "./lib/fb-pixel";

// Initialize Google Analytics (disabled for launch)
// initGA();
// initFBPixel();

// Clear stale manual service workers and old caches
// This ensures users get the latest version after deployment
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) {
      // Unregister old manual sw.js (vite-plugin-pwa uses different path)
      if (reg.active?.scriptURL?.includes('/sw.js')) {
        reg.unregister();
      }
    }
  });

  // Clear old manual caches with mixclub- prefix
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((k) => {
        if (k.startsWith('mixclub-')) {
          caches.delete(k);
        }
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
