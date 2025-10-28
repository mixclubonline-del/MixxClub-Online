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

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
