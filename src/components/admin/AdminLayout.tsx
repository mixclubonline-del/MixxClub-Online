import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Navigation from '@/components/Navigation';
import {
  LayoutDashboard,
  Users,
  FileAudio,
  Image,
  Settings,
  Menu,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Audio', href: '/admin/audio', icon: FileAudio },
  { name: 'Contacts', href: '/admin/contacts', icon: Menu },
  { name: 'Job Postings', href: '/admin/jobs', icon: Menu },
  { name: 'Notifications', href: '/admin/notifications', icon: Menu },
  { name: 'Sessions', href: '/admin/sessions', icon: Menu },
  { name: 'Security', href: '/admin/security', icon: Settings },
  { name: 'Achievements', href: '/admin/achievements', icon: Menu },
  { name: 'Packages', href: '/admin/packages', icon: Settings },
  { name: 'Feature Flags', href: '/admin/features', icon: Settings },
  { name: 'Financial', href: '/admin/financial', icon: Settings },
  { name: 'Analytics', href: '/admin/analytics', icon: Settings },
  { name: 'Content', href: '/admin/content', icon: FileAudio },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Payouts', href: '/admin/payouts', icon: Settings },
  { name: 'Test Payments', href: '/admin/test-payments', icon: CreditCard },
  { name: 'Education Hub', href: '/admin/education', icon: Settings },
  { name: 'Marketplace', href: '/admin/marketplace', icon: Settings },
  { name: 'Integrations', href: '/admin/integrations', icon: Settings },
  { name: 'Community Milestones', href: '/admin/milestones', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent',
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  <NavItems />
                </nav>
                <div className="p-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-screen">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Admin Panel</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <NavItems />
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
