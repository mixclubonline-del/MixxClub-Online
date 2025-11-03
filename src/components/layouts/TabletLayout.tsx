import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { RealTimeNotifications } from '@/components/RealTimeNotifications';
import { useAuth } from '@/hooks/useAuth';

interface TabletLayoutProps {
  children: ReactNode;
}

export function TabletLayout({ children }: TabletLayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Top Bar - Optimized for tablet */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger className="hover:bg-accent/10" />
              
              <div className="flex-1" />
              
              {user && <RealTimeNotifications userId={user.id} />}
            </div>
          </header>

          {/* Main Content - Optimized spacing for tablet */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
