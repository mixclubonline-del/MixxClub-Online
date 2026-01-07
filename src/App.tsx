import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { MobileRouteGuard } from "@/components/mobile/MobileRouteGuard";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { TabletSideNav } from "@/components/mobile/TabletSideNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking } from "@/hooks/useAnalytics";
import { PrimeProvider } from "@/contexts/PrimeContext";
import PrimeConsole from "@/components/prime/PrimeConsole";
import PrimeStatusBar from "@/components/prime/PrimeStatusBar";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { TutorialLauncher } from "@/components/tutorial/TutorialLauncher";
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { GlobalPlayerProvider } from "@/contexts/GlobalPlayerContext";
import GlobalMusicPlayer from "@/components/player/GlobalMusicPlayer";
import { GlobalPrimeChat } from "@/components/prime/GlobalPrimeChat";
import { PageTransition } from "@/components/layouts/PageTransition";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { GlobalKeyboardShortcuts } from "@/components/GlobalKeyboardShortcuts";
import { ImmersiveAppShell } from "@/components/immersive/ImmersiveAppShell";
import { MobileOptimizations } from "@/components/MobileOptimizations";

// Route modules - organized by domain
import { publicRoutes, appRoutes, mobileRoutes, cityRoutes } from "@/routes";
import NotFound from "@/pages/NotFound";

// Desktop-only components wrapper (Prime Console/Status only)
const DesktopOnlyComponents = () => {
  const { deviceType } = useMobileDetect();

  if (deviceType !== "desktop") {
    return null;
  }

  return (
    <>
      <PrimeConsole />
      <PrimeStatusBar />
    </>
  );
};

// App content wrapper for analytics tracking
const AppContent = () => {
  usePageTracking();
  
  return (
    <ImmersiveAppShell>
      <PageTransition>
        <MobileRouteGuard />
        <OfflineIndicator />
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
        <PWAInstallPrompt />
      </PageTransition>
    </ImmersiveAppShell>
  );
};

// Global navigation wrapper component
const GlobalNavigation = () => {
  const { isPhone, isTablet } = useBreakpoint();

  return (
    <>
      {isPhone && <MobileBottomNav />}
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
              <PrimeProvider>
                <GlobalPlayerProvider>
                  <TutorialProvider>
                    <PWAInstallPrompt />
                    <AppContent />
                    <GlobalNavigation />
                    <GlobalInteractions />
                    <GlobalKeyboardShortcuts />
                    <MobileOptimizations />
                    <DesktopOnlyComponents />
                    <TutorialOverlay />
                    <GlobalAudioPlayer />
                    <GlobalMusicPlayer />
                    <GlobalPrimeChat />
                    {/* Tutorial launcher - only show on desktop, positioned to avoid cookie banner */}
                    <div className="fixed bottom-20 left-4 z-40 hidden lg:block">
                      <TutorialLauncher contextTutorials={["welcome-to-mixxclub", "setting-up-profile"]} />
                    </div>
                    <PerformanceMonitor />
                    <CookieConsent />
                  </TutorialProvider>
                </GlobalPlayerProvider>
              </PrimeProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
