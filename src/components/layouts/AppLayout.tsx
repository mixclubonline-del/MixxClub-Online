import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { RealTimeNotifications } from '@/components/RealTimeNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileEnhancedNav } from '@/components/mobile/MobileEnhancedNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // On mobile, don't show sidebar - use mobile nav instead
  if (isMobile) {
    return (
      <>
        <MobileEnhancedNav />
        <main className="pb-20">
          {children}
        </main>
      </>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-accent/10" />
              
              <div className="flex-1" />
              
              {user && <RealTimeNotifications userId={user.id} />}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
