import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, Compass, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import mixxclub3DLogo from "@/assets/mixxclub-3d-logo.png";
import { RealTimeNotifications } from '../RealTimeNotifications';

interface AppStyleLayoutProps {
  children: ReactNode;
}

export const AppStyleLayout = ({ children }: AppStyleLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define navigation based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    if (userRole === 'engineer') {
      return [
        { icon: Home, label: 'Dashboard', path: '/engineer-crm' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: Compass, label: 'Services', path: '/services' },
      ];
    }
    
    if (userRole === 'admin') {
      return [
        { icon: Home, label: 'Admin', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Compass, label: 'Platform', path: '/' },
      ];
    }
    
    // Artist/default
    return [
      { icon: Home, label: 'Dashboard', path: '/artist-crm' },
      { icon: Compass, label: 'Services', path: '/services' },
      { icon: Users, label: 'Community', path: '/community' },
      { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    ];
  };

  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname.startsWith(path);

  if (!user) return <>{children}</>;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-20 bg-card border-r border-border">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-border">
          <button 
            onClick={() => navigate('/')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={mixxclub3DLogo} 
              alt="MixClub" 
              className="w-10 h-10 object-contain relative z-10 transition-transform group-hover:scale-110" 
            />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-8 space-y-2 px-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full h-14 flex items-center justify-center rounded-xl transition-all group relative ${
                isActive(path)
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title={label}
            >
              <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                isActive(path) ? 'scale-110' : ''
              }`} />
              {isActive(path) && (
                <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 space-y-2 border-t border-border">
          {user && (
            <div className="flex justify-center mb-2">
              <RealTimeNotifications userId={user.id} />
            </div>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="w-full h-14 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group"
            title="Settings"
          >
            <Settings className="w-6 h-6 transition-transform group-hover:rotate-45" />
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-lg border-b border-border z-50 flex items-center justify-between px-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <img src={mixxclub3DLogo} alt="Mixxclub" className="w-8 h-8" />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MIXXCLUB
          </span>
        </button>
        
        <div className="flex items-center gap-2">
          {user && <RealTimeNotifications userId={user.id} />}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="absolute right-0 top-16 bottom-0 w-64 bg-card border-l border-border p-4 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-2">
              {navItems.map(({ icon: Icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(path)
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-border space-y-2">
              <button
                onClick={() => {
                  navigate('/settings');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-all"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
              <Button
                onClick={signOut}
                variant="ghost"
                className="w-full justify-start"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-16">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
