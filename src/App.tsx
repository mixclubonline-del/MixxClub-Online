import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/mobile/PWAUpdatePrompt";
import { MobileRouteGuard } from "@/components/mobile/MobileRouteGuard";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { SyncIndicator } from "@/components/mobile/SyncIndicator";

import { TabletSideNav } from "@/components/mobile/TabletSideNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking } from "@/hooks/useAnalytics";
import { PrimeProvider } from "@/contexts/PrimeContext";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { TutorialLauncher } from "@/components/tutorial/TutorialLauncher";
import { GlobalPlayerProvider } from "@/contexts/GlobalPlayerContext";
import { UniversalMediaPlayer } from "@/components/player/UniversalMediaPlayer";
import { GlobalPrimeChat } from "@/components/prime/GlobalPrimeChat";
import { PageTransition } from "@/components/layouts/PageTransition";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { PathfinderBeacon } from "@/components/walkthrough/PathfinderBeacon";
import { GlobalKeyboardShortcuts } from "@/components/GlobalKeyboardShortcuts";
import { ImmersiveAppShell } from "@/components/immersive/ImmersiveAppShell";
import { MobileOptimizations } from "@/components/MobileOptimizations";
import { DepthProvider } from "@/contexts/DepthContext";
import { PulseProvider } from "@/contexts/PulseContext";
import { EnergyTransition } from "@/components/pulse/PulseComponents";
import { UnlockCelebrationProvider } from "@/components/unlock/UnlockCelebrationProvider";

// Route modules - organized by domain
import { publicRoutes, appRoutes, mobileRoutes, cityRoutes } from "@/routes";
import NotFound from "@/pages/NotFound";

// Desktop-only components wrapper (reserved for future use)
const DesktopOnlyComponents = () => {
  return null;
};

// Mobile-only overlays — sync indicator + PWA update prompt
const MobileOnlyOverlays = () => {
  const { isMobile } = useMobileDetect();
  if (!isMobile) return null;

  return (
    <>
      <SyncIndicator />
      <PWAUpdatePrompt />
    </>
  );
};

// Global overlays — player is available for all users; chat/tutorial remain auth-gated
const AuthGatedOverlays = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <TutorialOverlay />}
      <UniversalMediaPlayer />
      {user && <GlobalPrimeChat />}
    </>
  );
};

// App content wrapper for analytics tracking
const AppContent = () => {
  usePageTracking();

  return (
    <ImmersiveAppShell>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg">
        Skip to content
      </a>
      <PageTransition>
        <MobileRouteGuard />
        <OfflineIndicator />
        <main id="main-content">
        <React.Suspense fallback={<DashboardSkeleton />}>
          <Routes>
            {/* Domain-specific route modules */}
            {publicRoutes}
            {appRoutes}
            {mobileRoutes}
            {cityRoutes}
            {/* Catch-all 404 - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
        </main>
        <PWAInstallPrompt />
      </PageTransition>
    </ImmersiveAppShell>
  );
};

// Global navigation wrapper component
// Note: MobileBottomNav removed — MobileEnhancedNav in AppLayout handles phone nav
// to prevent duplicate bottom bars on protected routes.
const GlobalNavigation = () => {
  const { isTablet } = useBreakpoint();

  return (
    <>
      {isTablet && <TabletSideNav />}
    </>
  );
};

// Global interactions - swipe navigation
const GlobalInteractions = () => {
  const { isPhone, isTablet } = useBreakpoint();
  useSwipeNavigation({ enabled: isPhone || isTablet });
  return null;
};

const App = () => {
  const { showSplash, handleSplashComplete } = useSplashScreen();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && (
            <SplashScreen onComplete={handleSplashComplete} duration={500} />
          )}
          <BrowserRouter>
            <AuthProvider>
              <DepthProvider>
                <PrimeProvider>
                  <GlobalPlayerProvider>
                    <TutorialProvider>
                      <PulseProvider>
                        <UnlockCelebrationProvider>
                          <EnergyTransition />
                          <AppContent />
                          <GlobalNavigation />
                          <GlobalInteractions />
                          <GlobalKeyboardShortcuts />
                          <MobileOptimizations />
                          <MobileOnlyOverlays />
                          <DesktopOnlyComponents />
                          <AuthGatedOverlays />
                          <PerformanceMonitor />
                          <CookieConsent />
                          <PathfinderBeacon />
                        </UnlockCelebrationProvider>
                      </PulseProvider>
                    </TutorialProvider>
                  </GlobalPlayerProvider>
                </PrimeProvider>
              </DepthProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
